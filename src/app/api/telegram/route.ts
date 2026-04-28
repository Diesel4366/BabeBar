import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

export async function POST(req: Request) {
  if (!TELEGRAM_TOKEN) {
    return NextResponse.json({ error: 'Telegram token not set' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { message, callback_query } = body;

    // Обработка текстовых сообщений
    if (message) {
      const chatId = message.chat.id;
      const text = message.text;

      if (text === '/start') {
        await sendTelegramMessage(chatId, 'Добро пожаловать в BABEBAR! 🌟\n\nЯ помогу вам записаться на наши услуги. Выберите действие ниже:', {
          inline_keyboard: [
            [{ text: '💅 Посмотреть услуги', callback_data: 'view_services' }],
            [{ text: '📅 Мои записи', callback_data: 'my_appointments' }]
          ]
        });
      }
    }

    // Обработка нажатий на кнопки
    if (callback_query) {
      const chatId = callback_query.message.chat.id;
      const data = callback_query.data;

      if (data === 'view_services') {
        const { data: services } = await supabaseAdmin
          .from('services')
          .select('*')
          .eq('is_active', true);

        if (services && services.length > 0) {
          const buttons = services.map(s => ([{
            text: `\${s.name} - \${s.price} ₽`,
            callback_data: `service_\${s.id}`
          }]));
          
          await sendTelegramMessage(chatId, 'Выберите интересующую вас услугу:', {
            inline_keyboard: buttons
          });
        } else {
          await sendTelegramMessage(chatId, 'К сожалению, услуг пока нет.');
        }
      }

      if (data.startsWith('service_')) {
        const serviceId = data.split('_')[1];
        // Здесь будет логика выбора даты и времени
        await sendTelegramMessage(chatId, 'Вы выбрали услугу. В данный момент я настраиваю календарь для выбора даты. Скоро всё заработает!');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot\${TELEGRAM_TOKEN}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text: text,
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
