import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    const [todayRes, clientsRes, revenueRes] = await Promise.all([
      supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .in('status', ['active', 'completed']),
      supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart),
      supabaseAdmin
        .from('appointments')
        .select('total_price')
        .gte('date', monthStart)
        .in('status', ['active', 'completed']),
    ]);

    const monthRevenue = revenueRes.data?.reduce(
      (sum, a) => sum + (a.total_price || 0), 0
    ) ?? 0;

    return NextResponse.json({
      todayAppointments: todayRes.count ?? 0,
      monthClients: clientsRes.count ?? 0,
      monthRevenue,
    });
  } catch {
    return NextResponse.json({ todayAppointments: 0, monthClients: 0, monthRevenue: 0 });
  }
}
