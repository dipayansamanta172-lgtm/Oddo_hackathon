import React from 'react';

export default function OutroScreen({ progress, isDark, onNavigate }) {
  // Map progress [0.90, 0.96] to opacity [0, 1]
  const outroOpacity = Math.max(0, Math.min(1, (progress - 0.90) / 0.06));
  const logoScale = 0.96 + 0.04 * outroOpacity;

  const textColor = isDark ? 'text-white' : 'text-charcoal';
  const subText = isDark ? 'text-mutedGrey' : 'text-slateDark/60';

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 transition-all duration-300 overflow-hidden"
      style={{ 
        opacity: outroOpacity,
        pointerEvents: outroOpacity > 0.5 ? 'auto' : 'none'
      }}
    >
      {/* CSS Keyframes for slow volumetric light motion */}
      <style>{`
        @keyframes float-glow-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.08); }
        }
        @keyframes float-glow-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 60px) scale(0.92); }
        }
        .animate-glow-1 {
          animation: float-glow-1 25s ease-in-out infinite;
        }
        .animate-glow-2 {
          animation: float-glow-2 30s ease-in-out infinite;
        }
      `}</style>

      {/* Layer 1: Very dark background */}
      <div className="absolute inset-0 bg-[#07090e] z-0" />

      {/* Layer 2 & 3: Large blurred radial gradients and slow moving volumetric light */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
        {/* Volumetric light wave 1 */}
        <div 
          className="absolute -top-1/3 -left-1/3 w-[80vw] h-[80vw] rounded-full blur-[140px] pointer-events-none animate-glow-1" 
          style={{
            background: 'radial-gradient(circle, rgba(85,115,115,0.3) 0%, rgba(95,143,168,0.1) 60%, transparent 100%)'
          }}
        />
        
        {/* Volumetric light wave 2 */}
        <div 
          className="absolute -bottom-1/3 -right-1/3 w-[75vw] h-[75vw] rounded-full blur-[120px] pointer-events-none animate-glow-2" 
          style={{
            background: 'radial-gradient(circle, rgba(109,166,199,0.2) 0%, rgba(137,184,214,0.05) 50%, transparent 100%)'
          }}
        />

        {/* Faint animated light beam in the center */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none" 
          style={{
            background: 'radial-gradient(circle, rgba(95,143,168,0.12) 0%, rgba(85,115,115,0.04) 50%, transparent 100%)'
          }}
        />
      </div>

      {/* Layer 4: Extremely soft vignette overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(7,9,14,0.92) 100%)'
        }}
      />

      {/* Foreground Content Container (Stays perfectly readable, no animation) */}
      <div 
        className="max-w-xl space-y-6 flex flex-col items-center relative z-10 transition-transform duration-300"
        style={{ transform: `scale(${logoScale})` }}
      >
        <div className="space-y-2">
          <h2 className={`text-5xl md:text-6xl font-black tracking-widest font-display leading-none select-none ${textColor}`}>
            REXPO
          </h2>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#89B8D6] select-none">
            Smart Rental Operations
          </p>
        </div>

        <p className={`text-sm font-semibold leading-relaxed max-w-sm select-none opacity-80 ${subText}`}>
          From booking to return.<br />One platform.
        </p>

        <div className="flex space-x-3 pointer-events-auto pt-2">
          <button 
            onClick={() => onNavigate('signup')}
            className={`px-6 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm ${
              isDark ? 'bg-white text-dark-bg hover:bg-neutralGrey' : 'bg-charcoal text-white hover:bg-slateDark'
            }`}
          >
            Start Renting Now
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className={`px-6 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all border ${
              isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-charcoal/10 text-charcoal hover:bg-black/5'
            }`}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
