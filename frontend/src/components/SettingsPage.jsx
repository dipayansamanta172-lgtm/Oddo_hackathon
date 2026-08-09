import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Sun, Moon } from 'lucide-react';

export default function SettingsPage({ isDark, toggleTheme, onNavigate, currentUser }) {
  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/70';
  const accentText = isDark ? 'text-dark-accent' : 'text-[#557373]';

  const glassPanelStyle = {
    background: isDark ? 'rgba(25, 25, 25, 0.45)' : 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(85, 115, 115, 0.15)',
    borderRadius: '16px',
    boxShadow: isDark 
      ? '0 20px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 20px 60px rgba(85, 115, 115, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  const glassInputStyle = {
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.65)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(85, 115, 115, 0.20)',
    borderRadius: '10px',
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-center items-center p-6 relative transition-colors duration-500 pb-32 ${
      isDark ? 'bg-[#0D0D0D]' : 'bg-[#DFE5F3]'
    }`}>
      
      {/* Back button */}
      <button 
        onClick={() => {
          if (currentUser) {
            if (currentUser.role === 'SUPER_ADMIN') onNavigate('/admin');
            else if (currentUser.role === 'HUB_OWNER') onNavigate('/hub');
            else onNavigate('/dashboard');
          } else {
            onNavigate('/');
          }
        }}
        className={`absolute top-6 left-6 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all ${
          isDark ? textColor : 'text-[#557373]'
        }`}
      >
        <ArrowLeft size={12} />
        <span>Back to Portal</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={glassPanelStyle}
        className="w-full max-w-lg p-8 md:p-10 space-y-6"
      >
        {/* Header */}
        <div className={`border-b pb-4 flex justify-between items-start ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
          <div className="space-y-1">
            <h2 className={`text-2xl font-black uppercase tracking-tight font-display ${accentText}`}>Settings</h2>
            <p className={`text-[10px] ${subText}`}>Configure your workspace parameters.</p>
          </div>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/10 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><Shield size={20} /></div>
        </div>

        {/* Options */}
        <div className="space-y-5 text-xs">
          
          {/* Theme Option */}
          <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-borderGrey/5' : 'border-[#557373]/10'}`}>
            <div className="space-y-0.5">
              <p className={`font-bold ${textColor}`}>Visual Theme</p>
              <span className={subText}>Toggle between Dark and Light mode.</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-[#557373]/10 border-[#557373]/20 text-[#557373]'
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Database Info */}
          <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-borderGrey/5' : 'border-[#557373]/10'}`}>
            <div className="space-y-0.5">
              <p className={`font-bold ${textColor}`}>Database Connector</p>
              <span className={subText}>MySQL Local Instance on Port 3306</span>
            </div>
            <span className={`font-mono px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[8px] ${
              isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]'
            }`}>
              ONLINE
            </span>
          </div>

          {/* User Auth ID */}
          {currentUser && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Hashed Credentials Token</span>
                <input 
                  type="text" 
                  value={localStorage.getItem('rexpo_token') || 'No Token'} 
                  readOnly 
                  style={glassInputStyle}
                  className={`w-full px-3 py-2.5 font-mono text-[9px] opacity-60 text-ellipsis overflow-hidden focus:outline-none ${textColor}`}
                />
              </div>
              <div className="space-y-1 pt-1">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Public Router Identifier</span>
                <p className={`font-mono font-bold ${accentText}`}>{currentUser.publicId || currentUser.public_id}</p>
              </div>
            </div>
          )}

        </div>
      </motion.div>

    </div>
  );
}
