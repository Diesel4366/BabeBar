import { supabaseAdmin } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';

export async function sendBookingNotifications(appointmentId: string) {
  const telegramToken = process.env.TELEGRAM_TOKEN;
  if (!telegramToken) return;

  const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? '')
    .split(',').map(s => s.trim()).filter(Boolean);

  const { data } = await supabaseAdmin
    .from('appointments')
    .select(`
      date, start_time, end_time, total_price, prepaid_amount,
      client:profiles(name, phone, telegram_username, telegram_chat_id, telegram_id),
      services:appointment_services(service:services(name))
    `)
    .eq('id', appointmentId)
    .single();

  if (!data) return;

  const profile = (data.client as unknown) as { name: string; phone: string; telegram_username?: string; telegram_chat_id?: string; telegram_id?: string } | null;
  const serviceNames = ((data.services as unknown) as { service: { name: string } | null }[])
    .map(s => s.service?.name).filter(Boolean).join(', ');
  const dateFormatted = new Date(data.date + 'T12:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', weekday: 'long',
  });
  const time = data.start_time?.substring(0, 5);
  const endTime = data.end_time?.substring(0, 5);
  const prepaid = data.prepaid_amount ?? 0;
  const remaining = (data.total_price ?? 0) - prepaid;

  // Экранируем спецсимволы HTML чтобы не ломать parse_mode: 'HTML'
  const esc = (s?: string | null) =>
    (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  console.log(`[notifications] chatIds: ${chatIds.length}, appointmentId: ${appointmentId}`);

  if (chatIds.length) {
    let msg = `🌟 <b>Новая запись!</b>${prepaid > 0 ? ' <i>(оплата подтверждена)</i>' : ''}\n\n👤 <b>Клиент:</b> ${esc(profile?.name)}\n📞 <b>Телефон:</b> ${esc(profile?.phone)}`;
    if (profile?.telegram_username) msg += `\n✈️ <b>Telegram:</b> @${esc(profile.telegram_username)}`;
    msg += `\n📅 <b>Дата:</b> ${esc(dateFormatted)}\n⏰ <b>Время:</b> ${time} — ${endTime}\n💅 <b>Услуги:</b> ${esc(serviceNames)}\n💰 <b>Сумма:</b> ${data.total_price} ₽`;
    if (prepaid > 0) {
      msg += `\n✅ <b>Оплачено онлайн:</b> ${prepaid} ₽`;
      if (remaining > 0) msg += `\n🏠 <b>При визите:</b> ${remaining} ₽`;
    }

    const results = await Promise.allSettled(chatIds.map(async chatId => {
      const r = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
      });
      const body = await r.json();
      if (!body.ok) console.error(`[notifications] admin TG error chatId=${chatId}:`, JSON.stringify(body));
      return body;
    }));
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`[notifications] admin fetch failed chatId=${chatIds[i]}:`, r.reason);
    });
  } else {
    console.warn('[notifications] TELEGRAM_ADMIN_CHAT_IDS is empty — no admin notification sent');
  }

  const clientChatId = profile?.telegram_chat_id || profile?.telegram_id;
  if (clientChatId) {
    const settings = await getSettings();
    let msg = `✅ <b>Запись${prepaid > 0 ? ' и оплата' : ''} подтверждены!</b>\n\n📅 <b>Дата:</b> ${esc(dateFormatted)}\n⏰ <b>Время:</b> ${time} — ${endTime}\n💅 <b>Услуги:</b> ${esc(serviceNames)}\n💰 <b>Сумма:</b> ${data.total_price} ₽`;
    if (settings.address) msg += `\n\n📍 <b>Адрес:</b> ${esc(settings.address)}`;
    msg += `\n\nБудем рады вас видеть! 🌸`;
    const r = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: clientChatId, text: msg, parse_mode: 'HTML' }),
    });
    const body = await r.json();
    if (!body.ok) console.error('[notifications] client TG error:', JSON.stringify(body));
  }
}
