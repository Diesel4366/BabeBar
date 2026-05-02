import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/userAuth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const store = await cookies();
  const token = store.get('user_session')?.value;
  if (!token) return new Response(null, { status: 401 });

  const profileId = await verifyUserToken(token, process.env.ADMIN_SECRET!);
  if (!profileId) return new Response(null, { status: 401 });

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('telegram_photo')
    .eq('id', profileId)
    .single();

  const url = data?.telegram_photo;
  if (!url) return new Response(null, { status: 404 });

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return new Response(null, { status: 404 });

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
