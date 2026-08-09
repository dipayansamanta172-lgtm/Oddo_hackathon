import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  Box, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2, 
  Shield, 
  Key,
  Store,
  Activity,
  Layers,
  Search,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function SuperAdminWorkspace({ isDark, currentUser, onLogout, toggleTheme, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'admins', 'marketplace', 'settings'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Overview Data States
  const [admins, setAdmins] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  // Change Password Form State
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const token = localStorage.getItem('rexpo_token');

  const fetchOverview = async () => {
    const activeToken = localStorage.getItem('rexpo_token') || token;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/super-admin/overview', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load Super Admin overview data');
      setAdmins(data.admins || []);
      setHubs(data.hubs || []);
      setMarketplaceListings(data.marketplaceListings || []);
      setUsers(data.users || []);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      setPwdError('Please complete all password fields.');
      return;
    }

    if (pwdNew !== pwdConfirm) {
      setPwdError('New password and confirmation password do not match.');
      return;
    }

    const activeToken = localStorage.getItem('rexpo_token') || token;
    setPwdLoading(true);

    try {
      const response = await fetch('/api/auth/super-admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          currentPassword: pwdCurrent,
          newPassword: pwdNew,
          confirmPassword: pwdConfirm
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password.');

      setPwdSuccess('Super Admin password updated successfully.');
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/80';
  const accentText = isDark ? 'text-dark-accent' : 'text-[#557373]';

  const cardContainerStyle = {
    background: isDark ? 'rgba(25, 25, 25, 0.55)' : 'rgba(255, 255, 255, 0.90)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.70)',
    borderRadius: '24px',
    boxShadow: isDark 
      ? '0 16px 40px rgba(0, 0, 0, 0.3)'
      : '0 12px 36px rgba(85, 115, 115, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  const glassInputStyle = {
    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(85, 115, 115, 0.25)',
    borderRadius: '12px',
    color: isDark ? '#ffffff' : '#1A1A1A'
  };

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'admins', label: 'ADMINS & HUBS', icon: Building },
    { id: 'marketplace', label: 'MARKETPLACE', icon: Store },
    { id: 'settings', label: 'SECURITY', icon: Key },
  ];

  return (
    <div className={`w-full min-h-screen flex flex-col font-sans transition-colors duration-300 text-xs ${
      isDark ? 'bg-[#0D0D0D] text-white' : 'bg-[#DFE5F3] text-[#1A1A1A]'
    }`}>
      
      {/* 1. TOP HEADER BAR (MATCHING IMAGE 2 TOP BAR) */}
      <header className={`h-16 px-8 flex items-center justify-between border-b z-40 transition-colors ${
        isDark ? 'border-white/5 bg-[#0D0D0D]' : 'border-[#557373]/15 bg-[#DFE5F3]/80 backdrop-blur-md'
      }`}>
        {/* Left Brand + Pill Badge */}
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
            WORKSPACE
          </span>
        </div>

        {/* Center Search Bar */}
        <div className="w-96 relative hidden md:block">
          <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${subText}`} />
          <input 
            type="text" 
            placeholder="Search equipment, orders, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={glassInputStyle}
            className={`w-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#557373]/30 transition-all`}
          />
        </div>

        {/* Right Icon Controls */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 bg-white/60 hover:bg-white text-[#557373]'
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 bg-white/60 hover:bg-white text-[#557373]'
            }`}
            aria-label="Security Settings"
          >
            <Settings size={15} />
          </button>

          <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs ${
            isDark ? 'border-white/10 bg-white/10 text-white' : 'border-[#557373]/30 bg-[#557373]/15 text-[#557373]'
          }`}>
            SA
          </div>

          <button 
            onClick={onLogout}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isDark ? 'border-red-500/30 hover:bg-red-500/20 text-red-400' : 'border-[#557373]/20 bg-white/60 hover:bg-red-500 hover:text-white text-[#557373]'
            }`}
            aria-label="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-6xl w-full mx-auto space-y-8 pb-32">
        
        {/* 2. HERO WELCOME CARD (MATCHING IMAGE 2 HERO BANNER) */}
        <div style={cardContainerStyle} className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl">
            <span className={`text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] ${subText}`}>
              RENTAL CONTROL WORKSPACE
            </span>
            <h1 className={`text-3xl md:text-4xl font-serif italic font-normal tracking-tight ${textColor}`}>
              Welcome back, Super Admin
            </h1>
            <p className={`text-xs ${subText} leading-relaxed font-normal`}>
              Manage active rentals, review equipment bookings, and keep track of security deposits in real time.
            </p>
          </div>

          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`px-6 py-3 rounded-full font-semibold text-xs transition-all shadow-md flex items-center space-x-2 shrink-0 ${
              isDark ? 'bg-dark-accent hover:bg-dark-accent/90 text-white' : 'bg-[#557373] hover:bg-[#557373]/90 text-white'
            }`}
          >
            <span>Explore Equipment Catalog</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {error && (
          <div className={`p-4 rounded-2xl border flex items-center space-x-3 text-xs ${
            isDark ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-red-500/10 border-red-500/20 text-red-600'
          }`}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: SYSTEM OVERVIEW (DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* 3. 4 METRIC STATISTIC CARDS (MATCHING IMAGE 2 METRIC CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Metric 1 */}
              <div style={cardContainerStyle} className="p-6 relative overflow-hidden transition-all hover:translate-y-[-2px]">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subText}`}>ACTIVE RENTALS</span>
                  <div className="w-8 h-8 rounded-full bg-[#557373]/10 text-[#557373] flex items-center justify-center">
                    <Activity size={15} />
                  </div>
                </div>
                <p className={`text-3xl font-bold font-mono ${textColor} mt-3 mb-1`}>{admins.length}</p>
                <p className={`text-[10px] ${subText} font-medium`}>Currently dispatched items</p>
              </div>

              {/* Metric 2 */}
              <div style={cardContainerStyle} className="p-6 relative overflow-hidden transition-all hover:translate-y-[-2px]">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subText}`}>PENDING APPROVALS</span>
                  <div className="w-8 h-8 rounded-full bg-[#557373]/10 text-[#557373] flex items-center justify-center">
                    <Building size={15} />
                  </div>
                </div>
                <p className={`text-3xl font-bold font-mono ${textColor} mt-3 mb-1`}>{hubs.length}</p>
                <p className={`text-[10px] ${subText} font-medium`}>Awaiting depot confirmation</p>
              </div>

              {/* Metric 3 */}
              <div style={cardContainerStyle} className="p-6 relative overflow-hidden transition-all hover:translate-y-[-2px]">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subText}`}>SETTLED RETURNS</span>
                  <div className="w-8 h-8 rounded-full bg-[#557373]/10 text-[#557373] flex items-center justify-center">
                    <CheckCircle2 size={15} />
                  </div>
                </div>
                <p className={`text-3xl font-bold font-mono ${textColor} mt-3 mb-1`}>{marketplaceListings.length}</p>
                <p className={`text-[10px] ${subText} font-medium`}>Completed rental cycles</p>
              </div>

              {/* Metric 4 */}
              <div style={cardContainerStyle} className="p-6 relative overflow-hidden transition-all hover:translate-y-[-2px]">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${subText}`}>ESCROW CAPTURED</span>
                  <div className="w-8 h-8 rounded-full bg-[#557373]/10 text-[#557373] flex items-center justify-center">
                    <Shield size={15} />
                  </div>
                </div>
                <p className={`text-3xl font-bold font-mono ${accentText} mt-3 mb-1`}>₹1,500</p>
                <p className={`text-[10px] ${subText} font-medium`}>Refundable deposit holds</p>
              </div>

            </div>

            {/* 4. 2-COLUMN LOWER CONTENT GRID (MATCHING IMAGE 2 LOWER PANELS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Column 1: Active Rentals / Admins List */}
              <div style={cardContainerStyle} className="p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-[#557373]/15 pb-3">
                  <div>
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>MY ACTIVE RENTALS</h3>
                    <p className={`text-[10px] ${subText}`}>Ongoing equipment agreements</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('admins')}
                    className={`text-[9px] font-bold uppercase tracking-wider text-[#557373] hover:underline flex items-center space-x-1`}
                  >
                    <span>VIEW ALL</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="space-y-3">
                  {admins.length === 0 ? (
                    <div className="p-6 text-center text-[#557373]/70 font-medium text-xs">
                      No active administrators logged.
                    </div>
                  ) : (
                    admins.slice(0, 3).map((adm) => (
                      <div key={adm.id} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                        isDark ? 'border-white/10 bg-white/5' : 'border-[#557373]/15 bg-white shadow-2xs'
                      }`}>
                        <div>
                          <h4 className={`font-bold text-xs ${textColor}`}>{adm.name}</h4>
                          <p className={`text-[10px] ${subText} font-mono mt-0.5`}>{adm.email} • {adm.role}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border border-[#557373]/30 bg-[#557373]/10 text-[#557373]">
                          CONFIRMED
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Activity Logs / Settled Operations History */}
              <div style={cardContainerStyle} className="p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-[#557373]/15 pb-3">
                  <div>
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>SETTLED OPERATIONS HISTORY</h3>
                    <p className={`text-[10px] ${subText}`}>Completed returns & refunded deposits</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-[#557373]/25 bg-[#557373]/10 text-[#557373]">
                    VERIFIED
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-[#557373]/70 space-y-1">
                      <p className="font-bold text-xs text-[#1A1A1A] dark:text-white">No completed cycles</p>
                      <p className="text-[10px]">Returned items and released escrow funds will log here.</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={`p-3.5 rounded-xl border flex justify-between items-center font-mono text-[10px] ${
                        isDark ? 'border-white/5 bg-white/5' : 'border-[#557373]/12 bg-white shadow-2xs'
                      }`}>
                        <span className={`font-semibold ${textColor}`}>{log.message}</span>
                        <span className={subText}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ADMINS & HUB OWNERS */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div style={cardContainerStyle} className="p-8 space-y-5">
              <div className="flex justify-between items-center border-b border-[#557373]/15 pb-4">
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${textColor}`}>Registered Administrators & Hub Owners</h3>
                  <p className={`text-[10px] ${subText}`}>Inspect all registered hub owners and system administrators.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className={`border-b text-[9px] uppercase tracking-wider ${subText}`}>
                      <th className="py-3.5 px-4">User ID / Public ID</th>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#557373]/10">
                    {admins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold">{adm.public_id || adm.id}</td>
                        <td className="py-3.5 px-4 font-semibold">{adm.name}</td>
                        <td className="py-3.5 px-4">{adm.email}</td>
                        <td className="py-3.5 px-4">{adm.phone || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                            adm.role === 'SUPER_ADMIN' 
                              ? 'bg-purple-500/10 text-purple-600 border-purple-500/25' 
                              : 'bg-[#557373]/10 text-[#557373] border-[#557373]/30'
                          }`}>
                            {adm.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{new Date(adm.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN MARKETPLACE LISTINGS */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div style={cardContainerStyle} className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-[#557373]/15 pb-4">
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${textColor}`}>Admin Marketplace Listings</h3>
                  <p className={`text-[10px] ${subText}`}>Read-only inspection of admin equipment listings across all hubs.</p>
                </div>
              </div>
              
              {marketplaceListings.length === 0 ? (
                <p className={`p-8 text-center ${subText}`}>No admin product listings created in marketplace yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplaceListings.map((item) => (
                    <div key={item.id} className={`p-5 rounded-2xl border space-y-3 transition-all hover:translate-y-[-2px] ${
                      isDark ? 'border-white/10 bg-black/30' : 'border-[#557373]/15 bg-white shadow-2xs'
                    }`}>
                      {item.imageUrl ? (
                        <div className="w-full h-36 rounded-xl overflow-hidden border border-[#557373]/15">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-36 rounded-xl bg-[#557373]/5 border border-[#557373]/15 flex items-center justify-center text-mutedGrey">
                          <span>No Image Available</span>
                        </div>
                      )}
                      <div>
                        <span className={`text-[9px] font-mono font-semibold text-[#557373]`}>Owner: {item.ownerName || 'Admin'} ({item.ownerEmail})</span>
                        <h4 className={`font-bold text-sm ${textColor} mt-0.5`}>{item.name}</h4>
                        <p className={`text-[10px] ${subText} line-clamp-2 mt-0.5`}>{item.description}</p>
                      </div>
                      <div className="pt-2.5 border-t border-[#557373]/10 flex justify-between items-center font-mono text-[10px]">
                        <div>
                          <span className={subText}>Daily Rate: </span>
                          <span className={`font-bold ${accentText}`}>₹{Number(item.price).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className={subText}>Deposit: </span>
                          <span className={`font-bold ${textColor}`}>₹{Number(item.deposit).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono pt-1">
                        <span className={`px-2.5 py-0.5 rounded-full border font-bold ${
                          item.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600' : 'bg-amber-500/10 border-amber-500/25 text-amber-600'
                        }`}>
                          Status: {item.status}
                        </span>
                        <span className={`font-semibold ${subText}`}>Depot: {item.hubName || 'Central'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SUPER ADMIN SECURITY & PASSWORD CHANGE */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <div style={cardContainerStyle} className="p-8 md:p-10 space-y-6">
              <div>
                <h3 className={`font-bold text-base ${textColor}`}>Change Super Admin Password</h3>
                <p className={`text-[11px] ${subText} mt-0.5`}>
                  Update persistent server-side credentials for Super Admin. Current password verification is required.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password"
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    style={glassInputStyle}
                    className="w-full px-4 py-3 font-mono focus:outline-none focus:border-[#557373] focus:ring-1 focus:ring-[#557373]/30"
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password (min 6 characters)"
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    style={glassInputStyle}
                    className="w-full px-4 py-3 font-mono focus:outline-none focus:border-[#557373] focus:ring-1 focus:ring-[#557373]/30"
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    style={glassInputStyle}
                    className="w-full px-4 py-3 font-mono focus:outline-none focus:border-[#557373] focus:ring-1 focus:ring-[#557373]/30"
                    required 
                  />
                </div>

                {pwdError && (
                  <div className={`p-3.5 rounded-xl border text-[10px] flex items-center space-x-2 ${
                    isDark ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-red-500/10 border-red-500/20 text-red-600'
                  }`}>
                    <ShieldAlert size={14} />
                    <span>{pwdError}</span>
                  </div>
                )}

                {pwdSuccess && (
                  <div className={`p-3.5 rounded-xl border text-[10px] flex items-center space-x-2 ${
                    isDark ? 'bg-success/10 border-success/20 text-success' : 'bg-[#557373]/15 border-[#557373]/30 text-[#557373]'
                  }`}>
                    <CheckCircle2 size={14} />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={pwdLoading}
                  className={`w-full py-3.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all shadow-md disabled:opacity-50 ${
                    isDark ? 'bg-dark-accent hover:bg-dark-accent/90 text-white' : 'bg-[#557373] hover:bg-[#557373]/90 text-white'
                  }`}
                >
                  {pwdLoading ? 'Updating Credentials...' : 'Update Super Admin Password'}
                </button>

              </form>
            </div>
          </div>
        )}

      </main>

      {/* 5. FLOATING BOTTOM NAVIGATION DOCK (EXACTLY MATCHING IMAGE 2 FLOATING NAVIGATION DOCK) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none max-w-[92vw] sm:max-w-max inline-flex flex-row items-center space-x-1.5 shrink-0 whitespace-nowrap px-3.5 py-2 shadow-2xl rounded-full border border-white/60 bg-white/85 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-[10px] tracking-wider uppercase transition-all ${
                isActive 
                  ? 'bg-[#557373] text-white shadow-md' 
                  : 'text-[#557373] hover:bg-[#557373]/10'
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
