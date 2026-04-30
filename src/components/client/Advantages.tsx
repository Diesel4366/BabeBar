'use client';

import React from 'react';
import { ShieldCheck, Coffee, Sparkles, Award } from 'lucide-react';

const advantages = [
  {
    icon: <ShieldCheck size={32} />,
    title: 'Безопасность',
    description: '4 этапа стерилизации по СанПиН и одноразовые расходники.'
  },
  {
    icon: <Award size={32} />,
    title: 'Качество',
    description: 'Премиальные материалы и гарантия на работу 7 дней.'
  },
  {
    icon: <Coffee size={32} />,
    title: 'Комфорт',
    description: 'Уютная атмосфера, свежий кофе и Wi-Fi для вашего отдыха.'
  },
  {
    icon: <Sparkles size={32} />,
    title: 'Эстетика',
    description: 'Индивидуальный подход к каждому образу и вниманию к деталям.'
  }
];

export const Advantages = () => {
  return (
    <section className="py-32 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {advantages.map((adv, i) => (
            <div key={i} className="space-y-6 group">
              <div className="w-16 h-16 bg-zinc-50 rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-[10deg]">
                {adv.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black uppercase tracking-tighter">{adv.title}</h3>
                <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                  {adv.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
