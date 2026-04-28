'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import { ArrowDownRight } from 'lucide-react';

import Image from 'next/image';

export const Hero = () => {
  return (
    <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10" />
        <Image 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80" 
          alt="Beauty Salon" 
          fill
          priority
          className="w-full h-full object-cover grayscale opacity-50"
        />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-start md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <h1 className="text-[15vw] md:text-[12vw] leading-[0.8] font-display font-black text-white mix-blend-difference tracking-tighter mb-4">
            BABE<span className="text-primary">BAR</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-8 mt-8"
        >
          <p className="text-xl md:text-3xl font-medium max-w-xl leading-tight">
            ТВОЯ КРАСОТА — <br/>
            <span className="text-primary italic">НАШИ ПРАВИЛА.</span> <br/>
            ДЕРЗКИЙ ЛЮКС ДЛЯ ТЕХ, КТО НЕ БОИТСЯ БЫТЬ СОБОЙ.
          </p>

          <div className="flex flex-col items-start md:items-end gap-6">
            <MagneticButton 
              href="https://t.me/babebar_booking_bot" 
              target="_blank"
              className="bg-primary text-black px-10 py-6 text-2xl font-black rounded-full flex items-center gap-4 hover:bg-white transition-colors"
            >
              ЗАПИСАТЬСЯ <ArrowDownRight size={32} />
            </MagneticButton>
            
            <div className="flex gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <span>MANICURE</span>
              <span>•</span>
              <span>HAIR</span>
              <span>•</span>
              <span>MAKEUP</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-10 hidden md:block">
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-primary font-bold flex flex-col items-center gap-2"
        >
          <span className="[writing-mode:vertical-rl] tracking-tighter uppercase">Scroll</span>
          <div className="w-px h-12 bg-primary" />
        </motion.div>
      </div>
      
      <div className="noise absolute inset-0 z-50 pointer-events-none" />
    </section>
  );
};
