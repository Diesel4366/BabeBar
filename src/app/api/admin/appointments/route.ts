import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const status = searchParams.get('status') ?? 'all';
    const dateFilter = searchParams.get('dateFilter') ?? 'all';
    const search = searchParams.get('search')?.trim() ?? '';

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabaseAdmin
      .from('appointments')
      .select(
        `*,
        client:profiles${search ? '!inner' : ''}(name, phone, telegram_username),
        services:appointment_services(service:services(id, name, price, duration_minutes))`,
        { count: 'exact' }
      )
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })
      .range(from, to);

    if (status !== 'all') query = query.eq('status', status);
    if (dateFilter === 'today') query = query.eq('date', today);
    if (dateFilter === 'week') query = query.gte('date', weekAgo);
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`, { foreignTable: 'profiles' });
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const formattedData = (data ?? []).map((app: any) => ({
      id: app.id,
      date: app.date,
      startTime: app.start_time,
      endTime: app.end_time,
      status: app.status,
      totalPrice: app.total_price,
      prepaidAmount: app.prepaid_amount ?? 0,
      paymentStatus: app.payment_status ?? 'not_required',
      source: app.source ?? null,
      client: app.client,
      services: app.services.map((s: any) => s.service),
    }));

    return NextResponse.json({ data: formattedData, total: count ?? 0 });
  } catch (error: any) {
    console.error('Admin appointments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        profiles (name, telegram_id, telegram_chat_id),
        appointment_services (services (name))
      `)
      .single();

    if (error) throw error;

    // Уведомления в Telegram
    const telegramToken = process.env.TELEGRAM_TOKEN;
    if (telegramToken && data) {
      const profile = data.profiles as any;
      const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
      const serviceNames = (data.appointment_services as any[])
        ?.map((s: any) => s.services?.name).filter(Boolean).join(', ') || 'Услуга';
      const dateFormatted = new Date(data.date + 'T12:00:00').toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', weekday: 'long',
      });
      const esc = (s?: string | null) =>
        (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const clientChatId = profile?.telegram_chat_id || profile?.telegram_id;

      if (status === 'cancelled_by_admin') {
        // Клиенту — запись отменена администратором
        if (clientChatId) {
          await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: clientChatId,
              text: `❌ <b>Ваша запись отменена</b>\n\n📅 <b>Дата:</b> ${esc(dateFormatted)}\n⏰ <b>Время:</b> ${data.start_time.substring(0, 5)} — ${data.end_time.substring(0, 5)}\n💅 <b>Услуги:</b> ${esc(serviceNames)}\n\nЕсли хотите записаться на другое время — просто напишите нам 🌸`,
              parse_mode: 'HTML',
            }),
          });
        }
        // Администраторам — кто отменил (видно в чате что запись снята)
        if (chatIds.length) {
          const msg = `🔴 <b>Запись отменена администратором</b>\n\n👤 <b>Клиент:</b> ${esc(profile?.name)}\n📅 <b>Дата:</b> ${esc(dateFormatted)}\n⏰ <b>Время:</b> ${data.start_time.substring(0, 5)} — ${data.end_time.substring(0, 5)}\n💅 <b>Услуги:</b> ${esc(serviceNames)}`;
          await Promise.allSettled(chatIds.map(chatId =>
            fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
            })
          ));
        }
      } else if (status === 'completed') {
        // Клиенту — визит завершён
        if (clientChatId) {
          await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: clientChatId,
              text: `✅ <b>Визит завершён!</b>\n\nСпасибо, что выбрали нас 🌸\n💅 <b>Услуги:</b> ${esc(serviceNames)}\n\nБудем рады видеть вас снова!`,
              parse_mode: 'HTML',
            }),
          });
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
