'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '@/types';

interface ServicesListProps {
  services: Service[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
  return (
    <section id="services" className="py-16 px-6 max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-black mb-12 text-[#2D3436] tracking-tight">Выберите услугу</h2>
      
      <div className="flex flex-col gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="soft-card p-6 md:p-8 flex items-center gap-6 md:gap-10 w-full"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-pink-100 rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm border border-pink-200">
              <span className="text-4xl">💄</span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-black text-[#2D3436] mb-2 leading-tight">
                {service.name}
              </h3>
              <div className="flex items-center gap-6">
                <span className="text-xl md:text-2xl font-black text-primary">
                  {service.price} ₽
                </span>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                  {service.duration_minutes} мин
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
