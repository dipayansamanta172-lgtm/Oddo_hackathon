import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ScrollCanvas from './components/ScrollCanvas';
import OutroScreen from './components/OutroScreen';
import StaticSections from './components/StaticSections';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import SuperAdminWorkspace from './components/SuperAdminWorkspace';
import HubOwnerWorkspace from './components/HubOwnerWorkspace';
import CustomerDashboard from './components/CustomerDashboard';
import ProductCatalog from './components/ProductCatalog';
import MyRentalsPage from './components/MyRentalsPage';
import UserProfile from './components/UserProfile';
import SettingsPage from './components/SettingsPage';
import BookingsPage from './components/BookingsPage';
import CustomerBottomDock from './components/CustomerBottomDock';
import DeliveryPartnerWorkspace from './components/DeliveryPartnerWorkspace';
import { frames } from './components/frameList';

export default function App() {
  // Theme state persisted in localStorage (default is dark)
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('rexpo_theme');
    return stored ? stored === 'dark' : true;
  });

  // Client-side URL pathname router state
  const [path, setPath] = useState(() => window.location.pathname || '/');

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rexpo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuth = Boolean(currentUser && localStorage.getItem('rexpo_token'));

  // Sync state changes with document theme class
  useEffect(() => {
    localStorage.setItem('rexpo_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync window browser history popping
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const onNavigate = (newPath) => {
    let target = newPath;
    if (newPath === 'landing') target = '/';
    if (newPath === 'login') target = '/login';
    if (newPath === 'signup') target = '/signup';
    if (newPath === 'dashboard') {
      if (currentUser?.role === 'SUPER_ADMIN') target = '/admin';
      else if (currentUser?.role === 'HUB_OWNER') target = '/hub';
      else if (currentUser?.role === 'DELIVERY_PARTNER') target = '/rider';
      else target = '/dashboard';
    }
    if (currentUser?.role === 'DELIVERY_PARTNER' && (target === '/admin' || target === '/hub' || target === '/dashboard' || target === '/settings')) {
      target = '/rider';
    }
    if (newPath === 'products') target = '/products';
    if (newPath === 'rentals' || newPath === 'my-rentals') target = '/customer/rentals';
    if (newPath === 'bookings') target = '/bookings';
    if (newPath === 'settings') target = '/settings';
    if (newPath === 'profile') {
      target = currentUser?.publicId ? `/profile/${currentUser.publicId}` : '/settings';
    }

    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target);
    }
    setPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleLoginSuccess = (user, token) => {
    if (user) localStorage.setItem('rexpo_user', JSON.stringify(user));
    const validToken = token || localStorage.getItem('rexpo_token');
    if (validToken && validToken !== 'undefined') {
      localStorage.setItem('rexpo_token', validToken);
    }
    setCurrentUser(user);

    if (user?.role === 'SUPER_ADMIN') onNavigate('/admin');
    else if (user?.role === 'HUB_OWNER') onNavigate('/hub');
    else if (user?.role === 'DELIVERY_PARTNER') onNavigate('/rider');
    else onNavigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('rexpo_user');
    localStorage.removeItem('rexpo_token');
    setCurrentUser(null);
    onNavigate('/login');
  };

  // Preloader frame index state & total frames
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const totalFrames = frames.length;

  // Track vertical scroll progression
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Track total canvas timeline height dynamically
  const [timelineHeight, setTimelineHeight] = useState(0);

  // Ref to parent timeline element
  const timelineRef = useRef(null);

  // Handle high-performance scroll updates
  useEffect(() => {
    const handleScroll = () => {
      const el = timelineRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      
      if (totalScrollable <= 0) return;

      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));
      
      setScrollProgress(progress);

      const frameIdx = Math.min(
        totalFrames - 1,
        Math.floor(progress * (totalFrames - 1))
      );
      setCurrentFrameIndex(frameIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames]);

  // Set timeline parent height inline dynamically
  useEffect(() => {
    const calculatedHeight = (totalFrames * 15) + window.innerHeight;
    setTimelineHeight(calculatedHeight);
  }, [totalFrames]);

  // Parse path for profile routing
  const isProfileRoute = path.startsWith('/profile/');
  const profilePublicId = isProfileRoute ? path.split('/profile/')[1] : null;

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-500 relative ${
      isDark ? 'bg-black text-white' : 'bg-[#DFE5F3] text-[#0D0D0D]'
    }`}>
      {/* Viewport ambient lighting overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-700"
        style={{
          boxShadow: isDark 
            ? 'inset 0 0 100px rgba(85, 115, 115, 0.15)' 
            : 'inset 0 0 100px rgba(85, 115, 115, 0.08)'
        }}
      />

      {/* Main Navbar (ONLY rendered on public landing page '/') */}
      {path === '/' && (
        <Navbar 
          isDark={isDark} 
          onNavigate={onNavigate} 
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
          currentPath={path}
        />
      )}

      {/* ROUTE 1: PUBLIC LANDING PAGE (at path '/') */}
      {path === '/' && (
        <div className="relative w-full">
          {/* Scroll Canvas Section */}
          <div 
            ref={timelineRef}
            className="relative w-full"
            style={{ height: timelineHeight ? `${timelineHeight}px` : '4500px' }}
          >
            <ScrollCanvas 
              currentFrameIndex={currentFrameIndex}
              scrollProgress={scrollProgress}
              isDark={isDark}
              onNavigate={onNavigate}
              containerRef={timelineRef}
            />
          </div>

          {/* Outro Screen & Static Presentation Slides */}
          <div className="relative z-10 w-full bg-inherit">
            <OutroScreen 
              scrollProgress={scrollProgress} 
              isDark={isDark} 
              onNavigate={onNavigate} 
            />

            <StaticSections 
              scrollProgress={scrollProgress} 
              isDark={isDark} 
              onNavigate={onNavigate} 
            />
          </div>
        </div>
      )}

      {/* ROUTE 2: LOGIN */}
      {path === '/login' && (
        <LoginPage 
          isDark={isDark} 
          onNavigate={onNavigate} 
          onLoginSuccess={handleLoginSuccess}
          toggleTheme={toggleTheme}
        />
      )}

      {/* ROUTE 3: SIGNUP */}
      {path === '/signup' && (
        <SignupPage 
          isDark={isDark} 
          onNavigate={onNavigate}
          toggleTheme={toggleTheme}
        />
      )}

      {/* ROUTE 4: SUPER ADMIN WORKSPACE */}
      {path === '/admin' && (
        <SuperAdminWorkspace 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* ROUTE 5: HUB OWNER WORKSPACE */}
      {path === '/hub' && (
        <HubOwnerWorkspace 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* ROUTE 5B: DELIVERY PARTNER WORKSPACE */}
      {(path === '/rider' || path === '/delivery') && (
        <DeliveryPartnerWorkspace 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* ROUTE 6: CUSTOMER DASHBOARD */}
      {path === '/dashboard' && (
        <CustomerDashboard 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          toggleTheme={toggleTheme}
        />
      )}

      {/* ROUTE 7: PRODUCT CATALOG */}
      {path === '/products' && (
        <ProductCatalog 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* ROUTE 8: MY RENTALS */}
      {(path === '/customer/rentals' || path === '/rentals') && (
        <MyRentalsPage 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* ROUTE 9: BOOKINGS */}
      {path === '/bookings' && (
        <BookingsPage 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* ROUTE 10: USER PROFILE */}
      {isProfileRoute && (
        <UserProfile 
          isDark={isDark} 
          publicId={profilePublicId}
          onNavigate={onNavigate}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* ROUTE 11: SETTINGS */}
      {path === '/settings' && (
        <SettingsPage 
          isDark={isDark} 
          onNavigate={onNavigate}
          currentUser={currentUser}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* CUSTOMER PERSISTENT FLOATING BOTTOM NAVIGATION DOCK */}
      {currentUser && currentUser.role === 'USER' && path !== '/' && path !== '/login' && path !== '/signup' && (
        <CustomerBottomDock 
          isDark={isDark}
          currentPath={path}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
