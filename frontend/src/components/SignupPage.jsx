import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldAlert, ArrowLeft, Mail, Phone, Lock, Briefcase, MapPin, Home, Sun, Moon, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SignupPage({ isDark, onNavigate, toggleTheme }) {
  const [role, setRole] = useState('USER'); // 'USER' or 'HUB_OWNER'
  const [step, setStep] = useState(1); // 1: Info entry, 2: OTP verification
  
  // Registration States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Hub Specific States
  const [hubName, setHubName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');

  // OTP States
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes expiration
  const [resendCooldown, setResendCooldown] = useState(0); // 60 seconds rate-limit

  // Validation States
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 5-minute OTP Expiration Timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // 60-second Resend Cooldown Timer
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Validate Details & Request Gmail OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMessage('');
    setSuccess('');

    // Validations
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all personal info fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'HUB_OWNER' && (!hubName || !location || !address)) {
      setError('Please fill in all hub details');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setStep(2);
      setOtpTimer(300); // 5 minutes
      setResendCooldown(60); // 60 seconds rate-limit
      setInfoMessage(`Verification code sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code');
      }

      setOtpTimer(300);
      setResendCooldown(60); // 60 seconds rate-limit
      setInfoMessage(`New verification code sent to ${email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    if (otpTimer <= 0) {
      setError('Verification code has expired. Please click Resend Code.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role,
        fullName,
        email: email.trim(),
        phone,
        password,
        otp: otp.trim(),
        ...(role === 'HUB_OWNER' ? { hubName, location, address } : {})
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Email verified & account registered successfully! Redirecting to login...');
      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const textPrimary = isDark ? 'text-white' : 'text-[#0D0D0D]';
  const textSub = isDark ? 'text-mutedGrey' : 'text-slateDark/70';

  // Glassmorphic Style definitions
  const glassPanelStyle = {
    background: isDark ? 'rgba(25, 25, 25, 0.45)' : 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  };

  const glassInputStyle = {
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.60)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '10px',
  };

  const accentColorClass = isDark 
    ? 'focus:border-[#557373] focus:ring-1 focus:ring-[#557373]/30' 
    : 'focus:border-[#DFE5F3] focus:ring-1 focus:ring-[#DFE5F3]/30';

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-center items-center p-6 relative transition-colors duration-500 overflow-y-auto py-12 ${
      isDark ? 'bg-[#0D0D0D] text-white' : 'bg-[#DFE5F3] text-[#0D0D0D]'
    }`}>
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, #557373 0%, transparent 70%)' 
              : 'radial-gradient(circle, #557373 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Top Bar Actions */}
      <div className="w-full max-w-lg flex items-center justify-between z-10 mb-6">
        <button 
          onClick={() => step === 2 ? setStep(1) : onNavigate('landing')}
          className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all ${textPrimary}`}
        >
          <ArrowLeft size={12} />
          <span>{step === 2 ? 'Back to Details' : 'Back to Home'}</span>
        </button>

        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full border transition-all ${
            isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-[#0D0D0D]'
          }`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={glassPanelStyle}
        className="w-full max-w-lg p-8 md:p-10 z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <span 
            onClick={() => onNavigate('landing')}
            className={`text-2xl font-black font-display tracking-tight cursor-pointer hover:opacity-80 transition-opacity ${textPrimary}`}
          >
            REXPO
          </span>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#89B8D6]">
            {step === 1 ? 'Create Workspace Account' : 'Verify Email Address'}
          </p>
        </div>

        {/* Step 1: Info Entry */}
        {step === 1 && (
          <>
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-borderGrey/10">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex flex-col items-center justify-center ${
                  role === 'USER'
                    ? 'bg-dark-accent text-white shadow-sm'
                    : 'text-mutedGrey hover:text-white'
                }`}
              >
                <User size={14} className="mb-1" />
                <span>Customer</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('HUB_OWNER')}
                className={`py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex flex-col items-center justify-center ${
                  role === 'HUB_OWNER'
                    ? 'bg-dark-accent text-white shadow-sm'
                    : 'text-mutedGrey hover:text-white'
                }`}
              >
                <Briefcase size={14} className="mb-1" />
                <span>Hub Owner</span>
              </button>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              
              {/* Personal Information */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="signup-fullName" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Full Name</label>
                  <div className="relative">
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                    <input 
                      id="signup-fullName"
                      name="fullName"
                      type="text" 
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={glassInputStyle}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="signup-email" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                    <input 
                      id="signup-email"
                      name="email"
                      type="email" 
                      autoComplete="email"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={glassInputStyle}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="signup-phone" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Phone Number</label>
                  <div className="relative">
                    <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                    <input 
                      id="signup-phone"
                      name="phone"
                      type="tel" 
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={glassInputStyle}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="signup-password" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                      <input 
                        id="signup-password"
                        name="password"
                        type="password" 
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={glassInputStyle}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="signup-confirmPassword" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Confirm Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                      <input 
                        id="signup-confirmPassword"
                        name="confirmPassword"
                        type="password" 
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={glassInputStyle}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hub Owner Specific Fields */}
              {role === 'HUB_OWNER' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-3 border-t border-borderGrey/10"
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#89B8D6] block">Hub Information</span>

                  <div className="space-y-1">
                    <label htmlFor="signup-hubName" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Hub Name</label>
                    <div className="relative">
                      <Home className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                      <input 
                        id="signup-hubName"
                        name="hubName"
                        type="text" 
                        placeholder="Central Tech Depot"
                        value={hubName}
                        onChange={(e) => setHubName(e.target.value)}
                        style={glassInputStyle}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="signup-location" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Location City</label>
                      <div className="relative">
                        <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                        <input 
                          id="signup-location"
                          name="location"
                          type="text" 
                          placeholder="Mumbai"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          style={glassInputStyle}
                          className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="signup-address" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Full Address</label>
                      <div className="relative">
                        <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                        <input 
                          id="signup-address"
                          name="address"
                          type="text" 
                          placeholder="Sector 4, BKC"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          style={glassInputStyle}
                          className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg border border-danger/20 bg-danger/5 text-danger text-[10px] flex items-center space-x-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-[10px] font-bold text-xs tracking-widest uppercase transition-all shadow-md bg-dark-accent hover:bg-dark-accent/90 text-white disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
              </button>

            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndSignup} className="space-y-5">
            
            <div className="p-4 rounded-xl border border-dark-accent/20 bg-dark-accent/5 text-center space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-dark-accent">Check Gmail Inbox</span>
              <p className={`text-xs ${textPrimary} font-medium`}>{email}</p>
              <p className={`text-[10px] ${textSub}`}>Enter the 6-digit verification code sent via Gmail.</p>
            </div>

            {/* OTP 6-Digit Input */}
            <div className="space-y-2 text-center">
              <label htmlFor="signup-otp" className={`text-[9px] font-extrabold uppercase tracking-widest ${textSub}`}>6-Digit Verification Code</label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={16} />
                <input 
                  id="signup-otp"
                  name="otp"
                  type="text" 
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={glassInputStyle}
                  className={`w-full pl-11 pr-4 py-3 text-center font-mono font-bold text-lg tracking-[8px] focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                  required 
                  autoFocus
                />
              </div>
            </div>

            {/* Timer & Resend Controls */}
            <div className="flex items-center justify-between text-[10px] px-2 pt-1">
              <span className={`font-mono ${otpTimer < 60 ? 'text-danger font-bold animate-pulse' : textSub}`}>
                Code expires in: {formatTimer(otpTimer)}
              </span>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className={`font-bold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                  resendCooldown > 0 || loading 
                    ? 'opacity-40 cursor-not-allowed text-mutedGrey' 
                    : 'text-dark-accent hover:underline'
                }`}
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}</span>
              </button>
            </div>

            {/* Status Messages */}
            {infoMessage && (
              <div className="p-3 rounded-lg border border-dark-accent/20 bg-dark-accent/5 text-dark-accent text-[10px] flex items-center space-x-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg border border-danger/20 bg-danger/5 text-danger text-[10px] flex items-center space-x-2">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg border border-success/20 bg-success/5 text-success text-[10px] flex items-center space-x-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button 
                type="submit"
                disabled={loading || success}
                className="w-full py-3.5 rounded-[10px] font-bold text-xs tracking-widest uppercase transition-all shadow-md bg-dark-accent hover:bg-dark-accent/90 text-white disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Create Account'}</span>
              </button>

              <button 
                type="button"
                onClick={() => setStep(1)}
                className={`w-full py-2.5 text-[10px] font-bold uppercase tracking-wider ${textSub} hover:underline`}
              >
                Change Registration Details
              </button>
            </div>

          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-borderGrey/10 text-center text-xs">
          <span className={textSub}>Already have an account? </span>
          <button 
            type="button"
            onClick={() => onNavigate('login')}
            className="text-dark-accent hover:underline font-bold"
          >
            Sign In
          </button>
        </div>
      </motion.div>

    </div>
  );
}
