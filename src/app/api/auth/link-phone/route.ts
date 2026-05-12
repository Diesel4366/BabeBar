import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyUserToken, createUserToken } from '@/lib/userAuth';

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('8') && digits.length === 11) return '+7' + digits.slice(1);
  if (digits.startsWith('7') && digits.length === 11) return '+' + digits;
  if (digits.length === 10) return '+7' + digits;
  return '+' + digits;
}

// GET /api/auth/link-phone?phone=... — полная навигация, cookie ставится надёжно через редирект
export async function GET(req: Request) {
  const url = new URL(req.url);
  const headersList = await headers();
  const host = headersList.get('host') ?? 'babe-bar.vercel.app';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const origin = `${proto}://${host}`;

  const fail = (msg: string) =>
    NextResponse.redirect(new URL(`/profile?phone_error=${encodeURIComponent(msg)}`, origin));

  const store = await cookies();
  const sessionToken = store.get('user_session')?.value;
  if (!sessionToken) return NextResponse.redirect(new URL('/login', origin));

  const currentProfileId = await verifyUserToken(sessionToken, process.env.ADMIN_SECRET!);
  if (!currentProfileId) return NextResponse.redirect(new URL('/login', origin));

  const rawPhone = url.searchParams.get('phone') ?? '';
  if (!rawPhone) return fail('missing_phone');

  const normalizedPhone = normalizePhone(rawPhone);

  const { data: currentProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, vk_id, phone')
    .eq('id', currentProfileId)
    .maybeSingle();

  if (!currentProfile) return NextResponse.redirect(new URL('/login', origin));

  // Ищем существующий профиль с таким телефоном
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('phone', normalizedPhone)
    .neq('id', currentProfileId)
    .maybeSingle();

  let targetProfileId: string;

  if (existingProfile) {
    // Переносим vk_id в существующий профиль, удаляем новый
    await supabaseAdmin
      .from('profiles')
      .update({ vk_id: currentProfile.vk_id })
      .eq('id', existingProfile.id);

    await supabaseAdmin.from('profiles').delete().eq('id', currentProfileId);

    targetProfileId = existingProfile.id;
  } else {
    await supabaseAdmin
      .from('profiles')
      .update({ phone: normalizedPhone })
      .eq('id', currentProfileId);

    targetProfileId = currentProfileId;
  }

  const newToken = await createUserToken(targetProfileId, process.env.ADMIN_SECRET!);
  const redirectUrl = existingProfile
    ? new URL('/profile?linked=1', origin)
    : new URL('/profile', origin);

  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set('user_session', newToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}
