'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Settings, 
  Scissors, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const stats = [
    { name: 'Записей сегодня', value: '0', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Новых клиентов', value: '0', icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
    { name: 'Выручка за месяц', value: '0 ₽', icon: TrendingUp, color: 'text-primary', bg: 'bg-pink-50' },
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
      title: 'Настройки профиля',
      description: 'Изменение контактных данных и настроек уведомлений',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-zinc-400',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#0A0A0A] mb-2 tracking-tight uppercase">Панель управления</h1>
            <p className="text-zinc-500 font-medium text-sm">Добро пожаловать в админ-панель BABEBAR</p>
          </div>
          <Link href="/admin/services" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Добавить услугу
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.name}</span>
              </div>
              <div className="text-3xl font-black text-[#0A0A0A]">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Link 
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
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
