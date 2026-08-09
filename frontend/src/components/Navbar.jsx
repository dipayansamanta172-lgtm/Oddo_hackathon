import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ isDark, toggleTheme, onNavigate, currentUser, onLogout }) {
  const textColor = isDark ? 'text-white' : 'text-charcoal';
  const subText = isDark ? 'text-mutedGrey' : 'text-slateDark/70';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b ${
      isDark 
        ? 'bg-dark-bg/80 border-slateDark/40 text-white' 
        : 'bg-light-bg/80 border-neutralGrey/40 text-charcoal'
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <span className="text-2xl font-extrabold tracking-wider font-display">REXPO</span>
        </button>

        {/* Public Links (Muted when inside auth/dashboards, but active on landing) */}
        <div className="hidden md:flex items-center space-x-8 font-medium text-sm">
          <a href="#features" className={`hover:text-dark-accent transition-colors ${subText}`}>Products</a>
          <a href="#workflow" className={`hover:text-dark-accent transition-colors ${subText}`}>Solutions</a>
          <a href="#inventory-monitoring" className={`hover:text-dark-accent transition-colors ${subText}`}>Inventory</a>
          <a href="#admin-dashboard" className={`hover:text-dark-accent transition-colors ${subText}`}>Admin Desk</a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          {/* Light/Dark Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all duration-300 border ${
              isDark 
                ? 'bg-slateDark border-surfaceLight text-white hover:bg-surfaceLight' 
                : 'bg-white border-neutralGrey text-charcoal hover:bg-neutralGrey/10'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onNavigate('dashboard')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  isDark 
                    ? 'bg-white text-dark-bg hover:bg-neutralGrey' 
                    : 'bg-charcoal text-white hover:bg-slateDark'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={onLogout}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all border ${
                  isDark 
                    ? 'border-white/10 text-white hover:bg-white/5' 
                    : 'border-charcoal/10 text-charcoal hover:bg-black/5'
                }`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onNavigate('login')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  isDark ? 'text-white hover:bg-white/5' : 'text-charcoal hover:bg-black/5'
                }`}
              >
                Sign In
              </button>
              
              <button 
                onClick={() => onNavigate('signup')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  isDark 
                    ? 'bg-white text-dark-bg hover:bg-neutralGrey' 
                    : 'bg-charcoal text-white hover:bg-slateDark'
                }`}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
