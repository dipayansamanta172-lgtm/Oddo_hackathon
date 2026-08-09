import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Compass, 
  Layers, 
  FileText, 
  Bell, 
  User, 
  X, 
  ChevronUp 
} from 'lucide-react';

export default function CustomerBottomDock({ isDark, currentPath, onNavigate, currentUser }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activePath = typeof currentPath === 'string' && currentPath 
    ? currentPath 
    : (typeof window !== 'undefined' && window.location && window.location.pathname) || '/dashboard';

  const dockStyle = {
    background: isDark ? 'rgba(15, 20, 28, 0.80)' : 'rgba(223, 229, 243, 0.88)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(85, 115, 115, 0.20)',
    borderRadius: '18px',
    boxShadow: isDark 
      ? '0 20px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
      : '0 15px 50px rgba(85, 115, 115, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard', 
      match: (p) => typeof p === 'string' && (p === '/dashboard' || p === '/customer/dashboard')
    },
    { 
      id: 'catalog', 
      label: 'Browse Catalog', 
      icon: Compass, 
      path: '/products', 
      match: (p) => typeof p === 'string' && (p === '/products' || p === '/customer/catalog')
    },
    { 
      id: 'rentals', 
      label: 'My Rentals', 
      icon: Layers, 
      path: '/customer/rentals', 
      match: (p) => typeof p === 'string' && (p === '/customer/rentals' || p === '/rentals')
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: FileText, 
      path: '/bookings', 
      match: (p) => typeof p === 'string' && (p === '/bookings' || p === '/customer/bookings')
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      path: '/settings', 
      match: (p) => typeof p === 'string' && (p === '/notifications' || p === '/customer/notifications')
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      path: currentUser?.publicId ? `/profile/${currentUser.publicId}` : '/settings', 
      match: (p) => typeof p === 'string' && (p.startsWith('/profile/') || p === '/settings')
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none">
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          /* COLLAPSED STATE PILL */
          <motion.div
            key="collapsed-pill"
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={dockStyle}
            onClick={() => setIsCollapsed(false)}
            className="px-4 py-2 flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-all shadow-xl"
          >
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-dark-accent animate-pulse' : 'bg-[#557373] animate-pulse'}`} />
            <span className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>
              REXPO Dock
            </span>
            <ChevronUp size={14} className={isDark ? 'text-mutedGrey' : 'text-[#557373]'} />
          </motion.div>
        ) : (
          /* EXPANDED FULL DOCK */
          <motion.div
            key="expanded-dock"
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={dockStyle}
            className="px-3 sm:px-5 h-16 flex items-center space-x-1 sm:space-x-2 shadow-2xl relative"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = Boolean(item.match(activePath));

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? (isDark 
                          ? 'bg-dark-accent text-white shadow-md' 
                          : 'bg-[#557373] text-white shadow-md') 
                      : (isDark 
                          ? 'text-mutedGrey hover:text-white hover:bg-white/5' 
                          : 'text-[#557373]/70 hover:text-[#557373] hover:bg-[#557373]/10')
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive ? 'inline-block' : 'hidden md:inline-block'
                  }`}>
                    {item.label}
                  </span>

                  {/* Active bottom indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeDockIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-white opacity-80"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Minimize / Collapse Dock Button */}
            <div className={`pl-2 border-l ${isDark ? 'border-white/10' : 'border-[#557373]/20'}`}>
              <button
                onClick={() => setIsCollapsed(true)}
                className={`p-1.5 rounded-lg transition-all ${
                  isDark 
                    ? 'text-mutedGrey hover:text-white hover:bg-white/10' 
                    : 'text-[#557373]/60 hover:text-[#557373] hover:bg-[#557373]/10'
                }`}
                title="Collapse dock"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
