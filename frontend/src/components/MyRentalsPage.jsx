import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Shield, 
  Truck, 
  MapPin, 
  Calendar, 
  AlertCircle,
  Sun,
  Moon,
  Settings,
  Box
} from 'lucide-react';

export default function MyRentalsPage({ isDark, onNavigate, currentUser, toggleTheme, onLogout }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'CONFIRMED', 'PROCESSING', 'RELEASED'

  const token = localStorage.getItem('rexpo_token');

  const fetchRentals = async () => {
    const activeToken = localStorage.getItem('rexpo_token') || token;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch rentals');
      setRentals(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRentals();
    }
  }, [currentUser]);

  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/70';
  const accentText = isDark ? 'text-dark-accent' : 'text-[#557373]';

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

  const filteredRentals = filter === 'ALL' 
    ? rentals 
    : rentals.filter(r => r.status === filter);

  return (
    <div className={`w-full min-h-screen flex flex-col transition-colors duration-500 pb-36 ${
      isDark ? 'bg-[#0D0D0D]' : 'bg-[#DFE5F3]'
    }`}>
      
      {/* Top Header Bar */}
      <div className={`h-16 px-6 md:px-12 border-b flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark ? 'border-white/5 bg-[#0D0D0D]/80' : 'border-[#557373]/15 bg-[#DFE5F3]/85'
      }`}>
        <button 
          onClick={() => onNavigate('/dashboard')} 
          className={`flex items-center space-x-2 font-bold uppercase tracking-wider text-[10px] ${
            isDark ? textColor : 'text-[#557373]'
          }`}
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button 
            onClick={() => onNavigate('/settings')}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
            }`}
            aria-label="Portal Settings"
          >
            <Settings size={15} />
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border hover:opacity-85 transition-all focus:outline-none ${
              isDark ? 'border-white/10 bg-white/5 text-white' : 'border-[#557373]/30 bg-[#557373]/15 text-[#557373]'
            }`}
            title="View Profile"
          >
            {currentUser ? currentUser.fullName.slice(0, 2).toUpperCase() : 'US'}
          </button>
        </div>
      </div>

      {/* Main Rental Container */}
      <main className="w-full max-w-6xl mx-auto px-6 md:px-8 pt-8 space-y-8 flex-1">
        
        {/* Title & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className={`text-[9px] uppercase tracking-wider font-extrabold ${accentText}`}>Client Workspace</span>
            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${textColor}`}>My Rentals</h1>
          </div>

          {/* Filter Pills */}
          <div className={`p-1 rounded-xl border flex items-center space-x-1 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-[#557373]/20'
          }`}>
            {['ALL', 'CONFIRMED', 'PROCESSING', 'RELEASED'].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                  filter === st
                    ? (isDark ? 'bg-dark-accent text-white shadow-sm' : 'bg-[#557373] text-white shadow-sm')
                    : subText
                }`}
              >
                {st === 'CONFIRMED' ? 'Active' : st === 'PROCESSING' ? 'Pending' : st === 'RELEASED' ? 'Returned' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-16 text-center">
            <span className={`text-xs font-mono tracking-widest animate-pulse uppercase ${subText}`}>Loading your rentals...</span>
          </div>
        ) : error ? (
          <div style={glassCardStyle} className="p-6 text-xs flex items-center space-x-3 text-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : filteredRentals.length === 0 ? (
          /* Task 1: Professional Empty State */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={glassCardStyle} 
            className="p-16 text-center space-y-4 max-w-xl mx-auto my-8"
          >
            <div className={`p-4 rounded-2xl inline-block ${isDark ? 'bg-dark-accent/10 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}>
              <Layers size={36} />
            </div>
            <div className="space-y-1">
              <h3 className={`font-bold text-base ${textColor}`}>No active rentals.</h3>
              <p className={`text-xs ${subText}`}>
                Your rentals will appear here once you book a product from the equipment catalog.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('/products')}
              className={`font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md mt-2 inline-block ${
                isDark ? 'bg-dark-accent hover:bg-dark-accent/90 text-white' : 'bg-[#557373] hover:bg-[#557373]/90 text-white'
              }`}
            >
              Browse Catalog
            </button>
          </motion.div>
        ) : (
          /* Rental Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRentals.map(rental => (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={glassCardStyle}
                className="p-6 flex flex-col justify-between space-y-5"
              >
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-borderGrey/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-base ${textColor}`}>{rental.product_name || rental.productName}</span>
                    </div>
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase border inline-block ${
                      isDark ? 'bg-white/5 border-white/10 text-mutedGrey' : 'bg-[#557373]/10 border-[#557373]/20 text-[#557373]'
                    }`}>
                      Booking #{rental.id}
                    </span>
                  </div>

                  <span className={`text-[8px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    rental.status === 'CONFIRMED'
                      ? (isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]')
                      : rental.status === 'RELEASED'
                        ? (isDark ? 'bg-mutedGrey/20 text-mutedGrey' : 'bg-[#557373]/20 text-[#557373]')
                        : (isDark ? 'bg-warning/15 text-warning' : 'bg-[#557373]/10 text-[#557373]')
                  }`}>
                    {rental.status === 'CONFIRMED' ? 'Active Rental' : rental.status === 'RELEASED' ? 'Returned' : 'Pending Approval'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Hub Depot</span>
                    <p className={`font-semibold ${textColor} flex items-center space-x-1`}>
                      <MapPin size={11} className={accentText} />
                      <span>{rental.product_hub_name || rental.hubName || 'Central Hub'}</span>
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Fulfillment</span>
                    <p className={`font-semibold ${textColor} flex items-center space-x-1`}>
                      <Truck size={11} className={accentText} />
                      <span>{rental.delivery_choice || rental.deliveryChoice || 'Pickup'}</span>
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Rental Period</span>
                    <p className={`font-semibold ${textColor} flex items-center space-x-1`}>
                      <Calendar size={11} className={accentText} />
                      <span>{rental.duration} ({rental.date})</span>
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Security Escrow</span>
                    <p className={`font-semibold ${textColor} flex items-center space-x-1`}>
                      <Shield size={11} className={accentText} />
                      <span>₹{(Number(rental.product_deposit) || Number(rental.productDeposit) || 0).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Pricing Footer */}
                <div className={`pt-4 border-t flex justify-between items-center ${
                  isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'
                }`}>
                  <div>
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Total Rental Fee</span>
                    <p className={`text-base font-black font-mono ${accentText}`}>
                      ₹{(Number(rental.product_price) || Number(rental.productPrice) || 0).toLocaleString()}
                    </p>
                  </div>

                  <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-white/5 text-mutedGrey' : 'bg-[#557373]/10 text-[#557373]'
                  }`}>
                    {rental.status === 'RELEASED' ? 'Escrow Released' : 'Deposit Held'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
