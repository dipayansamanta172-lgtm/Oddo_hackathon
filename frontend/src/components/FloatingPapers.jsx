import React from 'react';
import { motion, useTransform } from 'framer-motion';

export default function FloatingPapers({ scrollYProgress, isDark }) {
  // Translate scroll progression [0.18, 0.35] to fly-in coordinates
  const flyIn = (start, end) => useTransform(scrollYProgress, [0.18, 0.35], [start, end]);
  
  // Custom transformations for multiple paper layers
  const paper1X = flyIn(-300, -280);
  const paper1Y = flyIn(-150, -100);
  const paper1Rot = useTransform(scrollYProgress, [0.18, 0.35], [-25, -15]);
  const paper1Opacity = useTransform(scrollYProgress, [0.18, 0.28], [0, 0.8]);

  const paper2X = flyIn(300, 240);
  const paper2Y = flyIn(-250, -180);
  const paper2Rot = useTransform(scrollYProgress, [0.18, 0.35], [20, 10]);
  const paper2Opacity = useTransform(scrollYProgress, [0.18, 0.28], [0, 0.8]);

  const sticky1X = flyIn(-100, -160);
  const sticky1Y = flyIn(200, 180);
  const sticky1Rot = useTransform(scrollYProgress, [0.18, 0.35], [45, 12]);
  const sticky1Opacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 0.9]);

  const sticky2X = flyIn(150, 280);
  const sticky2Y = flyIn(100, 140);
  const sticky2Rot = useTransform(scrollYProgress, [0.18, 0.35], [-35, -8]);
  const sticky2Opacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 0.9]);

  const cardBg = isDark ? 'bg-charcoal border-white/5 text-white/90 shadow-dark-soft' : 'bg-[#DFE5F3] border-[#557373]/20 text-[#1A1A1A] shadow-light-soft';
  const headerText = isDark ? 'text-white/40' : 'text-[#557373]/70';

  return (
    <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block overflow-hidden">
      {/* Paper 1: Left Background (Spreadsheet/Invoice Layout) */}
      <motion.div
        style={{ x: paper1X, y: paper1Y, rotate: paper1Rot, opacity: paper1Opacity }}
        className={`absolute left-1/2 top-1/2 w-72 p-5 rounded-lg border transition-colors duration-300 ${cardBg}`}
      >
        <div className="flex justify-between items-center mb-4">
          <span className={`text-[10px] uppercase font-bold tracking-widest ${headerText}`}>Invoice REX-4921</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isDark ? 'text-success bg-success/10' : 'text-[#557373] bg-[#557373]/15'}`}>PAID</span>
        </div>
        <div className="space-y-2">
          <div className={`h-2.5 rounded w-2/3 ${isDark ? 'bg-white/10' : 'bg-[#557373]/10'}`} />
          <div className={`h-2.5 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-[#557373]/10'}`} />
          <div className={`pt-2 border-t border-dashed flex justify-between text-xs font-semibold ${isDark ? 'border-borderGrey/20' : 'border-[#557373]/20'}`}>
            <span>MacBook Pro Rental</span>
            <span>$495.00</span>
          </div>
        </div>
      </motion.div>

      {/* Paper 2: Right Background (Operational Chart Layout) */}
      <motion.div
        style={{ x: paper2X, y: paper2Y, rotate: paper2Rot, opacity: paper2Opacity }}
        className={`absolute left-1/2 top-1/2 w-64 p-5 rounded-lg border transition-colors duration-300 ${cardBg}`}
      >
        <span className={`block text-[10px] uppercase font-bold tracking-widest mb-3 ${headerText}`}>Rental Operations Summary</span>
        <div className="flex items-end justify-between h-20 px-2">
          <div className={`w-3.5 h-12 rounded-t ${isDark ? 'bg-white/15' : 'bg-[#557373]/15'}`} />
          <div className={`w-3.5 h-8 rounded-t ${isDark ? 'bg-white/15' : 'bg-[#557373]/15'}`} />
          <div className={`w-3.5 h-16 rounded-t bg-[#557373]/40`} />
          <div className={`w-3.5 h-10 rounded-t ${isDark ? 'bg-white/15' : 'bg-[#557373]/15'}`} />
          <div className={`w-3.5 h-20 rounded-t bg-[#557373]`} />
        </div>
      </motion.div>

      {/* Sticky Note 1: Left Middle */}
      <motion.div
        style={{ x: sticky1X, y: sticky1Y, rotate: sticky1Rot, opacity: sticky1Opacity }}
        className={`absolute left-1/2 top-1/2 w-28 h-28 shadow-md p-3 font-medium text-xs flex flex-col justify-between rotate-6 rounded-lg border ${
          isDark ? 'bg-charcoal text-white border-white/10' : 'bg-[#DFE5F3] text-[#1A1A1A] border-[#557373]/20'
        }`}
      >
        <p className={`leading-tight text-[11px] font-semibold ${isDark ? 'text-white/80' : 'text-[#557373]'}`}>Check camera lens elements before dispatch!</p>
        <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-white/50' : 'text-[#557373]/70'}`}>Pending list</span>
      </motion.div>

      {/* Sticky Note 2: Right Middle */}
      <motion.div
        style={{ x: sticky2X, y: sticky2Y, rotate: sticky2Rot, opacity: sticky2Opacity }}
        className={`absolute left-1/2 top-1/2 w-28 h-28 shadow-md p-3 font-medium text-xs flex flex-col justify-between -rotate-12 rounded-lg border ${
          isDark ? 'bg-charcoal text-white border-white/10' : 'bg-[#DFE5F3] text-[#1A1A1A] border-[#557373]/20'
        }`}
      >
        <p className={`leading-tight text-[11px] font-semibold ${isDark ? 'text-white/80' : 'text-[#557373]'}`}>Clean DSLR sensor return confirmed #0921</p>
        <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? 'text-white/50' : 'text-[#557373]/70'}`}>Done today</span>
      </motion.div>
    </div>
  );
}
