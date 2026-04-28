'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '@/types';
import { Clock, Tag } from 'lucide-react';

interface ServicesGridProps {
  services: Service[];
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ services }) => {
  return (
    <section id="services" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h2 className="text-6xl md:text-8xl font-black mb-4">УСЛУГИ</h2>
          <p className="text-xl text-muted-foreground max-w-md">
            ВЫБИРАЙ ТО, ЧТО ПОДЧЕРКНЕТ ТВОЙ ХАРАКТЕР. НИКАКИХ КОМПРОМИССОВ.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <span className="text-primary text-9xl font-black opacity-10 leading-none">01</span>
        </div>
      </div>

      <div className="bento-grid">
        {services.map((service, index) => {
          const isLarge = index === 0 || index === 5;
          const isMedium = index === 2 || index === 3;
          
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative overflow-hidden group border border-white/10 bg-card p-8 flex flex-col justify-between transition-all duration-500 hover:border-primary
                ${isLarge ? 'bento-item-large' : isMedium ? 'bento-item-medium' : ''}
              `}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                    <Tag size={20} className="group-hover:text-black transition-colors" />
                  </div>
                  <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    Premium Service
                  </span>
                </div>
                
                <h3 className={`font-black leading-tight mb-4 group-hover:text-primary transition-colors ${isLarge ? 'text-5xl' : 'text-3xl'}`}>
                  {service.name}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed line-clamp-3 mb-8">
                  {service.description || 'Индивидуальный подход и премиальные материалы для вашей красоты.'}
                </p>
              </div>

              <div className="relative z-10 flex justify-between items-center pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 font-bold">
                  <Clock size={20} className="text-primary" />
                  <span>{service.duration_minutes} МИН</span>
                </div>
                <div className="text-4xl font-black italic text-primary">
                  {service.price} ₽
                </div>
              </div>

              {/* Background Accent */}
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
