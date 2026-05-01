import { NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { password } = await req.json();
  const secret = process.env.ADMIN_SECRET;

  if (!secret || password !== secret) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  const token = await createAdminToken(secret);
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
