'use client';

import React from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';

export const Gallery = () => {
  const images = [
    { url: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80', size: 'large' },
    { url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80', size: 'small' },
    { url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80', size: 'medium' },
    { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80', size: 'small' },
  ];

  return (
    <section className="py-24 px-4 bg-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-6xl md:text-[10rem] font-black leading-[0.8] mb-8 text-stroke-primary">WORKS</h2>
          <p className="text-2xl font-bold italic">МЫ НЕ ПРОСТО КРАСИМ, МЫ СОЗДАЕМ ОБРАЗ.</p>
        </div>

        <div className="flex flex-wrap gap-4 items-start">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className={`
                relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-700
                ${img.size === 'large' ? 'w-full md:w-[60%] h-[500px]' : img.size === 'medium' ? 'w-full md:w-[45%] h-[400px]' : 'w-full md:w-[35%] h-[300px]'}
              `}
            >
              <Image 
                src={img.url} 
                alt="Work" 
                fill
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute bottom-4 left-4 bg-primary text-black px-4 py-1 text-xs font-black uppercase z-10">
                #BABESTYLE
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
