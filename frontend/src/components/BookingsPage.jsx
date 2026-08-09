import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, Calendar, FileText, Check } from 'lucide-react';

export default function BookingsPage({ isDark, onNavigate, currentUser, showBackButton = true }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const handleApprove = async (bookingId) => {
    const activeToken = localStorage.getItem('rexpo_token') || token;
    try {
      const response = await fetch('/api/bookings/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ bookingId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve booking');
      }
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSettle = async (bookingId) => {
    const activeToken = localStorage.getItem('rexpo_token') || token;
    try {
      const response = await fetch('/api/bookings/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ bookingId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to settle return');
      }
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

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

  return (
    <div className={`w-full min-h-screen flex flex-col items-center p-6 relative transition-colors duration-500 pt-24 pb-32 ${
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
        <span>Back to Workspace</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={glassPanelStyle}
        className="w-full max-w-4xl p-8 md:p-10 space-y-6"
      >
        {/* Header */}
        <div className={`border-b pb-4 flex justify-between items-center ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
          <div className="space-y-1">
            <h2 className={`text-2xl font-black uppercase tracking-tight font-display ${accentText}`}>Bookings Registry</h2>
            <p className={`text-[10px] ${subText}`}>Audit active agreements and operations logs.</p>
          </div>
          <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase border ${
            isDark ? 'bg-dark-accent/15 text-dark-accent border-dark-accent/20' : 'bg-[#557373]/15 text-[#557373] border-[#557373]/20'
          }`}>
            {currentUser ? currentUser.role : 'Guest'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className={`text-xs font-mono tracking-widest animate-pulse uppercase ${subText}`}>Syncing Bookings...</span>
          </div>
        ) : error ? (
          <div className={`p-4 rounded-xl border text-xs flex items-center space-x-3 ${
            isDark ? 'border-danger/20 bg-danger/5 text-danger' : 'border-[#557373]/20 bg-[#557373]/10 text-[#557373]'
          }`}>
            <ShieldAlert size={15} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className={`p-8 text-center ${subText}`}>
                <span>No bookings yet.</span>
              </div>
            ) : (
              <div className={`divide-y ${isDark ? 'divide-borderGrey/10' : 'divide-[#557373]/15'}`}>
                {bookings.map(b => (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-sm ${textColor}`}>{b.product_name || b.productName}</span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase border ${
                          isDark ? 'bg-borderGrey/10 text-mutedGrey border-white/5' : 'bg-[#557373]/10 text-[#557373] border-[#557373]/20'
                        }`}>#{b.id}</span>
                      </div>
                      <p className={subText}>Rented by: <span className={`font-semibold ${textColor}`}>{b.user_name || b.userName || (currentUser && currentUser.fullName)}</span></p>
                      <p className={subText}>Hub: <span className={`font-semibold ${textColor}`}>{b.product_hub_name || b.hubName || 'Central Hub'}</span> | Delivery: <span className="font-semibold">{b.delivery_choice || b.deliveryChoice || 'Pickup'}</span> | Duration: <span className="font-semibold">{b.duration}</span></p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-mono font-bold ${accentText}`}>₹{Number(b.product_price || b.productPrice || 0).toLocaleString()}</p>
                        <span className={`text-[8px] ${subText}`}>Deposit: ₹{Number(b.product_deposit || b.productDeposit || 0).toLocaleString()}</span>
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

                      {/* Approvals and return controls (Hub Owner or Admin only) */}
                      {(currentUser && (currentUser.role === 'HUB_OWNER' || currentUser.role === 'SUPER_ADMIN')) && (
                        <div className="flex space-x-2">
                          {b.status === 'PROCESSING' && (
                            <button 
                              onClick={() => handleApprove(b.id)}
                              className={`text-white font-bold px-3 py-1.5 rounded-[10px] uppercase tracking-wider text-[10px] transition-all ${
                                isDark ? 'bg-success hover:bg-success/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                              }`}
                            >
                              Approve
                            </button>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button 
                              onClick={() => handleSettle(b.id)}
                              className={`text-white font-bold px-3 py-1.5 rounded-[10px] uppercase tracking-wider text-[10px] transition-all ${
                                isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                              }`}
                            >
                              Settle Return
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

    </div>
  );
}
