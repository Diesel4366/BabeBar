'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone } from 'lucide-react';

const NEW_URL = 'https://babebar.ru';
const COUNTDOWN = 10;

export default function MovedClient() {
  const [seconds, setSeconds] = useState(COUNTDOWN);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          window.location.href = NEW_URL;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      {/* Декоративные блобы */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: '#D14D72' }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: '#D14D72' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* Логотип */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <span
            className="text-4xl font-black uppercase tracking-[0.25em]"
            style={{ color: '#D14D72' }}
          >
            BABEBAR
          </span>
          <div className="h-px w-full mt-2 opacity-30" style={{ backgroundColor: '#D14D72' }} />
        </motion.div>

        {/* Иконка */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-lg"
          style={{ backgroundColor: '#D14D72' }}
        >
          <span className="text-3xl">🌸</span>
        </motion.div>

        {/* Заголовок */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl font-black uppercase tracking-tight mb-4"
          style={{ color: '#0A0A0A' }}
        >
          Мы переехали!
        </motion.h1>

        {/* Описание */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-base leading-relaxed mb-2"
          style={{ color: '#71717A' }}
        >
          Наш сайт онлайн-записи теперь живёт по новому адресу.
          Записывайтесь на услуги, смотрите историю и управляйте
          записями на новом сайте.
        </motion.p>

        {/* Новый адрес */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl font-black uppercase tracking-widest mb-10"
          style={{ color: '#D14D72' }}
        >
          babebar.ru
        </motion.p>

        {/* Кнопка */}
        <motion.a
          href={NEW_URL}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-lg mb-6"
          style={{ backgroundColor: '#D14D72' }}
        >
          Перейти на новый сайт
          <ArrowRight size={18} />
        </motion.a>

        {/* Счётчик */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm"
          style={{ color: '#A1A1AA' }}
        >
          Автоматический переход через{' '}
          <span className="font-black" style={{ color: '#D14D72' }}>{seconds}</span>{' '}сек.
        </motion.p>

        {/* Контакты */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: '#A1A1AA' }}>
            <MapPin size={14} />
            <span>Нижний Новгород, ул. Сазанова 2А</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#A1A1AA' }}>
            <Phone size={14} />
            <a href="tel:+79991202112" style={{ color: '#A1A1AA' }}>+7 (999) 120-21-12</a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
