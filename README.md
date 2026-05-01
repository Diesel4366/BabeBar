# BabeBar / BeautyBook 💄

Платформа для онлайн-записи в салоны красоты через веб-интерфейс и Telegram-бота. Проект ориентирован на премиальный пользовательский опыт и автоматизацию взаимодействия с клиентами.

## 🌟 Основные возможности
- **Онлайн-запись**: Интуитивный выбор услуг, даты и времени через сайт и Telegram.
- **Интеграция с Telegram**: Полноценный бот для записи и уведомлений.
- **Синхронизация данных**: Использование Supabase как единого источника истины для записей и графиков.
- **Премиальный дизайн**: Современный интерфейс с использованием Tailwind 4 и анимаций Framer Motion.

## 🛠 Технологический стек
- **Frontend**: [Next.js 16.2.4](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Стилизация**: [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (иконки)
- **Анимации**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth)
- **Инструментарий**: TypeScript, ESLint, Date-fns

## ⚙️ Настройка и запуск

### 1. Переменные окружения
Создайте файл `.env.local` в корне проекта и добавьте следующие ключи:
```env
NEXT_PUBLIC_SUPABASE_URL=ваш_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_ключ
SUPABASE_SERVICE_ROLE_KEY=ваш_role_key
TELEGRAM_BOT_TOKEN=токен_вашего_бота
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Запуск в режиме разработки
```bash
npm run dev
```
Откройте [http://localhost:3000](http://localhost:3000) для просмотра сайта.

## 🗺 Дорожная карта (Roadmap)
- [ ] Реализация темной темы (Premium Dark Theme).
- [ ] OTP-авторизация для клиентов на сайте.
- [ ] Панель администратора (`/admin`) для управления записями.
- [ ] Автоматические напоминания о записях через Telegram.
