import React from 'react';
import { motion, useTransform } from 'framer-motion';

export default function DeskHero({ scrollYProgress, isDark }) {
  // Translate scroll progression [0, 0.2] to opacity & scale transformations
  const deskOpacity = useTransform(scrollYProgress, [0, 0.15, 0.22], [1, 1, 0]);
  const deskScale = useTransform(scrollYProgress, [0, 0.22], [1, 1.05]);
  
  // Hero text overlay animations
  const titleOpacity = useTransform(scrollYProgress, [0.08, 0.12, 0.18, 0.22], [0, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0.08, 0.12, 0.22], [20, 0, -20]);

  return (
    <motion.div 
      style={{ opacity: deskOpacity }}
      className="fixed inset-0 z-10 pointer-events-none"
    >
      {/* Background Image representation of ezgif-frame-001.jpg */}
      <motion.div 
        style={{ scale: deskScale }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/desk-bg.jpg')` }}
      />
      
      {/* Overlay to darken and make text legible */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Editorial typography animation overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.div 
          style={{ opacity: titleOpacity, y: titleY }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-none mb-6">
            Managing rentals <br />
            <span className="text-white/80 font-normal">shouldn't be complicated.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutralGrey/70 max-w-xl mx-auto font-medium">
            Too much manual work. Too little visibility.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
