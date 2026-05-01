import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Scissors, TrendingUp, Clock, ArrowRight, Plus } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import LogoutButton from '@/components/admin/LogoutButton';

async function getStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    const [todayRes, clientsRes, revenueRes] = await Promise.all([
      supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .in('status', ['active', 'completed']),
      supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart),
      supabaseAdmin
        .from('appointments')
        .select('total_price')
        .gte('date', monthStart)
        .in('status', ['active', 'completed']),
    ]);

    const monthRevenue = revenueRes.data?.reduce((sum, a) => sum + (a.total_price || 0), 0) ?? 0;
    return {
      todayAppointments: todayRes.count ?? 0,
      monthClients: clientsRes.count ?? 0,
      monthRevenue,
    };
  } catch {
    return { todayAppointments: 0, monthClients: 0, monthRevenue: 0 };
  }
}

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getStats();

  const statsCards = [
    {
      name: 'Записей сегодня',
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      name: 'Клиентов за месяц',
      value: stats.monthClients.toString(),
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      name: 'Выручка за месяц',
      value: `${stats.monthRevenue.toLocaleString('ru-RU')} ₽`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-pink-50',
    },
  ];

  const menuItems = [
    {
      title: 'Управление записями',
      description: 'Просмотр, подтверждение и отмена записей клиентов',
      icon: Clock,
      href: '/admin/appointments',
      color: 'bg-[#0A0A0A]',
    },
    {
      title: 'Каталог услуг',
      description: 'Редактирование цен, длительности и описания услуг',
      icon: Scissors,
      href: '/admin/services',
      color: 'bg-primary',
    },
    {
      title: 'Расписание',
      description: 'Управление рабочими часами и выходными днями',
      icon: Calendar,
      href: '/admin/settings',
      color: 'bg-zinc-400',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#0A0A0A] mb-2 tracking-tight uppercase">
              Панель управления
            </h1>
            <p className="text-zinc-500 font-medium text-sm">Добро пожаловать в админ-панель BABEBAR</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/services" className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Добавить услугу
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statsCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {stat.name}
                </span>
              </div>
              <div className="text-3xl font-black text-[#0A0A0A]">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group card-modern p-0 overflow-hidden flex flex-col h-full hover:border-primary transition-all duration-500"
            >
              <div className={`p-10 ${item.color} text-white flex justify-between items-start`}>
                <item.icon size={32} />
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <ArrowRight size={20} />
                </div>
              </div>
              <div className="p-10 flex-1">
                <h3 className="text-xl font-black mb-3 uppercase tracking-tight">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
