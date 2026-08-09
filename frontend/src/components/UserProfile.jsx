import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Calendar, Building, MapPin, ArrowLeft, Settings, AlertCircle } from 'lucide-react';

export default function UserProfile({ isDark, publicId, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('rexpo_token');

  useEffect(() => {
    const fetchProfile = async () => {
      const activeToken = localStorage.getItem('rexpo_token') || token;
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/profile/${publicId}`, {
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load profile');
        }
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (publicId) {
      fetchProfile();
    }
  }, [publicId, token]);

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
    <div className={`w-full min-h-screen flex flex-col justify-center items-center p-6 relative transition-colors duration-500 pb-32 ${
      isDark ? 'bg-[#0D0D0D]' : 'bg-[#DFE5F3]'
    }`}>
      
      {/* Back button */}
      <button 
        onClick={() => {
          const storedUser = localStorage.getItem('rexpo_user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === 'SUPER_ADMIN') onNavigate('/admin');
            else if (user.role === 'HUB_OWNER') onNavigate('/hub');
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

      {loading ? (
        <span className={`text-xs font-mono tracking-widest animate-pulse uppercase ${subText}`}>Syncing Profile Details...</span>
      ) : error ? (
        <div style={glassPanelStyle} className="w-full max-w-md p-8 text-center space-y-4">
          <div className={`flex justify-center ${isDark ? 'text-danger' : 'text-[#557373]'}`}><AlertCircle size={32} /></div>
          <h3 className={`font-bold text-sm uppercase ${textColor}`}>Access Denied</h3>
          <p className={`text-xs ${subText}`}>{error}</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={glassPanelStyle}
          className="w-full max-w-lg p-8 md:p-10 space-y-6"
        >
          {/* Header */}
          <div className={`border-b pb-4 flex justify-between items-start ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
            <div className="space-y-1">
              <h2 className={`text-2xl font-black uppercase tracking-tight font-display ${accentText}`}>User Profile</h2>
              <p className={`text-[10px] font-mono ${accentText} tracking-wider`}>ID: {publicId}</p>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/10 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><User size={20} /></div>
          </div>

          {/* Profile fields */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Full Name</span>
                <p className={`font-bold text-sm ${textColor}`}>{profile.name}</p>
              </div>
              <div className="space-y-1">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Account Type</span>
                <p className={`font-mono font-bold text-xs uppercase ${accentText}`}>{profile.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Email Address</span>
                <p className={`font-semibold ${textColor}`}>{profile.email}</p>
              </div>
              <div className="space-y-1">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Phone Number</span>
                <p className={`font-semibold ${textColor}`}>{profile.phone}</p>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Member Since</span>
              <p className={`font-semibold ${textColor}`}>{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Hub Details */}
            {profile.hub && (
              <div className={`mt-6 pt-5 border-t space-y-3 ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                <h3 className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center space-x-1.5 ${accentText}`}>
                  <Building size={12} />
                  <span>Linked Operations Hub</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className={`text-[7px] font-extrabold uppercase tracking-widest ${subText}`}>Hub Name</span>
                    <p className={`font-bold ${textColor}`}>{profile.hub.name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-[7px] font-extrabold uppercase tracking-widest ${subText}`}>Location</span>
                    <p className={`font-bold ${textColor}`}>{profile.hub.location}</p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className={`text-[7px] font-extrabold uppercase tracking-widest ${subText}`}>Depot Address</span>
                  <p className={`font-medium ${textColor} leading-relaxed`}>{profile.hub.address}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}
