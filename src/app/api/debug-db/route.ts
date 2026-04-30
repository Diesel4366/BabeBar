import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const sql = `
    ALTER TABLE services DISABLE ROW LEVEL SECURITY;
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
    ALTER TABLE appointment_services DISABLE ROW LEVEL SECURITY;
    ALTER TABLE schedule_rules DISABLE ROW LEVEL SECURITY;
    ALTER TABLE schedule_exceptions DISABLE ROW LEVEL SECURITY;
  `;

  try {
    // В Supabase-js нет прямого метода для выполнения произвольного SQL, 
    // если не создана функция RPC.
    // Но мы можем попробовать выполнить запрос к любой таблице, чтобы проверить связь
    const { data, error } = await supabaseAdmin.from('appointments').select('id').limit(1);
    
    if (error) throw error;

    return NextResponse.json({ 
      message: 'Connection successful', 
      data,
      note: 'Please run SQL commands manually in Supabase Dashboard SQL Editor to disable RLS'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
