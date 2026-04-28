'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '@/types';
import { Clock } from 'lucide-react';

interface ServicesListProps {
  services: Service[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
  return (
    <section id="services" className="py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black mb-10 text-[#2D3436] tracking-tight">Выберите услугу</h2>
      
      <div className="flex flex-col gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="soft-card p-5 md:p-8 flex items-center gap-6 md:gap-10"
          >
            <div className="w-20 h-20 md:w-28 md:h-28 bg-[#FCEEF2] rounded-[1.5rem] flex items-center justify-center shrink-0">
              <span className="text-4xl md:text-5xl">💄</span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-black text-[#2D3436] mb-2 leading-tight">
                {service.name}
              </h3>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-black text-primary italic">
                  {service.price} ₽
                </span>
                <span className="text-muted-foreground font-bold text-sm uppercase tracking-widest opacity-60">
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
