export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const token = process.env.TELEGRAM_TOKEN;
  if (!token) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://babebar.ru/api/telegram' }),
    });
    const data = await res.json();
    if (data.ok) {
      console.log('[Telegram] Webhook registered:', data.description);
    } else {
      console.error('[Telegram] Webhook registration failed:', data.description);
    }
  } catch (e) {
    console.error('[Telegram] Webhook registration error:', e);
  }
}
