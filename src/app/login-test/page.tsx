'use client';

import { useEffect, useRef } from 'react';

export default function LoginTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'BabeBar_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'console.log(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    container.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center">
        <h1 className="text-xl font-bold mb-4">Тест виджета Telegram</h1>
        <div ref={containerRef} />
        <p className="mt-4 text-xs text-gray-400">Если кнопки нет — значит скрипт блокируется</p>
      </div>
    </div>
  );
}
