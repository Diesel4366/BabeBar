# 🤖 AI Onboarding: BabeBar Project

Привет! Если ты читаешь это, значит тебе нужно продолжить работу над проектом **BabeBar** (BeautyBook). Вот всё, что тебе нужно знать, чтобы не тратить токены на лишние вопросы.

## 🎯 Суть проекта
Это система автоматизации для салона красоты (BabeBar). 
- **Клиенты** записываются через Telegram-бота.
- **Админы** управляют услугами и мастерами через веб-интерфейс (Next.js).
- **Данные** живут в Supabase.

## 🏗 Стек технологий
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database/Auth:** Supabase
- **Deployment:** Vercel (автодеплой из GitHub)
- **Bot API:** Telegram Bot API (Webhooks)

## 📂 Ключевые файлы
- `src/lib/supabase.ts` — инициализация клиента базы данных.
- `src/app/api/telegram/route.ts` — сердце бота (webhook handler).
- `src/app/admin/services/page.tsx` — управление услугами.
- `setup_db.js` — скрипт для первичной настройки таблиц в Supabase.

## 🔐 Где лежат ключи?
Все секреты находятся в `.env.local` (локально) и в настройках Vercel (в облаке).
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TELEGRAM_TOKEN`

## 🚀 Как продолжить работу?
1. Проверь статус базы: `node test_connection.js`.
2. Запусти локально: `npm run dev`.
3. Бот тестируется через проброс порта (например, ngrok) или напрямую через деплой на Vercel.

## 📓 Дополнительная информация
Более подробные записи, логика бизнес-процессов и история изменений лежат в Obsidian по пути:
`~/Documents/Obsidian/Мой мир/BabeBar/`

Действуй смело, код структурирован!
