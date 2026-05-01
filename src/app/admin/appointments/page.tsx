'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  ChevronLeft,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/appointments');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setAppointments(prev => 
          prev.map(app => app.id === id ? { ...app, status } : app)
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.client?.phone?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'cancelled_by_admin':
      case 'cancelled_by_client': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ожидается';
      case 'completed': return 'Завершено';
      case 'cancelled_by_admin': return 'Отменено вами';
      case 'cancelled_by_client': return 'Отменено клиентом';
      default: return status;
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin" 
              className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-100 rounded-full hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-[#0A0A0A] mb-2 tracking-tight uppercase">Записи</h1>
              <p className="text-zinc-500 font-medium text-sm">Управление визитами ваших клиентов</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
            <input 
              type="text"
              placeholder="Поиск по имени или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white pl-16 pr-8 py-5 rounded-2xl border border-zinc-100 focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold text-sm"
            />
          </div>
          <button className="bg-white border border-zinc-100 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-zinc-50 transition-colors">
            <Filter size={16} />
            Фильтры
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    {/* Client Info */}
                    <div className="flex gap-6 items-start">
                      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 flex-shrink-0">
                        <User size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black uppercase tracking-tight">{app.client?.name || 'Без имени'}</h3>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(app.status)}`}>
                            {getStatusText(app.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-primary" />
                            <span>{app.client?.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary" />
                            <span>{new Date(app.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-primary" />
                            <span>{app.startTime} — {app.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services & Price */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 lg:text-right">
                      <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2">Услуги</div>
                        <div className="text-sm font-bold text-[#0A0A0A]">
                          {app.services?.map((s: any) => s.name).join(', ')}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2">Сумма</div>
                        <div className="text-2xl font-black text-primary">{app.totalPrice} ₽</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 border-t lg:border-t-0 lg:border-l border-zinc-50 pt-6 lg:pt-0 lg:pl-8">
                      {app.status === 'active' && (
                        <>
                          <button 
                            onClick={() => updateStatus(app.id, 'completed')}
                            className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} />
                            Готово
                          </button>
                          <button 
                            onClick={() => updateStatus(app.id, 'cancelled_by_admin')}
                            className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle size={16} />
                            Отмена
                          </button>
                        </>
                      )}
                      <button className="p-4 rounded-xl border border-zinc-100 text-zinc-300 hover:bg-zinc-50 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-zinc-100">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mx-auto mb-6">
                  <Calendar size={40} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-400 mb-2">Записей пока нет</h3>
                <p className="text-zinc-300 font-medium text-sm">Все новые записи клиентов будут появляться здесь</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
