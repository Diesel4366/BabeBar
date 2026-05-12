import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/userAuth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const store = await cookies();
  const token = store.get('user_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profileId = await verifyUserToken(token, process.env.ADMIN_SECRET!);
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, date, start_time, end_time, status, total_price, created_at,
      appointment_services(
        services(name, price, duration_minutes)
      )
    `)
    .eq('client_id', profileId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE(req: Request) {
  const store = await cookies();
  const token = store.get('user_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profileId = await verifyUserToken(token, process.env.ADMIN_SECRET!);
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data: appt } = await supabaseAdmin
    .from('appointments')
    .select(`
      id, date, start_time, status,
      profiles(name, phone, telegram_username, telegram_chat_id, telegram_id),
      appointment_services(services(name))
    `)
    .eq('id', id)
    .eq('client_id', profileId)
    .single();

  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (appt.status !== 'active') return NextResponse.json({ error: 'Cannot cancel' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('appointments')
    .update({ status: 'cancelled_by_client' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Уведомление мастерам об отмене
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const rawChatIds = process.env.TELEGRAM_ADMIN_CHAT_IDS ?? '';
  const chatIds = rawChatIds.split(',').map(s => s.trim()).filter(Boolean);

  if (telegramToken) {
    try {
      const client = (appt as any).profiles;
      const dateFormatted = new Date(appt.date + 'T12:00:00').toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', weekday: 'long',
      });
      const services = (appt as any).appointment_services
        .map((s: any) => s.services?.name).filter(Boolean).join(', ');
      const esc = (s?: string | null) =>
        (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Уведомление администраторам
      if (chatIds.length > 0) {
        let message = `🔴 <b>ОТМЕНА ЗАПИСИ!</b>\n\n👤 <b>Клиент:</b> ${esc(client?.name) || '—'}\n📞 <b>Телефон:</b> ${esc(client?.phone) || '—'}`;
        if (client?.telegram_username) message += `\n✈️ <b>Telegram:</b> @${esc(client.telegram_username)}`;
        message += `\n📅 <b>Дата:</b> ${esc(dateFormatted)}\n⏰ <b>Время:</b> ${appt.start_time.substring(0, 5)}\n💅 <b>Услуги:</b> ${esc(services)}`;

        await Promise.allSettled(chatIds.map(async chatId => {
          const r = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
          });
          const body = await r.json();
          if (!body.ok) console.error(`[cancel] admin TG error chatId=${chatId}:`, JSON.stringify(body));
        }));
      }

      // Подтверждение клиенту об отмене
      const clientChatId = client?.telegram_chat_id || client?.telegram_id;
      if (clientChatId) {
        const clientMsg = `❌ <b>Ваша запись отменена</b>\n\n📅 <b>Дата:</b> ${esc(dateFormatted)}\n⏰ <b>Время:</b> ${appt.start_time.substring(0, 5)}\n💅 <b>Услуги:</b> ${esc(services)}\n\nЕсли хотите записаться на другое время — мы всегда рады! 🌸`;
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: clientChatId, text: clientMsg, parse_mode: 'HTML' }),
        });
      }
    } catch (e) {
      console.error('Failed to send cancel notification:', e);
    }
  }

  return NextResponse.json({ ok: true });
}
