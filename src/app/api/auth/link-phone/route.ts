import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyUserToken, createUserToken } from '@/lib/userAuth';

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('8') && digits.length === 11) return '+7' + digits.slice(1);
  if (digits.startsWith('7') && digits.length === 11) return '+' + digits;
  if (digits.length === 10) return '+7' + digits;
  return '+' + digits;
}

export async function POST(req: Request) {
  const store = await cookies();
  const sessionToken = store.get('user_session')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

  const currentProfileId = await verifyUserToken(sessionToken, process.env.ADMIN_SECRET!);
  if (!currentProfileId) return NextResponse.json({ error: 'invalid_session' }, { status: 401 });

  const { phone } = await req.json() as { phone: string };
  if (!phone) return NextResponse.json({ error: 'missing_phone' }, { status: 400 });

  const normalizedPhone = normalizePhone(phone);

  // Текущий профиль (VK-новый)
  const { data: currentProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, vk_id, phone')
    .eq('id', currentProfileId)
    .maybeSingle();

  if (!currentProfile) return NextResponse.json({ error: 'profile_not_found' }, { status: 404 });

  // Ищем существующий профиль с таким телефоном (не текущий)
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('phone', normalizedPhone)
    .neq('id', currentProfileId)
    .maybeSingle();

  let targetProfileId: string;

  if (existingProfile) {
    // Переносим vk_id в существующий профиль и удаляем новый
    await supabaseAdmin
      .from('profiles')
      .update({ vk_id: currentProfile.vk_id })
      .eq('id', existingProfile.id);

    await supabaseAdmin.from('profiles').delete().eq('id', currentProfileId);

    targetProfileId = existingProfile.id;
  } else {
    // Просто сохраняем телефон на текущем профиле
    await supabaseAdmin
      .from('profiles')
      .update({ phone: normalizedPhone })
      .eq('id', currentProfileId);

    targetProfileId = currentProfileId;
  }

  // Обновляем сессию на правильный профиль
  const newToken = await createUserToken(targetProfileId, process.env.ADMIN_SECRET!);
  const res = NextResponse.json({ ok: true, merged: !!existingProfile });
  res.cookies.set('user_session', newToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}
