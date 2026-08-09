import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Package, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Sun, 
  Moon, 
  LogOut, 
  ShieldAlert,
  Navigation,
  Check
} from 'lucide-react';

export default function DeliveryPartnerWorkspace({ isDark, currentUser, onLogout, toggleTheme, onNavigate }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const token = localStorage.getItem('rexpo_token');

  const fetchDeliveries = async () => {
    const activeToken = localStorage.getItem('rexpo_token') || token;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/rider/deliveries', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load assigned deliveries');
      setDeliveries(data.deliveries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleMarkDispatch = async (deliveryId) => {
    setActionLoadingId(deliveryId);
    try {
      const activeToken = localStorage.getItem('rexpo_token') || token;
      const response = await fetch(`/api/rider/deliveries/${deliveryId}/dispatch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update delivery status');
      fetchDeliveries();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkDelivered = async (deliveryId) => {
    setActionLoadingId(deliveryId);
    try {
      const activeToken = localStorage.getItem('rexpo_token') || token;
      const response = await fetch(`/api/rider/deliveries/${deliveryId}/deliver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to complete delivery');
      fetchDeliveries();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/80';
  const accentText = isDark ? 'text-dark-accent' : 'text-[#557373]';

  const cardStyle = {
    background: isDark ? 'rgba(25, 25, 25, 0.55)' : 'rgba(255, 255, 255, 0.90)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.70)',
    borderRadius: '24px',
    boxShadow: isDark 
      ? '0 16px 40px rgba(0, 0, 0, 0.3)'
      : '0 12px 36px rgba(85, 115, 115, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  const filteredDeliveries = deliveries.filter(d => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return d.status === 'CONFIRMED' || d.status === 'PROCESSING';
    if (filterStatus === 'OUT') return d.status === 'DISPATCHED';
    if (filterStatus === 'COMPLETED') return d.status === 'DELIVERED' || d.status === 'RELEASED';
    return true;
  });

  return (
    <div className={`w-full min-h-screen flex flex-col font-sans transition-colors duration-300 text-xs ${
      isDark ? 'bg-[#0D0D0D] text-white' : 'bg-[#DFE5F3] text-[#1A1A1A]'
    }`}>
      
      {/* HEADER */}
      <header className={`h-16 px-6 md:px-10 flex items-center justify-between border-b z-40 ${
        isDark ? 'border-white/5 bg-[#0D0D0D]' : 'border-[#557373]/15 bg-[#DFE5F3]/80 backdrop-blur-md'
      }`}>
        <div className="flex items-center space-x-3">
          <span 
            onClick={() => onNavigate && onNavigate('/')}
            className="font-serif italic font-extrabold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          >
            REXPO
          </span>
          <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
            isDark ? 'border-white/10 bg-white/5 text-dark-accent' : 'border-[#557373]/25 bg-[#557373]/10 text-[#557373]'
          }`}>
            DELIVERY PARTNER
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 bg-white/60 hover:bg-white text-[#557373]'
            }`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          
          <button 
            onClick={onLogout}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isDark ? 'border-red-500/30 hover:bg-red-500/20 text-red-400' : 'border-[#557373]/20 bg-white/60 hover:bg-red-500 hover:text-white text-[#557373]'
            }`}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6">
        
        {/* HERO BANNER */}
        <div style={cardStyle} className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest ${subText}`}>
              DELIVERY RIDER PORTAL
            </span>
            <h1 className={`text-2xl font-serif italic font-normal ${textColor}`}>
              Assigned Deliveries Console
            </h1>
            <p className={`text-xs ${subText}`}>
              Manage order dispatch, customer drop-offs, and status updates for your assigned hub.
            </p>
          </div>

          {/* FILTER TABS */}
          <div className="flex border rounded-full p-1 border-[#557373]/20 bg-white/60 text-[9px] font-bold uppercase tracking-wider">
            {['ALL', 'PENDING', 'OUT', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full transition-all ${
                  filterStatus === st ? 'bg-[#557373] text-white shadow-sm' : 'text-[#557373] hover:text-[#1A1A1A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs ${
            isDark ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-red-500/10 border-red-500/20 text-red-600'
          }`}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* DELIVERIES LIST */}
        {loading ? (
          <div className="p-12 text-center text-[#557373]">
            <span className="w-6 h-6 border-2 border-t-transparent border-current rounded-full animate-spin inline-block mb-2"></span>
            <p className="font-mono text-xs">Loading assigned deliveries...</p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div style={cardStyle} className="p-12 text-center text-[#557373]/70 space-y-2">
            <Truck size={32} className="mx-auto opacity-50 text-[#557373]" />
            <h3 className={`font-bold text-sm ${textColor}`}>No Deliveries Found</h3>
            <p className="text-xs">There are no orders matching your current filter in your assigned hub.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((del) => (
              <div key={del.id} style={cardStyle} className="p-6 space-y-4 relative overflow-hidden transition-all hover:translate-y-[-2px]">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#557373]/15 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-xs text-[#557373]">#{del.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      del.status === 'DELIVERED' || del.status === 'RELEASED'
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600'
                        : del.status === 'DISPATCHED'
                        ? 'bg-amber-500/10 border-amber-500/25 text-amber-600'
                        : 'bg-[#557373]/10 border-[#557373]/25 text-[#557373]'
                    }`}>
                      {del.status === 'DISPATCHED' ? 'OUT FOR DELIVERY' : del.status}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${subText}`}>
                    {new Date(del.created_at || Date.now()).toLocaleString()}
                  </span>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Product Details */}
                  <div className="space-y-1">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subText}`}>PRODUCT INFO</span>
                    <p className={`font-bold ${textColor}`}>{del.product_name}</p>
                    <p className={`text-[10px] ${subText} font-mono`}>Duration: {del.duration || 'Daily Rental'}</p>
                    <p className={`text-[10px] ${subText} font-mono font-bold`}>Depot: {del.product_hub_name || 'Central'}</p>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-1">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subText}`}>CUSTOMER CONTACT</span>
                    <p className={`font-bold ${textColor}`}>{del.user_name || 'Customer'}</p>
                    <p className={`text-[10px] ${subText} font-mono flex items-center space-x-1`}>
                      <Phone size={12} className="text-[#557373]" />
                      <span>{del.user_phone || 'N/A'}</span>
                    </p>
                  </div>

                  {/* Delivery Location */}
                  <div className="space-y-1">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subText}`}>DELIVERY LOCATION</span>
                    <p className={`text-[11px] font-medium ${textColor} flex items-start space-x-1`}>
                      <MapPin size={13} className="text-[#557373] shrink-0 mt-0.5" />
                      <span>{del.delivery_choice === 'delivery' ? 'Doorstep Delivery Address' : 'Self Pickup at Hub'}</span>
                    </p>
                  </div>

                </div>

                {/* Actions row */}
                <div className="pt-3 border-t border-[#557373]/10 flex justify-end space-x-3">
                  {del.status === 'CONFIRMED' || del.status === 'PROCESSING' ? (
                    <button
                      onClick={() => handleMarkDispatch(del.id)}
                      disabled={actionLoadingId === del.id}
                      className={`px-5 py-2.5 rounded-full text-white font-bold text-[10px] uppercase tracking-wider shadow-md transition-all flex items-center space-x-1.5 ${
                        isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                      }`}
                    >
                      <Navigation size={12} />
                      <span>{actionLoadingId === del.id ? 'Updating...' : 'Start Delivery (Out For Delivery)'}</span>
                    </button>
                  ) : del.status === 'DISPATCHED' ? (
                    <button
                      onClick={() => handleMarkDelivered(del.id)}
                      disabled={actionLoadingId === del.id}
                      className="px-5 py-2.5 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-wider shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <Check size={12} />
                      <span>{actionLoadingId === del.id ? 'Updating...' : 'Mark Delivered'}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 size={12} />
                      <span>Delivery Completed</span>
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
