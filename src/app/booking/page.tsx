'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Clock, Calendar, CheckCircle2, Phone, User, Trash2, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { Service } from '@/types';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get('serviceId');
  
  const [step, setStep] = useState(1);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [success, setSuccess] = useState(false);

  // Загрузка всех услуг и выбор услуги из URL
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setAllServices(data);

        if (serviceIdFromUrl) {
          const service = data.find((s: Service) => s.id === serviceIdFromUrl);
          if (service) {
            setSelectedServices([service]);
          }
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    loadData();
  }, [serviceIdFromUrl]);

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) return prev.filter(s => s.id !== service.id);
      return [...prev, service];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          date: selectedDate?.toISOString(),
          time: selectedTime,
          services: selectedServices,
          totalPrice
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert('Ошибка при записи: ' + data.error);
      }
    } catch (error) {
      alert('Произошла ошибка при соединении с сервером');
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Загрузка услуг...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 max-w-sm">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black uppercase tracking-tight">Вы записаны!</h1>
            <p className="text-zinc-500 font-medium leading-relaxed">
              Мы получили вашу запись на <span className="text-[#0A0A0A] font-bold">{selectedDate?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span> в <span className="text-[#0A0A0A] font-bold">{selectedTime}</span>.
            </p>
          </div>
          <Link href="/" className="btn-primary w-full py-5 text-xs tracking-widest uppercase">
            Вернуться на главную
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 py-6 px-6 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : router.push('/')}
              className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full transition-colors border border-zinc-100"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter leading-none">Онлайн запись</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                Шаг {step} из 3: {step === 1 ? 'Услуги' : step === 2 ? 'Дата и время' : 'Ваши данные'}
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-8 h-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-zinc-100'}`} 
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 pb-32">
        <AnimatePresence mode="wait">
          {/* Step 1: Services Selection */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div className="flex justify-between items-end border-b border-zinc-100 pb-8">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Выберите услуги</h2>
                  <p className="text-zinc-400 font-medium">Вы можете выбрать несколько процедур сразу</p>
                </div>
                {selectedServices.length > 0 && (
                  <div className="text-right hidden sm:block">
                    <div className="text-2xl font-black">{totalPrice} ₽</div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{totalDuration} мин</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allServices.map(service => {
                  const isSelected = selectedServices.some(s => s.id === service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`text-left p-6 rounded-3xl border transition-all duration-300 flex justify-between items-center group ${
                        isSelected ? 'border-primary bg-pink-50/30 ring-1 ring-primary/10' : 'border-white bg-white hover:border-zinc-200 shadow-sm'
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white' : 'bg-zinc-50 text-zinc-300 group-hover:text-primary'}`}>
                          <Star size={20} fill={isSelected ? 'currentColor' : 'none'} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{service.name}</h3>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase mt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} мин</span>
                            <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                            <span>{service.price} ₽</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary text-white' : 'border-zinc-100'}`}>
                        {isSelected && <CheckCircle2 size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              <section>
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tight">Выберите дату</h2>
                  <p className="text-primary font-bold text-sm uppercase tracking-widest">
                    {selectedDate?.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {[...Array(14)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday = i === 0;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
                          isSelected ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'border-white bg-white hover:border-zinc-200 shadow-sm'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${isSelected ? 'text-white/60' : 'text-zinc-300'}`}>
                          {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                        </span>
                        <span className="text-xl font-black">{date.getDate()}</span>
                        {isToday && !isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {selectedDate && (
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Выберите время</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {['10:00', '11:00', '12:00', '13:30', '14:30', '16:00', '17:00', '18:30', '19:30', '20:30'].map(time => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-4 rounded-2xl border font-bold text-sm transition-all duration-300 ${
                            isSelected ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-white bg-white hover:border-zinc-200 shadow-sm'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}

          {/* Step 3: Contacts */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tight">Почти готово</h2>
                <p className="text-zinc-400 font-medium">Оставьте ваши данные, чтобы мы могли подтвердить запись</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors">
                      <User size={22} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white pl-16 pr-8 py-6 rounded-3xl border border-zinc-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-lg"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors">
                      <Phone size={22} />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="+7 (___) ___-__-__"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white pl-16 pr-8 py-6 rounded-3xl border border-zinc-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="bg-[#0A0A0A] text-white p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center border-b border-white/10 pb-6">
                      <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Ваш выбор</span>
                      <span className="text-3xl font-black">{totalPrice} ₽</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Дата и время</span>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary">
                            <Calendar size={16} />
                          </div>
                          <span className="font-bold text-sm">
                            {selectedDate?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}, {selectedTime}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Длительность</span>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary">
                            <Clock size={16} />
                          </div>
                          <span className="font-bold text-sm">{totalDuration} мин</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-primary py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-pink-600 transition-all active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>ПОДТВЕРДИТЬ ЗАПИСЬ <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Summary for Mobile */}
      {selectedServices.length > 0 && step < 3 && !success && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-zinc-100 z-30">
          <div className="max-w-5xl mx-auto flex justify-between items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Итого</span>
              <span className="text-xl font-black">{totalPrice} ₽</span>
            </div>
            <button
              disabled={step === 1 ? selectedServices.length === 0 : !selectedDate || !selectedTime}
              onClick={() => setStep(step + 1)}
              className="btn-primary flex-1 py-4 text-[10px] tracking-[0.2em] uppercase disabled:opacity-50 disabled:grayscale transition-all"
            >
              {step === 1 ? 'Выбрать время' : 'К оформлению'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-zinc-100 border-t-primary rounded-full animate-spin" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
