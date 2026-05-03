import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';

async function checkAuth(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  const cookieHeader = req.headers.get('cookie') || '';
  const adminSession = cookieHeader.split(';').find(c => c.trim().startsWith('admin_session='))?.split('=')[1];
  return !(!adminSession || !secret || !(await verifyAdminToken(adminSession, secret)));
}

export async function GET(req: Request) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from('site_settings').select('key, value');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  return NextResponse.json(map);
}

export async function PATCH(req: Request) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body: Record<string, string> = await req.json();
  const entries = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(entries, { onConflict: 'key' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
