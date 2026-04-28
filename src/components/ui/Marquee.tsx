'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MarqueeProps {
  text: string;
  velocity?: number;
  className?: string;
  outline?: boolean;
}

export const Marquee: React.FC<MarqueeProps> = ({ 
  text, 
  velocity = 20, 
  className = "",
  outline = false
}) => {
  return (
    <div className={`overflow-hidden whitespace-nowrap flex py-4 bg-primary text-black border-y-2 border-black ${className}`}>
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ 
          repeat: Infinity, 
          duration: velocity, 
          ease: "linear" 
        }}
        className="flex shrink-0 items-center"
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className={`text-4xl md:text-6xl font-display font-black mx-4 flex items-center ${outline ? 'text-stroke' : ''}`}>
            {text}
            <span className="mx-8 text-2xl md:text-4xl">★</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};
