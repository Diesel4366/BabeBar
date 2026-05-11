import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhookToken } from '@/lib/tinkoff';

export async function POST(req: Request) {
  try {
    const params = await req.json();

    if (!verifyWebhookToken(params)) {
      console.error('Tinkoff webhook: invalid token', params);
      return new NextResponse('FORBIDDEN', { status: 403 });
    }

    const appointmentId = params['OrderId'] as string;
    const tinkoffPaymentId = String(params['PaymentId']);
    const status = params['Status'] as string;

    if (status === 'CONFIRMED') {
      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'active', payment_status: 'paid', payment_id: tinkoffPaymentId })
        .eq('id', appointmentId)
        .eq('status', 'pending_payment')
        .select(`
          date, start_time, end_time, total_price, prepaid_amount,
          client:profiles(name, phone, telegram_username, telegram_chat_id, telegram_id),
          services:appointment_services(service:services(name))
        `)
        .single();

      if (appointment) {
        await sendNotifications(appointment);
      }
    } else if (['REJECTED', 'CANCELLED', 'DEADLINE_EXPIRED'].includes(status)) {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled_by_client', payment_status: 'failed', payment_id: tinkoffPaymentId })
        .eq('id', appointmentId)
        .eq('status', 'pending_payment');
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Tinkoff webhook error:', err);
    return new NextResponse('ERROR', { status: 500 });
  }
}

async function sendNotifications(appointment: any) {
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (!telegramToken) return;

  const profile = appointment.client as any;
  const serviceNames = (appointment.services as any[]).map((s: any) => s.service?.name).filter(Boolean).join(', ');
  const dateFormatted = new Date(appointment.date + 'T12:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', weekday: 'long',
  });
  const time = appointment.start_time?.substring(0, 5);
  const endTime = appointment.end_time?.substring(0, 5);

  // Уведомление администраторам
  if (chatIds.length) {
    let msg = `🌟 *Новая запись!* _(оплата подтверждена)_\n\n👤 *Клиент:* ${profile?.name}\n📞 *Телефон:* ${profile?.phone}`;
    if (profile?.telegram_username) msg += `\n✈️ *Telegram:* @${profile.telegram_username}`;
    const prepaid = appointment.prepaid_amount ?? 0;
  const remaining = (appointment.total_price ?? 0) - prepaid;
  msg += `\n📅 *Дата:* ${dateFormatted}\n⏰ *Время:* ${time} — ${endTime}\n💅 *Услуги:* ${serviceNames}\n💰 *Сумма:* ${appointment.total_price} ₽`;
  if (prepaid > 0) {
    msg += `\n✅ *Оплачено онлайн:* ${prepaid} ₽`;
    if (remaining > 0) msg += `\n🏠 *При визите:* ${remaining} ₽`;
  }
    await Promise.allSettled(chatIds.map(chatId =>
      fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
      })
    ));
  }

  // Уведомление клиенту
  const clientChatId = profile?.telegram_chat_id || profile?.telegram_id;
  if (clientChatId) {
    const { getSettings } = await import('@/lib/settings');
    const settings = await getSettings();
    let msg = `✅ *Запись и оплата подтверждены!*\n\n📅 *Дата:* ${dateFormatted}\n⏰ *Время:* ${time} — ${endTime}\n💅 *Услуги:* ${serviceNames}\n💰 *Сумма:* ${appointment.total_price} ₽`;
    if (settings.address) msg += `\n\n📍 *Адрес:* ${settings.address}`;
    msg += `\n\nБудем рады вас видеть! 🌸`;
    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: clientChatId, text: msg, parse_mode: 'Markdown' }),
    });
  }
}
