# 🤖 AI Onboarding: BabeBar Project

Привет! Если ты читаешь это, значит тебе нужно продолжить работу над проектом **BabeBar** (BeautyBook).

## 🎯 Текущий статус (02.05.2026)
Авторизация через Telegram полностью исправлена и работает. Мы перешли со старых виджетов на современный **OpenID Connect (OIDC)**.

## 🏗 Стек технологий
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database/Auth:** Supabase
- **Auth Protocol:** Telegram OIDC (Direct Auth) ✅
- **Deployment:** Vercel

## 📂 Ключевые файлы
- `src/lib/userAuth.ts` — логика проверки Telegram Hash и обмена `code` на токен профиля.
- `src/app/api/auth/telegram/callback/route.ts` — обработчик возврата из Telegram.
- `src/app/login/page.tsx` — страница входа с прямой ссылкой на OIDC.
- `src/app/profile/page.tsx` — личный кабинет клиента.

## 🔐 Переменные окружения (Vercel)
Для работы авторизации **обязательно** нужны:
- `TELEGRAM_CLIENT_ID` — (8752821995)
- `TELEGRAM_CLIENT_SECRET` — секрет из раздела "Direct Auth" в BotFather.
- `TELEGRAM_TOKEN` — обычный токен бота.
- `ADMIN_SECRET` — ключ для подписи сессионных кук.

## ⚠️ Важные нюансы
1. **Telegram ID**: Всегда храни и обрабатывай как **STRING** (в БД это тип `TEXT`). Новые ID слишком длинные для `BIGINT`.
2. **Кириллица**: При декодировании JWT из Telegram используй UTF-8 (реализовано в `userAuth.ts`).
3. **Database**: Таблица `profiles` имеет автогенерацию UUID для `id`.

## 📓 Дополнительная информация
Все подробности сессий и архитектурные решения лежат в Obsidian:
`~/Documents/Obsidian/Мой мир/02_Other_Bots/BabeBar/`

Действуй смело, система стабильна!
