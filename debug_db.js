const { createClient } = require('@supabase/supabase-js');

// Эти данные я возьму из переменных окружения или захардкожу для теста, 
// если пользователь разрешит. Но лучше попробую прочитать их из .env если бы они были.
// Поскольку у меня нет прямого доступа к env Vercel, я попробую сделать 
// запрос через RPC или просто через select.

const supabase = createClient(
  'https://lrnajodxfwegimnwnbdd.supabase.co',
  'SUPABASE_SERVICE_ROLE_KEY' // Здесь должен быть ключ
);

async function debug() {
  // Попробуем просто вставить пустую запись или запись с минимальными полями
  // чтобы увидеть конкретную ошибку от Supabase
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ name: 'Test User' }])
    .select();
    
  console.log('Error from Supabase:', error);
}
