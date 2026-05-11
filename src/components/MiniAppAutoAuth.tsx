'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MiniAppAutoAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initData) return; // Не Mini App — не трогаем

    setStatus('loading');

    const state = searchParams.get('state') ?? undefined;

    fetch('/api/auth/telegram/miniapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData, state }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          router.replace(data.redirectTo ?? '/profile');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [router, searchParams]);

  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#2AABEE]/10">
        <div className="w-4 h-4 rounded-full border-2 border-[#2AABEE] border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-[#2AABEE]">Входим через Telegram...</span>
      </div>
    );
  }

  return (
    <p className="text-red-500 text-xs text-center font-bold">
      Не удалось войти автоматически — попробуйте кнопку ниже
    </p>
  );
}
