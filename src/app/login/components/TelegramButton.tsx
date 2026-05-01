'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function TelegramButton({ botUsername }: { botUsername: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !botUsername) return;

    // Очищаем username от @ если он есть
    const cleanUsername = botUsername.replace(/^@/, '');

    container.innerHTML = '';

    // Создаем функцию обратного вызова в объекте window
    (window as any).onTelegramAuth = async (user: any) => {
      const searchParams = new URLSearchParams();
      Object.entries(user).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      
      // Редиректим на наш callback с полученными данными
      router.push(`/api/auth/telegram/callback?${searchParams.toString()}`);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', cleanUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '16');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    container.appendChild(script);

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, router]);

  return (
    <div className="flex justify-center" ref={containerRef} />
  );
}
