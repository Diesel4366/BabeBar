import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { TrendingUp, Calendar, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

async function getRevenueData() {
  try {
    const monthStart = startOfMonth(new Date()).toISOString().split('T')[0];

    const { data: appts, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        total_price,
        status,
        profiles (name),
        appointment_services (services (name))
      `)
      .gte('date', monthStart)
      .eq('status', 'completed')
      .order('date', { ascending: false });

    if (error) throw error;
    return appts || [];
  } catch (error) {
    console.error('Revenue report error:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function RevenueReport() {
  const data = await getRevenueData();
  const total = data.reduce((sum, a) => sum + (a.total_price || 0), 0);

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
            Отчет по <span className="text-primary italic">выручке</span>
          </h1>
          <p className="text-zinc-400 font-medium uppercase text-[10px] tracking-[0.2em]">
            Завершенные визиты за текущий месяц
          </p>
        </div>
        <div className="bg-white px-10 py-8 rounded-[2rem] border border-zinc-100 shadow-sm text-right">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2">Общий итог</div>
          <div className="text-4xl font-black text-primary">{total.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-100">
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Дата</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Клиент</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Услуги</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="font-black text-sm uppercase tracking-tight">{format(new Date(item.date), 'd MMM', { locale: ru })}</div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase">{format(new Date(item.date), 'eeee', { locale: ru })}</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-sm text-[#0A0A0A] uppercase">{item.profiles?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xs font-medium text-zinc-500 italic line-clamp-1">
                      {item.appointment_services?.map((s: any) => s.services?.name).join(', ')}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <span className="font-black text-lg text-[#0A0A0A]">{item.total_price} ₽</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center text-zinc-400 font-bold text-sm uppercase tracking-widest">
                  Нет завершенных записей в этом месяце
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
