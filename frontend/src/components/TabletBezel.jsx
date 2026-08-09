import React from 'react';

export default function TabletBezel({ isDark, children }) {
  return (
    <div className="relative w-full max-w-5xl aspect-[16/10] mx-auto z-10 transition-transform duration-300">
      
      {/* Glossy bezel frame with screen layout shadow */}
      <div className={`absolute inset-0 rounded-2xl p-3 border-4 transition-all duration-300 ${
        isDark 
          ? 'bg-[#18181A] border-slateDark shadow-[0_10px_50px_rgba(0,0,0,0.8)]' 
          : 'bg-[#DFE5F3] border-[#557373]/20 shadow-[0_20px_60px_rgba(85,115,115,0.12)]'
      }`}>
        
        {/* Device camera notch */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 rounded-b-lg z-50 ${
          isDark ? 'bg-slateDark' : 'bg-[#557373]/20'
        }`} />

        {/* Screen inner content area */}
        <div className="w-full h-full rounded-lg overflow-hidden relative select-none">
          {children}
        </div>
      </div>
    </div>
  );
}
