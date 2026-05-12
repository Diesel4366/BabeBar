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

  if (chatIds.length) {
    let msg = `🌟 *Новая запись!*${prepaid > 0 ? ' _(оплата подтверждена)_' : ''}\n\n👤 *Клиент:* ${profile?.name}\n📞 *Телефон:* ${profile?.phone}`;
    if (profile?.telegram_username) msg += `\n✈️ *Telegram:* @${profile.telegram_username}`;
    msg += `\n📅 *Дата:* ${dateFormatted}\n⏰ *Время:* ${time} — ${endTime}\n💅 *Услуги:* ${serviceNames}\n💰 *Сумма:* ${data.total_price} ₽`;
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

  const clientChatId = profile?.telegram_chat_id || profile?.telegram_id;
  if (clientChatId) {
    const settings = await getSettings();
    let msg = `✅ *Запись${prepaid > 0 ? ' и оплата' : ''} подтверждены!*\n\n📅 *Дата:* ${dateFormatted}\n⏰ *Время:* ${time} — ${endTime}\n💅 *Услуги:* ${serviceNames}\n💰 *Сумма:* ${data.total_price} ₽`;
    if (settings.address) msg += `\n\n📍 *Адрес:* ${settings.address}`;
    msg += `\n\nБудем рады вас видеть! 🌸`;
    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: clientChatId, text: msg, parse_mode: 'Markdown' }),
    });
  }
}
