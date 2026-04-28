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
    <section id="services" className="py-12 px-4 max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#2D3436]">Выберите услугу</h2>
      
      <div className="flex flex-col gap-4">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="soft-card p-6 flex items-center gap-6"
          >
            <div className="icon-box w-20 h-20 shrink-0">
              {/* Using a simple emoji or icon as placeholder like in screenshot */}
              <span className="text-3xl">💄</span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-[#2D3436] mb-1">
                {service.name}
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-primary">
                  {service.price} ₽
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-sm uppercase font-bold tracking-wider">
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
