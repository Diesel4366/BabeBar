'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, User, Phone, Send, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_ORDER } from '@/lib/config';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_addon: boolean;
  addon_for_category: string | null;
}

interface Client {
  id: string;
  name: string | null;
  phone: string | null;
  telegram_username: string | null;
}

const SOURCE_OPTIONS = [
  { value: 'word_of_mouth', label: 'Сарафанное радио' },
  { value: 'telegram',      label: 'Telegram' },
  { value: 'vk',            label: 'ВКонтакте' },
  { value: 'phone_call',    label: 'Звонок' },
  { value: 'avito',         label: 'Авито' },
  { value: 'other',         label: 'Другое' },
];

function toLocalKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AdminNewAppointmentModal({ onClose, onCreated }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Client
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTelegram, setNewTelegram] = useState('');

  // Services
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState('');

  // Date & time
  const [date, setDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [occupiedIntervals, setOccupiedIntervals] = useState<{ start: string; end: string }[]>([]);
  const [workingHours, setWorkingHours] = useState<{ start: string; end: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Source
  const [source, setSource] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/admin/broadcast/clients').then(r => r.json()),
    ]).then(([s, c]) => {
      const svcs: Service[] = Array.isArray(s) ? s : [];
      setServices(svcs);
      setClients(Array.isArray(c) ? c : []);
      const cats = CATEGORY_ORDER.filter(cat => svcs.some(sv => sv.category === cat && !sv.is_addon));
      if (cats.length) setActiveCategory(cats[0]);
    });
  }, []);

  // Загружаем слоты при смене даты
  useEffect(() => {
    if (!date) return;
    setSelectedTime('');
    setLoadingSlots(true);
    fetch(`/api/availability?date=${date}`)
      .then(r => r.json())
      .then(d => {
        setOccupiedIntervals(d.occupiedIntervals ?? []);
        setWorkingHours(d.workingHours ?? null);
      })
      .finally(() => setLoadingSlots(false));
  }, [date]);

  // Генерируем слоты из рабочих часов
  useEffect(() => {
    if (!workingHours) { setTimeSlots([]); return; }
    const [sh, sm] = workingHours.start.split(':').map(Number);
    const [eh, em] = workingHours.end.split(':').map(Number);
    const slots: string[] = [];
    for (let mins = sh * 60 + sm; mins < eh * 60 + em; mins += 30) {
      slots.push(`${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`);
    }
    setTimeSlots(slots);
  }, [workingHours]);

  const totalDuration = selectedServices.reduce((s, v) => s + v.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((s, v) => s + v.price, 0);

  const isSlotAvailable = useCallback((t: string) => {
    const toMins = (x: string) => { const [hh, mm] = x.split(':').map(Number); return hh * 60 + mm; };
    const start = toMins(t);
    const end = start + totalDuration;
    return !occupiedIntervals.some(iv => start < toMins(iv.end) && end > toMins(iv.start));
  }, [occupiedIntervals, totalDuration]);

  const toggleService = (svc: Service) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === svc.id) ? prev.filter(s => s.id !== svc.id) : [...prev, svc]
    );
    setSelectedTime(''); // сбрасываем время при смене длительности
  };

  const categories = CATEGORY_ORDER.filter(cat => services.some(s => s.category === cat && !s.is_addon));
  const mainServices = services.filter(s => s.category === activeCategory && !s.is_addon);
  const addons = services.filter(s => s.is_addon && s.addon_for_category === activeCategory);

  const filteredClients = clients.filter(c =>
    !clientSearch ||
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone?.includes(clientSearch)
  );

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, '');
    if (n.length <= 1) return n.length === 1 ? '+7' : '';
    let f = '+7';
    if (n.length > 1) f += ' (' + n.substring(1, 4);
    if (n.length >= 5) f += ') ' + n.substring(4, 7);
    if (n.length >= 8) f += '-' + n.substring(7, 9);
    if (n.length >= 10) f += '-' + n.substring(9, 11);
    return f;
  };

  const minDate = toLocalKey(new Date());

  const handleSubmit = async () => {
    setError(null);
    if (!selectedServices.length) { setError('Выберите хотя бы одну услугу'); return; }
    if (!date) { setError('Выберите дату'); return; }
    if (!selectedTime) { setError('Выберите время'); return; }
    if (clientMode === 'new' && (!newName.trim() || !newPhone.trim())) {
      setError('Введите имя и телефон клиента'); return;
    }

    setSaving(true);
    const res = await fetch('/api/admin/appointments/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: clientMode === 'existing' ? selectedClient?.id : undefined,
        name: clientMode === 'new' ? newName.trim() : undefined,
        phone: clientMode === 'new' ? newPhone : undefined,
        telegramUsername: clientMode === 'new' && newTelegram.trim() ? newTelegram.replace('@', '').trim() : undefined,
        services: selectedServices,
        date,
        time: selectedTime,
        source: source || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Ошибка'); setSaving(false); return; }
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-0 lg:p-6">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white w-full lg:max-w-2xl max-h-[95dvh] lg:max-h-[90vh] rounded-t-[2.5rem] lg:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Новая запись</h2>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Ручное создание</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

          {/* ── CLIENT ── */}
          <section className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Клиент</div>
            <div className="flex gap-2">
              {(['existing', 'new'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setClientMode(mode); setSelectedClient(null); setClientSearch(''); }}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    clientMode === mode ? 'bg-[#0A0A0A] text-white' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  {mode === 'existing' ? 'Из базы' : 'Новый клиент'}
                </button>
              ))}
            </div>

            {clientMode === 'existing' ? (
              <div className="space-y-2">
                {selectedClient ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ backgroundColor: '#D14D72' }}>
                      {selectedClient.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm">{selectedClient.name}</div>
                      <div className="text-zinc-400 text-xs">{selectedClient.phone}</div>
                    </div>
                    <button onClick={() => { setSelectedClient(null); setClientSearch(''); }} className="text-zinc-300 hover:text-zinc-600">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                      <input
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        placeholder="Поиск по имени или телефону..."
                        className="w-full bg-zinc-50 pl-11 pr-4 py-3 rounded-2xl border border-zinc-100 text-sm font-medium outline-none focus:border-zinc-300"
                      />
                    </div>
                    {clientSearch && (
                      <div className="max-h-40 overflow-y-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
                        {filteredClients.length === 0
                          ? <div className="px-4 py-3 text-zinc-400 text-xs">Не найдено</div>
                          : filteredClients.slice(0, 6).map(c => (
                            <button key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(''); }}
                              className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 flex items-center gap-3">
                              <User size={14} className="text-zinc-300 flex-shrink-0" />
                              <div>
                                <span className="font-black text-sm">{c.name || 'Без имени'}</span>
                                <span className="text-zinc-400 text-xs ml-2">{c.phone}</span>
                              </div>
                            </button>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Имя клиента"
                    className="w-full bg-zinc-50 pl-11 pr-4 py-3 rounded-2xl border border-zinc-100 text-sm font-bold outline-none focus:border-zinc-300" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                  <input value={newPhone} onChange={e => setNewPhone(formatPhone(e.target.value))} placeholder="+7 (999) 000-00-00"
                    className="w-full bg-zinc-50 pl-11 pr-4 py-3 rounded-2xl border border-zinc-100 text-sm font-bold outline-none focus:border-zinc-300" />
                </div>
                <div className="relative">
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                  <input value={newTelegram} onChange={e => setNewTelegram(e.target.value)} placeholder="@username (необязательно)"
                    className="w-full bg-zinc-50 pl-11 pr-4 py-3 rounded-2xl border border-zinc-100 text-sm font-medium outline-none focus:border-zinc-300" />
                </div>
              </div>
            )}
          </section>

          {/* ── SERVICES ── */}
          <section className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Услуги</div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat ? 'bg-[#0A0A0A] text-white' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
                  }`}>{cat}</button>
              ))}
            </div>
            <div className="space-y-2">
              {mainServices.map(svc => {
                const sel = selectedServices.some(s => s.id === svc.id);
                return (
                  <button key={svc.id} onClick={() => toggleService(svc)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all"
                    style={{ borderColor: sel ? '#D14D72' : '#F4F4F5', backgroundColor: sel ? '#fdf2f5' : 'white' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ backgroundColor: sel ? '#D14D72' : '#F4F4F5', color: sel ? 'white' : '#A1A1AA' }}>
                      <Star size={14} fill={sel ? 'currentColor' : 'none'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm uppercase tracking-tight">{svc.name}</div>
                      <div className="text-[10px] font-black text-zinc-400 flex gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Clock size={10} />{svc.duration_minutes} мин</span>
                        <span className="font-black" style={{ color: sel ? '#D14D72' : '#A1A1AA' }}>{svc.price} ₽</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                      style={{ borderColor: sel ? '#D14D72' : '#E4E4E7', backgroundColor: sel ? '#D14D72' : 'transparent' }} />
                  </button>
                );
              })}
              {addons.map(svc => {
                const sel = selectedServices.some(s => s.id === svc.id);
                return (
                  <button key={svc.id} onClick={() => toggleService(svc)}
                    className="w-full text-left flex items-center gap-4 p-3 rounded-xl border transition-all"
                    style={{ borderColor: sel ? '#D14D72' : '#F4F4F5', backgroundColor: sel ? '#fdf2f5' : '#FAFAFA' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black transition-all"
                      style={{ backgroundColor: sel ? '#D14D72' : 'white', color: sel ? 'white' : '#A1A1AA', border: '1px solid #E4E4E7' }}>
                      +
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm uppercase tracking-tight">{svc.name}</div>
                      <div className="text-[10px] font-black text-zinc-400 flex gap-3">
                        <span className="flex items-center gap-1"><Clock size={10} />{svc.duration_minutes} мин</span>
                        {svc.price > 0 && <span>{svc.price} ₽</span>}
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                      style={{ borderColor: sel ? '#D14D72' : '#E4E4E7', backgroundColor: sel ? '#D14D72' : 'transparent' }} />
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── DATE & TIME ── */}
          <section className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Дата и время</div>
            <input type="date" value={date} min={minDate}
              onChange={e => { setDate(e.target.value); setSelectedTime(''); }}
              className="w-full bg-zinc-50 px-4 py-3 rounded-2xl border border-zinc-100 font-bold text-sm outline-none focus:border-zinc-300" />

            {date && (
              loadingSlots ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-100 animate-spin" style={{ borderTopColor: '#D14D72' }} />
                </div>
              ) : workingHours === null ? (
                <div className="py-4 text-center rounded-2xl border border-zinc-100 bg-zinc-50">
                  <p className="text-zinc-400 font-black text-[10px] uppercase tracking-widest">Нерабочий день</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map(t => {
                    const available = isSlotAvailable(t);
                    const sel = selectedTime === t;
                    return (
                      <button key={t} disabled={!available && !sel} onClick={() => setSelectedTime(t)}
                        className="py-3 rounded-xl font-black text-sm border transition-all"
                        style={{
                          backgroundColor: sel ? '#D14D72' : available ? 'white' : '#F9F9F9',
                          borderColor: sel ? '#D14D72' : available ? '#F4F4F5' : '#F4F4F5',
                          color: sel ? 'white' : available ? '#0A0A0A' : '#D4D4D8',
                          opacity: available || sel ? 1 : 0.5,
                          cursor: available ? 'pointer' : 'not-allowed',
                        }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </section>

          {/* ── SOURCE ── */}
          <section className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Откуда клиент</div>
            <div className="flex flex-wrap gap-2">
              {SOURCE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setSource(s => s === opt.value ? '' : opt.value)}
                  className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    source === opt.value ? 'text-white' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
                  }`}
                  style={source === opt.value ? { backgroundColor: '#D14D72' } : {}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold px-5 py-4 rounded-2xl">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-8 py-5 border-t border-zinc-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {selectedServices.length > 0 ? `${totalDuration} мин · ${selectedServices.length} услуг` : 'Услуги не выбраны'}
            </span>
            <span className="text-2xl font-black">{totalPrice} ₽</span>
          </div>
          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#D14D72' }}>
            {saving ? 'Создание...' : 'Создать запись'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
