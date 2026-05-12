import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data } = await supabaseAdmin
    .from('appointments')
    .select('status, payment_status, date, start_time, total_price, appointment_services ( services ( name ) )')
    .eq('id', id)
    .single();

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  type AppRow = typeof data & {
    appointment_services: { services: { name: string } | null }[];
  };
  const row = data as AppRow;
  const services = (row.appointment_services ?? [])
    .map(as => as.services?.name)
    .filter(Boolean) as string[];

  return NextResponse.json({
    status: data.status,
    paymentStatus: data.payment_status,
    date: data.date,
    startTime: data.start_time,
    totalPrice: data.total_price,
    services,
  });
}
