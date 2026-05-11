'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Service } from '@/types';
import { CATEGORY_ORDER } from '@/lib/config';
import { Clock, Star, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const INITIAL_SHOW = 6;

interface ServicesGridProps {
  services: Service[];
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ services }) => {
  const router = useRouter();
  const activeServices = services.filter(s => s.is_active && !s.is_addon);

  const categories = CATEGORY_ORDER.filter(cat =>
    activeServices.some(s => s.category === cat)
  );

  const [activeCategory, setActiveCategory] = useState(categories[0] ?? '');
  const [showAll, setShowAll] = useState(false);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setShowAll(false);
  };

  const categoryServices = activeServices.filter(s => s.category === activeCategory);
  const visibleServices = showAll ? categoryServices : categoryServices.slice(0, INITIAL_SHOW);
  const hasMore = categoryServices.length > INITIAL_SHOW;

  return (
    <section id="services" className="py-32 bg-white relative overflow-hidden">
      <div className="container-custom">

        {/* Заголовок секции */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
              НАШИ <span className="text-primary italic">УСЛУГИ</span>
            </h2>
            <p className="text-zinc-500 font-medium text-lg">
              Мы собрали лучшие процедуры для вашей красоты. Каждый мастер — эксперт в своём деле.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-300">
            <span className="w-12 h-[1px] bg-zinc-100" />
            Selection 2026
          </div>
        </div>

        {/* Вкладки категорий */}
        <div className="flex gap-2 flex-wrap mb-12">
          {categories.map(cat => {
            const count = activeServices.filter(s => s.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
                }`}
              >
                {cat}
                <span className={`text-[10px] ${isActive ? 'text-white/40' : 'text-zinc-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Сетка услуг */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.06, 0.3) }}
                onClick={() => router.push(`/booking?serviceId=${service.id}`)}
                className="card-modern group cursor-pointer p-8 flex flex-col h-full hover:border-primary/20 transition-all duration-500"
              >
                {service.image_url && (
                  <div className="relative w-[calc(100%+4rem)] aspect-[4/3] -mx-8 -mt-8 mb-8 rounded-t-[1.75rem] overflow-hidden">
                    <Image src={service.image_url} alt={service.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-12">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:bg-[#0A0A0A] group-hover:text-white group-hover:border-[#0A0A0A] transition-all duration-300">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight group-hover:text-primary transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-12 line-clamp-3">
                    {service.description || 'Индивидуальный подход и безупречное качество исполнения для каждого гостя студии.'}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-zinc-50">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <Clock size={14} className="text-primary" />
                    <span>{service.duration_minutes} МИН</span>
                  </div>
                  <div className="text-2xl font-black text-[#0A0A0A]">
                    {service.price > 0
                      ? <>{service.price} <span className="text-sm font-bold text-zinc-400">₽</span></>
                      : <span className="text-base font-bold text-zinc-400">Бесплатно</span>
                    }
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Кнопка "Показать все / Скрыть" */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-zinc-200 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all duration-300"
            >
              {showAll
                ? <><ChevronUp size={16} /> Скрыть</>
                : <><ChevronDown size={16} /> Показать все ({categoryServices.length})</>
              }
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
