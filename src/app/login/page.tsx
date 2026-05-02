import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/userAuth';
import { redirect } from 'next/navigation';
import { TelegramButton } from './components/TelegramButton';

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const store = await cookies();
  const token = store.get('user_session')?.value;
  if (token) {
    const id = await verifyUserToken(token, process.env.ADMIN_SECRET!);
    if (id) redirect('/profile');
  }

  const sp = await props.searchParams;
  const hasError = !!sp.error;

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'BabeBar_bot';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-12">
          <Link href="/" className="text-3xl font-black tracking-tighter text-[#0A0A0A] inline-block mb-8">
            BABE<span style={{ color: '#D14D72' }} className="italic">BAR</span>
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Личный кабинет</h1>
          <p className="text-zinc-400 font-medium text-sm">Войдите, чтобы видеть свои записи</p>
        </div>

        {hasError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold text-center uppercase tracking-widest">
            Ошибка авторизации — попробуйте ещё раз
          </div>
        )}

        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-8 space-y-6">
          <TelegramButton botUsername={botUsername} />

          <div className="relative">
            <span className="absolute inset-x-0 top-1/2 h-px bg-zinc-100" />
            <span className="relative bg-white px-4 text-[10px] font-black text-zinc-300 uppercase tracking-widest flex justify-center">
              или
            </span>
          </div>

          <Link
            href="/booking"
            className="w-full flex items-center justify-center py-4 rounded-2xl border border-zinc-100 text-xs font-black uppercase tracking-widest text-zinc-500 hover:border-zinc-200 transition-all"
          >
            Записаться без регистрации
          </Link>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
          Вы мастер?{' '}
          <Link href="/admin" className="text-zinc-400 hover:text-zinc-600 underline transition-colors">
            Войти в панель управления
          </Link>
        </p>
        <p className="text-center mt-2 text-[8px] text-zinc-200 uppercase tracking-[0.3em]">
          v.02.60.final
        </p>
      </div>
    </div>
  );
}
