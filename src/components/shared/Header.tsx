'use client';

import React, { useState, useEffect } from 'react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-lg py-4 shadow-sm' : 'bg-white/50 py-6'}`}>
      <div className="max-w-5xl mx-auto px-6 flex justify-between items-center w-full">
        <div className="text-2xl font-black tracking-tighter text-[#2D3436] flex items-center gap-1">
          BABE<span className="text-primary italic">BAR</span>
        </div>
        
        <nav className="flex items-center gap-6 md:gap-12">
          <a href="#services" className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2D3436] hover:text-primary transition-colors">Услуги</a>
          <a href="#contacts" className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2D3436] hover:text-primary transition-colors">Контакты</a>
        </nav>
      </div>
    </header>
  );
};
