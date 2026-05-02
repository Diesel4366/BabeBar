'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Settings, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import LogoutButton from './LogoutButton';

const MENU_ITEMS = [
  { name: 'Дашборд', icon: LayoutDashboard, href: '/admin' },
  { name: 'Записи', icon: Calendar, href: '/admin/appointments' },
  { name: 'Услуги', icon: Scissors, href: '/admin/services' },
  { name: 'Клиенты', icon: Users, href: '/admin/clients' },
  { name: 'Настройки', icon: Settings, href: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-[#0A0A0A] text-white flex flex-col z-50">
      <div className="p-8">
        <Link href="/admin" className="flex flex-col gap-1 group">
          <span className="text-2xl font-black uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
            BABE<span className="text-primary italic">BAR</span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            Admin Panel
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-primary transition-colors'} />
              <span className="text-xs font-black uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 space-y-3">
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center justify-between w-full px-6 py-4 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
        >
          На сайт
          <ExternalLink size={14} />
        </Link>
        <LogoutButton isSidebar />
      </div>
    </aside>
  );
}
