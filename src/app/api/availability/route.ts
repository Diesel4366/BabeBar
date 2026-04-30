import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select('start_time, end_time')
      .eq('date', date)
      .eq('status', 'active');

    if (error) throw error;

    // Возвращаем массив интервалов [{start: '10:00', end: '11:30'}, ...]
    const occupiedIntervals = appointments.map(app => ({
      start: app.start_time.substring(0, 5),
      end: app.end_time.substring(0, 5)
    }));

    return NextResponse.json({ occupiedIntervals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
