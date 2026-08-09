import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Compass, 
  Clock, 
  FileText, 
  Bell, 
  User, 
  Search, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CustomerDashboard({ isDark, onNavigate, currentUser, onLogout, toggleTheme }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'rentals', 'notifications'
  const [showNotifications, setShowNotifications] = useState(false);

  const token = localStorage.getItem('rexpo_token');

  const fetchBookings = async () => {
    const activeToken = localStorage.getItem('rexpo_token') || token;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
      setBookings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/70';
  const accentText = isDark ? 'text-dark-accent' : 'text-[#557373]';
  
  // Enterprise Rectangular Glassmorphic Card Styling
  const glassCardStyle = {
    background: isDark ? 'rgba(25, 25, 25, 0.45)' : 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(85, 115, 115, 0.15)',
    borderRadius: '16px',
    boxShadow: isDark 
      ? '0 20px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 20px 60px rgba(85, 115, 115, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  // Stats Calculations
  const activeCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const processingCount = bookings.filter(b => b.status === 'PROCESSING').length;
  const completedCount = bookings.filter(b => b.status === 'RELEASED').length;
  
  const totalDepositHold = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'PROCESSING')
    .reduce((sum, b) => sum + (Number(b.product_deposit) || Number(b.productDeposit) || 0), 0);

  return (
    <div className={`w-full min-h-screen flex flex-col relative transition-colors duration-500 pb-36 ${
      isDark ? 'bg-[#0D0D0D]' : 'bg-[#DFE5F3]'
    }`}>
      
      {/* CENTRALIZED TOP HEADER */}
      <header className={`w-full h-16 px-6 md:px-12 border-b flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark ? 'border-white/5 bg-[#0D0D0D]/80' : 'border-[#557373]/15 bg-[#DFE5F3]/85'
      }`}>
        {/* Brand Logo & Role Tag */}
        <div className="flex items-center space-x-3">
          <span 
            onClick={() => onNavigate('/')}
            className={`text-2xl font-black font-display tracking-tight cursor-pointer hover:opacity-80 transition-opacity ${textColor}`}
          >
            REXPO
          </span>
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border ${
            isDark ? 'bg-dark-accent/15 text-dark-accent border-dark-accent/20' : 'bg-[#557373]/15 text-[#557373] border-[#557373]/20'
          }`}>
            Workspace
          </span>
        </div>

        {/* Global Search Bar (Task: Glass background, low opacity #557373 border) */}
        <div className="hidden md:flex relative w-80">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subText}`} size={14} />
          <input 
            type="text" 
            placeholder="Search equipment, orders, status..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white placeholder-mutedGrey/40 focus:border-dark-accent/50' 
                : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A] placeholder-[#557373]/50 focus:border-[#557373]'
            }`}
          />
        </div>

        {/* Action Controls & User Account */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Portal Settings */}
          <button 
            onClick={() => onNavigate('/settings')}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
            }`}
            aria-label="Portal Settings"
          >
            <Settings size={15} />
          </button>

          {/* User Profile Avatar */}
          <button 
            onClick={() => onNavigate('profile')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border hover:opacity-85 transition-all focus:outline-none ${
              isDark ? 'border-white/10 bg-white/5 text-white' : 'border-[#557373]/30 bg-[#557373]/15 text-[#557373]'
            }`}
            title="View Profile"
          >
            {currentUser ? currentUser.fullName.slice(0, 2).toUpperCase() : 'US'}
          </button>

          {/* Sign Out */}
          <button 
            onClick={onLogout}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-danger/20 text-danger hover:bg-danger/10' : 'border-[#557373]/30 text-[#557373] hover:bg-[#557373]/15'
            }`}
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* CENTRALIZED DASHBOARD BODY */}
      <main className="w-full max-w-6xl mx-auto px-6 md:px-8 pt-8 space-y-8 flex-1">
        
        {/* WELCOME BANNER AREA */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={glassCardStyle}
          className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="space-y-2 max-w-xl z-10">
            <span className={`text-[9px] font-extrabold uppercase tracking-widest ${accentText}`}>Rental Control Workspace</span>
            <h1 className={`text-3xl md:text-4xl font-normal tracking-tight font-display ${accentText}`}>
              Welcome back, {currentUser ? currentUser.fullName : 'Valued Client'}
            </h1>
            <p className={`text-xs ${subText} leading-relaxed`}>
              Manage active rentals, review equipment bookings, and keep track of security deposits in real time.
            </p>
          </div>

          <div className="flex items-center space-x-3 z-10">
            <button 
              onClick={() => onNavigate('/products')}
              className={`font-semibold text-xs px-5 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-lg ${
                isDark 
                  ? 'bg-dark-accent hover:bg-dark-accent/90 text-white shadow-dark-accent/20' 
                  : 'bg-[#557373] hover:bg-[#557373]/90 text-white shadow-[#557373]/20'
              }`}
            >
              <span>Explore Equipment Catalog</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* LOADING & ERROR OVERLAYS */}
        {loading ? (
          <div className="p-16 text-center">
            <span className={`text-xs font-mono tracking-widest animate-pulse uppercase ${subText}`}>Syncing Rental Dashboard...</span>
          </div>
        ) : error ? (
          <div style={glassCardStyle} className={`p-6 text-xs flex items-center space-x-3 ${isDark ? 'text-danger' : 'text-[#557373]'}`}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* RECTANGULAR METRICS GRID (4 COLUMNS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Active Rentals */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                style={glassCardStyle} 
                className="p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold tracking-widest uppercase ${subText}`}>Active Rentals</span>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]'}`}><Activity size={14} /></div>
                </div>
                <div>
                  <p className={`text-3xl font-black ${textColor}`}>{activeCount}</p>
                  <p className={`text-[9px] ${subText} mt-1`}>Currently dispatched items</p>
                </div>
              </motion.div>

              {/* Processing Holds */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={glassCardStyle} 
                className="p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold tracking-widest uppercase ${subText}`}>Pending Approvals</span>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-warning/15 text-warning' : 'bg-[#557373]/15 text-[#557373]'}`}><Clock size={14} /></div>
                </div>
                <div>
                  <p className={`text-3xl font-black ${textColor}`}>{processingCount}</p>
                  <p className={`text-[9px] ${subText} mt-1`}>Awaiting depot confirmation</p>
                </div>
              </motion.div>

              {/* Settled Returns */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                style={glassCardStyle} 
                className="p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold tracking-widest uppercase ${subText}`}>Settled Returns</span>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/15 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><CheckCircle2 size={14} /></div>
                </div>
                <div>
                  <p className={`text-3xl font-black ${textColor}`}>{completedCount}</p>
                  <p className={`text-[9px] ${subText} mt-1`}>Completed rental cycles</p>
                </div>
              </motion.div>

              {/* Escrow Deposit Captured */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                style={glassCardStyle} 
                className={`p-6 flex flex-col justify-between space-y-4 ${isDark ? 'border-dark-accent/30' : 'border-[#557373]/30'}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold tracking-widest uppercase ${accentText}`}>Escrow Captured</span>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/20 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><Shield size={14} /></div>
                </div>
                <div>
                  <p className={`text-3xl font-black ${accentText}`}>₹{totalDepositHold.toLocaleString()}</p>
                  <p className={`text-[9px] ${subText} mt-1`}>Refundable deposit holds</p>
                </div>
              </motion.div>

            </div>

            {/* NOTIFICATIONS TAB VIEW / FEED */}
            {activeTab === 'notifications' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={glassCardStyle}
                className="p-6 space-y-4"
              >
                <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${textColor}`}>System Notifications</h3>
                  <span className={`text-[9px] ${subText}`}>Recent alerts</span>
                </div>

                <div className="space-y-3 text-xs">
                  {bookings.length === 0 ? (
                    <div className="p-8 text-center text-mutedGrey">
                      <p>No notifications at this time.</p>
                    </div>
                  ) : (
                    bookings.map(b => (
                      <div key={b.id} className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        isDark ? 'border-borderGrey/10' : 'border-[#557373]/15 bg-white/40'
                      }`}>
                        <div className="space-y-0.5">
                          <p className={`font-bold ${textColor}`}>Booking #{b.id} — {b.product_name || b.productName}</p>
                          <p className={subText}>Current Status: <span className={`font-semibold ${accentText}`}>{b.status}</span></p>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                          b.status === 'CONFIRMED' 
                            ? (isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]') 
                            : b.status === 'RELEASED' 
                              ? (isDark ? 'bg-mutedGrey/20 text-mutedGrey' : 'bg-[#557373]/20 text-[#557373]') 
                              : (isDark ? 'bg-warning/15 text-warning' : 'bg-[#557373]/10 text-[#557373]')
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* RECTANGULAR CONTENT PANELS */}
            {(activeTab === 'dashboard' || activeTab === 'rentals') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* My Active Rental Periods */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={glassCardStyle} 
                  className="p-6 space-y-5"
                >
                  <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                    <div>
                      <h3 className={`font-bold text-sm uppercase tracking-tight ${textColor}`}>My Active Rentals</h3>
                      <p className={`text-[9px] ${subText}`}>Ongoing equipment agreements</p>
                    </div>
                    <button 
                      onClick={() => onNavigate('/bookings')}
                      className={`text-[9px] font-bold uppercase tracking-wider ${accentText} hover:underline flex items-center space-x-1`}
                    >
                      <span>View All</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PROCESSING').length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <p className={`font-bold text-xs ${textColor}`}>No active rentals</p>
                        <p className={`text-[10px] ${subText}`}>Your current active rentals will appear here.</p>
                      </div>
                    ) : (
                      bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PROCESSING').map(b => (
                        <div key={b.id} className={`p-4 rounded-xl border flex justify-between items-center gap-4 ${
                          isDark ? 'border-borderGrey/10' : 'border-[#557373]/15 bg-white/40'
                        }`}>
                          <div className="space-y-1">
                            <p className={`font-bold text-xs ${textColor}`}>{b.product_name || b.productName}</p>
                            <p className={`text-[9px] ${subText}`}>Hub: <span className="font-semibold">{b.product_hub_name || b.hubName || 'Central Hub'}</span> | Duration: <span className="font-semibold">{b.duration}</span></p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[8px] font-bold px-2.5 py-1 rounded-md uppercase block ${
                              b.status === 'CONFIRMED' 
                                ? (isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]') 
                                : (isDark ? 'bg-warning/15 text-warning' : 'bg-[#557373]/10 text-[#557373]')
                            }`}>
                              {b.status}
                            </span>
                            <span className={`text-[8px] ${subText} block mt-1`}>Deposit: ₹{(Number(b.product_deposit) || Number(b.productDeposit) || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Settled Operations History */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={glassCardStyle} 
                  className="p-6 space-y-5"
                >
                  <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                    <div>
                      <h3 className={`font-bold text-sm uppercase tracking-tight ${textColor}`}>Settled Operations History</h3>
                      <p className={`text-[9px] ${subText}`}>Completed returns & refunded deposits</p>
                    </div>
                    <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]'
                    }`}>Verified</span>
                  </div>

                  <div className="space-y-3">
                    {bookings.filter(b => b.status === 'RELEASED').length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <p className={`font-bold text-xs ${textColor}`}>No completed cycles</p>
                        <p className={`text-[10px] ${subText}`}>Returned items and released escrow funds will log here.</p>
                      </div>
                    ) : (
                      bookings.filter(b => b.status === 'RELEASED').map(b => (
                        <div key={b.id} className={`p-4 rounded-xl border flex items-center space-x-3 ${
                          isDark ? 'border-borderGrey/10' : 'border-[#557373]/15 bg-white/40'
                        }`}>
                          <div className={`p-2.5 rounded-xl shrink-0 ${isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]'}`}><CheckCircle2 size={16} /></div>
                          <div className="text-[10px] space-y-0.5 overflow-hidden">
                            <p className={`font-bold ${textColor} truncate`}>{b.product_name || b.productName} (Booking #{b.id})</p>
                            <p className={`${subText} truncate`}>Inspection complete. Escrow deposit hold released.</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

              </div>
            )}
          </>
        )}

      </main>

    </div>
  );
}
