'use client';

import React, { useState, useEffect } from 'react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter text-[#2D3436]">
          BABE<span className="text-primary italic">BAR</span>
        </div>
        
        <nav className="flex gap-6 md:gap-10 text-[12px] font-bold uppercase tracking-[0.2em] text-[#2D3436]">
          <a href="#services" className="hover:text-primary transition-colors">Услуги</a>
          <a href="#contacts" className="hover:text-primary transition-colors">Контакты</a>
        </nav>
      </div>
    </header>
  );
};
