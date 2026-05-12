import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyUserToken } from '@/lib/userAuth';

async function isAdmin(req: Request): Promise<boolean> {
  const store = await cookies();
  const token = store.get('admin_session')?.value;
  if (token) return true;
  // fallback: check user_session with is_admin
  const userToken = store.get('user_session')?.value;
  if (!userToken) return false;
  const profileId = await verifyUserToken(userToken, process.env.ADMIN_SECRET!);
  if (!profileId) return false;
  const { data } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', profileId).maybeSingle();
  return data?.is_admin === true;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    name?: string;
    phone?: string;
    nickname?: string;
    telegram_username?: string;
    telegram_id?: string;
    vk_id?: string;
  };

  const update: Record<string, string | null> = {};
  for (const key of ['name', 'phone', 'nickname', 'telegram_username', 'telegram_id', 'vk_id'] as const) {
    if (key in body) update[key] = body[key] || null;
  }

  const { error } = await supabaseAdmin.from('profiles').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
