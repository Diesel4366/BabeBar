const { Client } = require('pg');

// Используем Transaction Pooler (порт 6543) для совместимости с IPv4
const connectionString = 'postgresql://postgres:Uvbuuvbu4366%40@db.lrnajodxfwegimnwnbdd.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

const sql = `
  -- Создаем таблицу услуг
  CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Включаем Row Level Security (но пока отключаем для простоты разработки)
  ALTER TABLE services DISABLE ROW LEVEL SECURITY;
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE appointment_services DISABLE ROW LEVEL SECURITY;
  ALTER TABLE schedule_rules DISABLE ROW LEVEL SECURITY;
  ALTER TABLE schedule_exceptions DISABLE ROW LEVEL SECURITY;

  -- Таблица записей
  CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES profiles(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'active',
    total_price INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Таблица связей записей и услуг
  CREATE TABLE IF NOT EXISTS appointment_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE
  );

  -- Таблица графика работы
  CREATE TABLE IF NOT EXISTS schedule_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working BOOLEAN DEFAULT true
  );

  -- Таблица исключений графика
  CREATE TABLE IF NOT EXISTS schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working BOOLEAN DEFAULT true
  );
`;

async function setup() {
  try {
    console.log('Подключаемся к базе данных Supabase...');
    await client.connect();
    
    console.log('Создаем таблицы и настраиваем политики безопасности...');
    await client.query(sql);
    
    console.log('✅ База данных успешно настроена!');
  } catch (err) {
    console.error('❌ Ошибка при настройке базы:', err.message);
  } finally {
    await client.end();
  }
}

setup();
