import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function LoginPage({ isDark, onNavigate, onLoginSuccess, toggleTheme }) {
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSuperAdminMode) {
        if (!username || !password) {
          throw new Error('Username and password are required');
        }

        const response = await fetch('/api/auth/super-admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Super Admin authentication failed');
        }

        localStorage.setItem('rexpo_token', data.token);
        localStorage.setItem('rexpo_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
      } else {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        if (!data.token) {
          throw new Error('Authentication token missing from server response');
        }

        localStorage.setItem('rexpo_token', data.token);
        localStorage.setItem('rexpo_user', JSON.stringify(data.user));

        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const textPrimary = isDark ? 'text-white' : 'text-[#0D0D0D]';
  const textMuted = isDark ? 'text-[#89B8D6]' : 'text-[#557373]';
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

  const accentColorClass = isDark ? 'focus:border-[#557373] focus:ring-1 focus:ring-[#557373]/30' : 'focus:border-[#DFE5F3] focus:ring-1 focus:ring-[#DFE5F3]/30';

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-500 relative overflow-hidden ${
      isDark ? 'bg-[#0D0D0D] text-white' : 'bg-[#DFE5F3] text-[#0D0D0D]'
    }`}>
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-25"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, #557373 0%, transparent 70%)' 
              : 'radial-gradient(circle, #557373 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-20"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, #557373 0%, transparent 70%)' 
              : 'radial-gradient(circle, #557373 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Back button */}
      <button 
        onClick={() => onNavigate('/')}
        className={`absolute top-6 left-6 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all z-50 ${textPrimary}`}
      >
        <ArrowLeft size={12} />
        <span>Back to Home</span>
      </button>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-full border transition-all ${
            isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-[#0D0D0D]'
          }`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Left side: Editorial Typography */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative z-10 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono tracking-widest text-[#89B8D6] uppercase">REXPO PLATFORM</span>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-none">
            Control Your <br />
            <span className="italic font-serif font-normal text-[#557373]">Rental Fleet.</span>
          </h1>
        </div>

        <p className={`text-xs md:text-sm max-w-md leading-relaxed ${textSub}`}>
          Access real-time equipment tracking, automated security deposit settlements, and multi-hub operations from one centralized console.
        </p>

        <div className="pt-4 flex items-center space-x-6 text-[10px] uppercase font-bold tracking-widest text-[#89B8D6]">
          <span>AES-256 Auth</span>
          <span>•</span>
          <span>Gmail Verified</span>
          <span>•</span>
          <span>MySQL Database</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={glassPanelStyle}
          className="w-full max-w-md p-8 md:p-10 space-y-6"
        >
          <div className="text-center space-y-2">
            <span 
              onClick={() => onNavigate('/')}
              className={`text-2xl font-black font-display tracking-tight cursor-pointer hover:opacity-80 transition-opacity ${textPrimary}`}
            >
              REXPO
            </span>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#89B8D6]">
              {isSuperAdminMode ? 'Super Admin System Console' : 'Sign In To Workspace'}
            </p>
            
            {/* Mode Switcher */}
            <div className="flex border rounded-lg p-0.5 max-w-xs mx-auto border-white/10 bg-black/10 text-[9px] font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setIsSuperAdminMode(false); setError(''); }}
                className={`flex-1 py-1 rounded transition-all ${!isSuperAdminMode ? 'bg-[#557373] text-white shadow' : 'text-mutedGrey hover:text-white'}`}
              >
                Standard Portal
              </button>
              <button
                type="button"
                onClick={() => { setIsSuperAdminMode(true); setError(''); }}
                className={`flex-1 py-1 rounded transition-all ${isSuperAdminMode ? 'bg-[#557373] text-white shadow' : 'text-mutedGrey hover:text-white'}`}
              >
                Super Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field for Super Admin or Email for Standard User */}
            {isSuperAdminMode ? (
              <div className="space-y-1">
                <label htmlFor="login-username" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Super Admin Username</label>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                  <input 
                    id="login-username"
                    name="username"
                    type="text" 
                    autoComplete="username"
                    placeholder="superadmin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={glassInputStyle}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                    required 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label htmlFor="login-email" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                  <input 
                    id="login-email"
                    name="email"
                    type="email" 
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={glassInputStyle}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                    required 
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className={`text-[8px] font-extrabold uppercase tracking-widest ${textSub}`}>Password</label>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSub}`} size={14} />
                <input 
                  id="login-password"
                  name="password"
                  type="password" 
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={glassInputStyle}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${accentColorClass} ${textPrimary}`}
                  required 
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label htmlFor="login-remember" className="flex items-center space-x-2 cursor-pointer">
                <input 
                  id="login-remember"
                  name="rememberMe"
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-borderGrey/20 bg-white/5 text-dark-accent focus:ring-0" 
                />
                <span className={`text-[10px] ${textSub}`}>Remember this browser</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg border border-danger/20 bg-danger/5 text-danger text-[10px] flex items-center space-x-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-[10px] font-bold text-xs tracking-widest uppercase transition-all shadow-md bg-dark-accent hover:bg-dark-accent/90 text-white disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In To Workspace'}
            </button>

          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-borderGrey/10 text-center text-xs">
            <span className={textSub}>Don't have an account? </span>
            <button 
              onClick={() => onNavigate('/signup')}
              className="text-dark-accent hover:underline font-bold"
            >
              Create Account
            </button>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
