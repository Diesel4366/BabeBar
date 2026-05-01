'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-zinc-100 bg-white text-zinc-400 hover:text-red-500 hover:border-red-100 transition-all text-[10px] font-black uppercase tracking-widest"
    >
      <LogOut size={16} />
      Выйти
    </button>
  );
}
