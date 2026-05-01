'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { ScheduleRule } from '@/types';

const DAY_NAMES = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export default function AdminSettings() {
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/schedule');
      const data = await res.json();
      if (Array.isArray(data)) setRules(data);
    } catch {
      // silent
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const updateRule = (id: string, field: keyof ScheduleRule, value: string | boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveRule = async (rule: ScheduleRule) => {
    setSavingId(rule.id);
    try {
      await fetch('/api/admin/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule.id,
          is_working: rule.is_working,
          start_time: rule.start_time,
          end_time: rule.end_time,
        }),
      });
      setSavedId(rule.id);
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      // silent
    }
    setSavingId(null);
  };

  const sortedRules = [...rules].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.day_of_week) - order.indexOf(b.day_of_week);
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-12">
      <div className="container-custom max-w-2xl">
        <div className="flex items-center gap-6 mb-12">
          <Link
            href="/admin"
            className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-100 rounded-full hover:bg-zinc-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#0A0A0A] mb-1 tracking-tight uppercase">Расписание</h1>
            <p className="text-zinc-500 font-medium text-sm">Управление рабочими часами</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRules.map(rule => (
              <div
                key={rule.id}
                className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 min-w-[160px]">
                    <button
                      onClick={() => updateRule(rule.id, 'is_working', !rule.is_working)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                        rule.is_working ? 'bg-primary' : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                          rule.is_working ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="font-black text-sm uppercase tracking-tight">
                      {DAY_NAMES[rule.day_of_week]}
                    </span>
                  </div>

                  {rule.is_working ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={rule.start_time?.substring(0, 5) ?? '10:00'}
                        onChange={e => updateRule(rule.id, 'start_time', e.target.value)}
                        className="bg-[#FAFAFA] border border-zinc-100 rounded-xl px-4 py-3 font-bold text-sm focus:border-primary outline-none"
                      />
                      <span className="text-zinc-300 font-black">—</span>
                      <input
                        type="time"
                        value={rule.end_time?.substring(0, 5) ?? '21:00'}
                        onChange={e => updateRule(rule.id, 'end_time', e.target.value)}
                        className="bg-[#FAFAFA] border border-zinc-100 rounded-xl px-4 py-3 font-bold text-sm focus:border-primary outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-zinc-300 font-black text-sm uppercase tracking-widest">
                      Выходной
                    </span>
                  )}

                  <button
                    onClick={() => saveRule(rule)}
                    disabled={savingId === rule.id}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      savedId === rule.id
                        ? 'bg-green-50 text-green-500 border border-green-100'
                        : 'bg-[#0A0A0A] text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Save size={14} />
                    {savedId === rule.id ? 'Сохранено' : 'Сохранить'}
                  </button>
                </div>
              </div>
            ))}

            {sortedRules.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-zinc-100">
                <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">
                  Расписание не настроено
                </p>
                <p className="text-zinc-300 font-medium text-xs mt-2">
                  Заполните таблицу schedule_rules в Supabase
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
