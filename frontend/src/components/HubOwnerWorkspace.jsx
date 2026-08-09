import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Activity, 
  Clock, 
  Shield, 
  Box,
  Upload,
  Image as ImageIcon,
  X 
} from 'lucide-react';

export default function HubOwnerWorkspace({ isDark, currentUser, onLogout, toggleTheme, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'inventory', 'bookings', 'customers', 'returns', 'reports', 'settings'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dynamic Data States
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [riders, setRiders] = useState([]);
  
  // Product Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDeposit, setProdDeposit] = useState('');
  const [prodQty, setProdQty] = useState('1');
  const [prodPickup, setProdPickup] = useState(true);
  const [prodDelivery, setProdDelivery] = useState(true);

  // Cloudinary Image States
  const [prodImage, setProdImage] = useState('');
  const [prodCloudinaryPublicId, setProdCloudinaryPublicId] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Delivery Partner Modal States
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [riderEmail, setRiderEmail] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderName, setRiderName] = useState('');
  const [riderLoading, setRiderLoading] = useState(false);
  const [riderSuccessMsg, setRiderSuccessMsg] = useState('');

  const token = localStorage.getItem('rexpo_token');

  const fetchData = async () => {
    const activeToken = localStorage.getItem('rexpo_token') || token;
    setLoading(true);
    setError('');
    try {
      // Fetch hub products
      const prodRes = await fetch('/api/hub/products', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const prodData = await prodRes.json();
      if (!prodRes.ok) throw new Error(prodData.error || 'Failed to load hub products');
      setProducts(prodData || []);

      // Fetch hub bookings
      const bkRes = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const bkData = await bkRes.json();
      if (!bkRes.ok) throw new Error(bkData.error || 'Failed to load hub bookings');
      setBookings(bkData || []);

      // Fetch hub riders
      const rRes = await fetch('/api/hub/delivery-partners', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const rData = await rRes.json();
      if (rRes.ok && rData.deliveryPartners) {
        setRiders(rData.deliveryPartners);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeRiderModal = () => {
    setIsRiderModalOpen(false);
    setRiderLoading(false);
    setRiderSuccessMsg('');
    setRiderEmail('');
    setRiderPhone('');
    setRiderName('');
  };

  const handleAddDeliveryPartner = async (e) => {
    e.preventDefault();
    if (!riderEmail || !riderPhone) {
      alert('Email ID and phone number are required.');
      return;
    }

    setRiderLoading(true);
    setRiderSuccessMsg('');
    try {
      const activeToken = localStorage.getItem('rexpo_token') || token;
      const response = await fetch('/api/hub/delivery-partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          email: riderEmail,
          phone: riderPhone,
          name: riderName
        })
      });

      const rawResponse = await response.text();
      console.log('[DELIVERY DEBUG] HTTP status:', response.status);
      console.log('[DELIVERY DEBUG] HTTP status text:', response.statusText);
      console.log('[DELIVERY DEBUG] Response content-type:', response.headers.get('content-type'));
      console.log('[DELIVERY DEBUG] Raw response:', rawResponse);

      let data;
      try {
        data = rawResponse ? JSON.parse(rawResponse) : null;
      } catch (parseError) {
        console.error('[DELIVERY DEBUG] JSON PARSE ERROR:', parseError);
        console.error('[DELIVERY DEBUG] RAW SERVER RESPONSE:', rawResponse);
        throw parseError;
      }

      if (!response.ok) throw new Error((data && data.error) || 'Failed to add delivery partner');

      setRiderSuccessMsg('Delivery Partner added! Credentials sent via WhatsApp/email.');
      setRiderEmail('');
      setRiderPhone('');
      setRiderName('');
      setTimeout(() => {
        closeRiderModal();
      }, 1500);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to add delivery partner');
    } finally {
      setRiderLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64DataUri = reader.result;
        const activeToken = localStorage.getItem('rexpo_token') || token;

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({ image: base64DataUri })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to upload image to Cloudinary');

        setProdImage(data.url);
        setProdCloudinaryPublicId(data.publicId);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError(err.message);
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDeposit) {
      alert('Please fill in required fields');
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      deposit: Number(prodDeposit),
      quantity: Number(prodQty),
      pickup: prodPickup,
      delivery: prodDelivery,
      imageUrl: prodImage || null,
      cloudinaryPublicId: prodCloudinaryPublicId || null
    };

    try {
      const url = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');

      setIsModalOpen(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const response = await fetch('/api/bookings/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve booking');
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSettleReturn = async (bookingId) => {
    try {
      const response = await fetch('/api/bookings/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to settle return');
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetProductForm = () => {
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdDeposit('');
    setProdQty('1');
    setProdPickup(true);
    setProdDelivery(true);
    setProdImage('');
    setProdCloudinaryPublicId('');
    setUploadingImage(false);
    setUploadError('');
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description || '');
    setProdPrice(p.price);
    setProdDeposit(p.deposit);
    setProdQty(p.quantity || '1');
    setProdPickup(p.pickup);
    setProdDelivery(p.delivery);
    setProdImage(p.imageUrl || '');
    setProdCloudinaryPublicId(p.cloudinaryPublicId || '');
    setUploadingImage(false);
    setUploadError('');
    setIsModalOpen(true);
  };

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

  // Glassmorphic Floating Bottom Dock Style (15-20% more compact for Hub Owner)
  const dockStyle = {
    background: isDark ? 'rgba(15, 20, 28, 0.84)' : 'rgba(223, 229, 243, 0.90)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(85, 115, 115, 0.20)',
    borderRadius: '16px',
    boxShadow: isDark 
      ? '0 16px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
      : '0 12px 40px rgba(85, 115, 115, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'bookings', label: 'Orders', icon: FileText },
    { id: 'riders', label: 'Riders', icon: Users },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'returns', label: 'Returns', icon: CheckCircle2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const activeRentalsCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pendingApprovalsCount = bookings.filter(b => b.status === 'PROCESSING').length;
  const totalDepositHold = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'PROCESSING')
    .reduce((sum, b) => sum + (Number(b.product_deposit) || Number(b.productDeposit) || 0), 0);

  return (
    <div className={`w-full min-h-screen flex flex-col relative transition-colors duration-500 pb-32 text-xs ${
      isDark ? 'bg-[#0D0D0D] text-white' : 'bg-[#DFE5F3] text-[#1A1A1A]'
    }`}>
      
      {/* TOP HEADER BAR */}
      <header className={`w-full h-16 px-6 md:px-12 border-b flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark ? 'border-white/5 bg-[#0D0D0D]/80' : 'border-[#557373]/15 bg-[#DFE5F3]/85'
      }`}>
        {/* Brand Logo & Hub Role Tag */}
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
            Hub Operations
          </span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className={`text-xs font-bold ${textColor}`}>{currentUser?.fullName || 'Hub Owner'}</span>
            <span className={`text-[9px] ${subText}`}>{currentUser?.email}</span>
          </div>

          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
            }`}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-8 py-6 my-auto flex flex-col justify-center items-center space-y-8">
        <div className="w-full space-y-8">
        
        {/* Sub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderGrey/10 pb-6">
          <div className="space-y-1">
            <span className={`text-[9px] font-extrabold uppercase tracking-widest ${accentText}`}>Rental Control Workspace</span>
            <h1 className={`text-3xl md:text-4xl font-normal tracking-tight font-display ${textColor}`}>
              {activeTab === 'dashboard' ? `Welcome back, ${currentUser?.fullName || 'Hub Manager'}` : navItems.find(n => n.id === activeTab)?.label || 'Depot Control'}
            </h1>
            <p className={`text-xs ${subText} leading-relaxed`}>
              Manage active depot equipment, review client orders, and track security deposits in real time.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {(activeTab === 'inventory' || activeTab === 'dashboard') && (
              <button 
                onClick={() => {
                  resetProductForm();
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className={`font-semibold text-xs px-5 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-md ${
                  isDark 
                    ? 'bg-dark-accent hover:bg-dark-accent/90 text-white shadow-dark-accent/20' 
                    : 'bg-[#557373] hover:bg-[#557373]/90 text-white shadow-[#557373]/20'
                }`}
              >
                <Plus size={14} />
                <span>Add Product Listing</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <span className={`text-xs font-mono tracking-widest animate-pulse uppercase ${subText}`}>Syncing Depot Records...</span>
          </div>
        ) : error ? (
          <div style={glassCardStyle} className="p-6 text-xs flex items-center space-x-3 text-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <motion.div style={glassCardStyle} className="p-6 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-extrabold tracking-widest uppercase ${subText}`}>Hub Inventory</span>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/15 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><Box size={14} /></div>
                    </div>
                    <div>
                      <p className={`text-3xl font-black ${textColor}`}>{products.length}</p>
                      <p className={`text-[9px] ${subText} mt-1`}>Total depot listings</p>
                    </div>
                  </motion.div>

                  <motion.div style={glassCardStyle} className="p-6 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-extrabold tracking-widest uppercase ${subText}`}>Active Dispatches</span>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/15 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><Activity size={14} /></div>
                    </div>
                    <div>
                      <p className={`text-3xl font-black ${textColor}`}>{activeRentalsCount}</p>
                      <p className={`text-[9px] ${subText} mt-1`}>Currently rented items</p>
                    </div>
                  </motion.div>

                  <motion.div style={glassCardStyle} className="p-6 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-extrabold tracking-widest uppercase ${subText}`}>Pending Approvals</span>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/15 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><Clock size={14} /></div>
                    </div>
                    <div>
                      <p className={`text-3xl font-black ${textColor}`}>{pendingApprovalsCount}</p>
                      <p className={`text-[9px] ${subText} mt-1`}>Awaiting depot confirmation</p>
                    </div>
                  </motion.div>

                  <motion.div style={glassCardStyle} className="p-6 flex flex-col justify-between space-y-4 border-dark-accent/30">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-extrabold tracking-widest uppercase ${accentText}`}>Escrow Holds</span>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-accent/20 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}><Shield size={14} /></div>
                    </div>
                    <div>
                      <p className={`text-3xl font-black ${accentText}`}>₹{totalDepositHold.toLocaleString()}</p>
                      <p className={`text-[9px] ${subText} mt-1`}>Refundable deposit holds</p>
                    </div>
                  </motion.div>
                </div>

                {/* 2-Column Content Overview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Depot Product Inventory Overview (7 cols) */}
                  <motion.div style={glassCardStyle} className="lg:col-span-7 p-6 space-y-4">
                    <div className="border-b border-borderGrey/10 pb-4 flex justify-between items-center">
                      <div>
                        <h3 className={`font-bold text-sm uppercase ${textColor}`}>Depot Product Inventory</h3>
                        <p className={`text-[10px] ${subText}`}>Active listings managed by this hub</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`text-[9px] font-extrabold uppercase tracking-wider ${accentText} hover:underline`}
                      >
                        View All ({products.length}) →
                      </button>
                    </div>

                    <div className="divide-y divide-borderGrey/10">
                      {products.length === 0 ? (
                        <p className={`text-center py-8 ${subText}`}>No products in depot inventory.</p>
                      ) : (
                        products.slice(0, 4).map(p => (
                          <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <p className={`font-bold ${textColor}`}>{p.name}</p>
                              <p className={subText}>₹{p.price}/day | Deposit: ₹{p.deposit} | Qty: {p.quantity}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => openEditModal(p)} 
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
                                }`}
                                title="Edit Listing"
                              >
                                <Edit3 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>

                  {/* Right Column: Recent Rental Orders & Dispatches (5 cols) */}
                  <motion.div style={glassCardStyle} className="lg:col-span-5 p-6 space-y-4">
                    <div className="border-b border-borderGrey/10 pb-4 flex justify-between items-center">
                      <div>
                        <h3 className={`font-bold text-sm uppercase ${textColor}`}>Recent Rental Orders</h3>
                        <p className={`text-[10px] ${subText}`}>Live client dispatches & approvals</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className={`text-[9px] font-extrabold uppercase tracking-wider ${accentText} hover:underline`}
                      >
                        View All ({bookings.length}) →
                      </button>
                    </div>

                    <div className="divide-y divide-borderGrey/10">
                      {bookings.length === 0 ? (
                        <p className={`text-center py-8 ${subText}`}>No rental orders recorded.</p>
                      ) : (
                        bookings.slice(0, 4).map(b => (
                          <div key={b.id} className="py-3 flex justify-between items-center text-xs">
                            <div className="space-y-0.5 overflow-hidden">
                              <p className={`font-bold truncate ${textColor}`}>{b.product_name || b.productName}</p>
                              <p className={`text-[10px] ${subText} truncate`}>Client: {b.user_name || b.userName}</p>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
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
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* 2. INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <motion.div style={glassCardStyle} className="p-6 space-y-4">
                <div className="border-b border-borderGrey/10 pb-4 flex justify-between items-center">
                  <h3 className={`font-bold text-sm uppercase ${textColor}`}>Depot Product Inventory ({products.length})</h3>
                </div>

                <div className="divide-y divide-borderGrey/10">
                  {products.length === 0 ? (
                    <p className={`text-center py-8 ${subText}`}>No products in depot inventory.</p>
                  ) : (
                    products.map(p => (
                      <div key={p.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                          ) : (
                            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 border-white/10 text-dark-accent' : 'bg-[#557373]/10 border-[#557373]/20 text-[#557373]'}`}>
                              <Box size={18} />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0">
                            <p className={`font-bold text-sm truncate ${textColor}`}>{p.name}</p>
                            <p className={`text-[10px] ${subText} truncate`}>Rental: ₹{p.price}/day | Deposit: ₹{p.deposit} | Quantity: {p.quantity}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <button 
                            onClick={() => openEditModal(p)} 
                            className={`p-2 rounded-lg border transition-all ${
                              isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
                            }`}
                            title="Edit Product"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)} 
                            className="p-2 rounded-lg border border-danger/20 text-danger hover:bg-danger/10 transition-all"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. ORDERS & BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <motion.div style={glassCardStyle} className="p-6 space-y-4">
                <div className="border-b border-borderGrey/10 pb-4 flex justify-between items-center">
                  <h3 className={`font-bold text-sm uppercase ${textColor}`}>Hub Rental Orders ({bookings.length})</h3>
                </div>

                <div className="divide-y divide-borderGrey/10">
                  {bookings.length === 0 ? (
                    <p className={`text-center py-8 ${subText}`}>No bookings found for this hub.</p>
                  ) : (
                    bookings.map(b => (
                      <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <p className={`font-bold ${textColor}`}>{b.product_name || b.productName} (Booking #{b.id})</p>
                          <p className={subText}>Client: {b.user_name || b.userName} | Duration: {b.duration} | Delivery: {b.delivery_choice || b.deliveryChoice}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                            b.status === 'CONFIRMED' 
                              ? (isDark ? 'bg-success/15 text-success' : 'bg-[#557373]/15 text-[#557373]')
                              : b.status === 'RELEASED' 
                                ? (isDark ? 'bg-mutedGrey/20 text-mutedGrey' : 'bg-[#557373]/20 text-[#557373]')
                                : (isDark ? 'bg-warning/15 text-warning' : 'bg-[#557373]/10 text-[#557373]')
                          }`}>
                            {b.status}
                          </span>

                          {b.status === 'PROCESSING' && (
                            <button 
                              onClick={() => handleApproveBooking(b.id)} 
                              className={`px-3 py-1.5 rounded-lg text-white font-bold uppercase text-[9px] ${
                                isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                              }`}
                            >
                              Approve
                            </button>
                          )}

                          {b.status === 'CONFIRMED' && (
                            <button 
                              onClick={() => handleSettleReturn(b.id)} 
                              className={`px-3 py-1.5 rounded-lg text-white font-bold uppercase text-[9px] ${
                                isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                              }`}
                            >
                              Settle Return
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. CUSTOMERS TAB */}
            {activeTab === 'customers' && (
              <motion.div style={glassCardStyle} className="p-6 space-y-4">
                <h3 className={`font-bold text-sm uppercase ${textColor}`}>Hub Rental Clients</h3>
                <p className={`text-xs ${subText}`}>Clients currently renting equipment from this depot.</p>
                <div className="divide-y divide-borderGrey/10 pt-2">
                  {bookings.length === 0 ? (
                    <p className={`text-center py-6 ${subText}`}>No client records available yet.</p>
                  ) : (
                    Array.from(new Set(bookings.map(b => b.user_name || b.userName))).map((clientName, idx) => (
                      <div key={idx} className="py-3 flex justify-between items-center text-xs">
                        <span className={`font-bold ${textColor}`}>{clientName}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${isDark ? 'bg-dark-accent/15 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}>Active Client</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 5. RETURNS TAB */}
            {activeTab === 'returns' && (
              <motion.div style={glassCardStyle} className="p-6 space-y-4">
                <h3 className={`font-bold text-sm uppercase ${textColor}`}>Equipment Returns Management</h3>
                <div className="divide-y divide-borderGrey/10">
                  {bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'RELEASED').length === 0 ? (
                    <p className={`text-center py-8 ${subText}`}>No equipment returns pending.</p>
                  ) : (
                    bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'RELEASED').map(b => (
                      <div key={b.id} className="py-4 flex justify-between items-center text-xs">
                        <div>
                          <p className={`font-bold ${textColor}`}>{b.product_name || b.productName}</p>
                          <p className={subText}>Client: {b.user_name || b.userName} | Status: {b.status}</p>
                        </div>
                        {b.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleSettleReturn(b.id)} 
                            className={`px-3 py-1.5 rounded-lg text-white font-bold uppercase text-[9px] ${
                              isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                            }`}
                          >
                            Process Return
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 6. REPORTS TAB */}
            {activeTab === 'reports' && (
              <motion.div style={glassCardStyle} className="p-8 text-center space-y-3">
                <BarChart3 size={32} className={`mx-auto ${accentText}`} />
                <h3 className={`font-bold text-base ${textColor}`}>Hub Operations Report</h3>
                <p className={`text-xs ${subText} max-w-md mx-auto`}>
                  Monthly revenue breakdown, equipment utilization rates, and active security deposit balances.
                </p>
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-[#557373]/20'}`}>
                    <span className={`text-[8px] font-bold uppercase tracking-wider block ${subText}`}>Total Depot Inventory</span>
                    <span className={`text-lg font-black ${textColor}`}>{products.length} Items</span>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-[#557373]/20'}`}>
                    <span className={`text-[8px] font-bold uppercase tracking-wider block ${subText}`}>Total Orders Processed</span>
                    <span className={`text-lg font-black ${textColor}`}>{bookings.length} Orders</span>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-[#557373]/20'}`}>
                    <span className={`text-[8px] font-bold uppercase tracking-wider block ${subText}`}>Escrow Under Hold</span>
                    <span className={`text-lg font-black ${accentText}`}>₹{totalDepositHold.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6B. DELIVERY PARTNERS / RIDERS TAB */}
            {activeTab === 'riders' && (
              <motion.div style={glassCardStyle} className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-[#557373]/15 pb-3">
                  <div>
                    <h3 className={`font-bold text-sm uppercase ${textColor}`}>Delivery Partners / Riders</h3>
                    <p className={`text-xs ${subText}`}>Manage authorized delivery riders assigned to your depot hub.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsRiderModalOpen(true);
                      setRiderSuccessMsg('');
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 ${
                      isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Add Delivery Partner</span>
                  </button>
                </div>

                {riders.length === 0 ? (
                  <div className="p-8 text-center text-[#557373]/70 font-medium">
                    No delivery partners registered for this hub yet. Click "Add Delivery Partner" above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                      <thead>
                        <tr className={`border-b text-[9px] uppercase tracking-wider ${subText}`}>
                          <th className="py-3 px-4">Rider Name</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Phone Number</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Added Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#557373]/10">
                        {riders.map((rd) => (
                          <tr key={rd.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-bold">{rd.name}</td>
                            <td className="py-3 px-4">{rd.email}</td>
                            <td className="py-3 px-4">{rd.phone}</td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-[#557373]/30 bg-[#557373]/10 text-[#557373]">
                                {rd.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-600">{rd.status || 'ACTIVE'}</td>
                            <td className="py-3 px-4">{new Date(rd.created_at || Date.now()).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* 7. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div style={glassCardStyle} className="p-6 space-y-4">
                <h3 className={`font-bold text-sm uppercase ${textColor}`}>Depot Configuration</h3>
                <p className={`text-xs ${subText}`}>Configure hub operating hours, pickup address, and manager notifications.</p>
                <div className="space-y-3 max-w-md pt-2">
                  <div className="space-y-1">
                    <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Hub Manager Name</label>
                    <input type="text" readOnly value={currentUser?.fullName || ''} className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'}`} />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Registered Email</label>
                    <input type="email" readOnly value={currentUser?.email || ''} className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'}`} />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
        </div>
      </main>

      {/* ADD DELIVERY PARTNER MODAL */}
      <AnimatePresence>
        {isRiderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={glassCardStyle}
              className="w-full max-w-md p-6 space-y-4 relative"
            >
              <div className="flex justify-between items-center border-b border-[#557373]/15 pb-3">
                <h3 className={`font-bold text-sm uppercase ${textColor}`}>Add Delivery Partner</h3>
                <button 
                  onClick={closeRiderModal}
                  className={`p-1 rounded-full hover:bg-white/10 ${subText}`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddDeliveryPartner} className="space-y-3">
                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Full Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Sharma"
                    value={riderName}
                    onChange={e => setRiderName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Email Address (Login ID)</label>
                  <input 
                    type="email" 
                    placeholder="rider@example.com"
                    value={riderEmail}
                    onChange={e => setRiderEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'
                    }`}
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Phone Number / WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210"
                    value={riderPhone}
                    onChange={e => setRiderPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'
                    }`}
                    required 
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#557373]/10 border border-[#557373]/20 text-[10px] text-[#557373]">
                  🔒 Temporary password will be securely generated by server and dispatched to rider via WhatsApp / email.
                </div>

                {riderSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 font-bold text-[10px]">
                    ✓ {riderSuccessMsg}
                  </div>
                )}

                <div className="pt-2 flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={closeRiderModal}
                    className={`px-4 py-2 rounded-xl border font-bold uppercase text-[10px] ${
                      isDark ? 'border-white/10 text-white' : 'border-[#557373]/30 text-[#557373]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={riderLoading}
                    className={`px-5 py-2 rounded-xl text-white font-bold uppercase text-[10px] shadow-md ${
                      isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                    }`}
                  >
                    {riderLoading ? 'Creating Account...' : 'Create Rider Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING BOTTOM NAVIGATION DOCK (HUB OWNER) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none w-auto max-w-[92vw] sm:max-w-max pointer-events-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={dockStyle}
          className="inline-flex flex-row items-center space-x-1 sm:space-x-1.5 shrink-0 whitespace-nowrap px-3 py-1.5 shadow-2xl"
        >
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all relative ${
                  isActive
                    ? (isDark 
                        ? 'bg-dark-accent/20 text-dark-accent border border-dark-accent/30 shadow-sm' 
                        : 'bg-[#557373] text-white shadow-sm')
                    : subText
                }`}
              >
                <Icon size={14} className={isActive ? 'animate-pulse' : ''} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="hubDockGlow"
                    className={`absolute inset-0 rounded-xl pointer-events-none ${
                      isDark ? 'shadow-[0_0_12px_rgba(85,115,115,0.4)]' : 'shadow-[0_0_12px_rgba(85,115,115,0.3)]'
                    }`}
                  />
                )}
              </motion.button>
            );
          })}

          {/* Separator */}
          <div className={`h-4 w-[1px] mx-1 ${isDark ? 'bg-white/10' : 'bg-[#557373]/20'}`} />

          {/* Sign Out Action in Dock */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${
              isDark ? 'border-danger/20 text-danger hover:bg-danger/10' : 'border-[#557373]/30 text-[#557373] hover:bg-[#557373]/10'
            }`}
            title="Sign Out of Workspace"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </motion.button>
        </motion.div>
      </div>

      {/* PRODUCT CREATE/EDIT OVERLAY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={glassCardStyle}
              className="w-full max-w-lg p-6 md:p-8 space-y-6 relative"
            >
              <div className={`border-b pb-4 flex justify-between items-center ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                <h3 className={`font-bold text-base uppercase ${textColor}`}>
                  {editingProduct ? 'Edit Product Listing' : 'Add Product Listing'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className={subText}><X size={16} /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Product Name</label>
                  <input 
                    type="text" 
                    value={prodName} 
                    onChange={e => setProdName(e.target.value)} 
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'
                    }`} 
                    required 
                  />
                </div>

                {/* Cloudinary Image Upload Control */}
                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Product Image (Cloudinary Hosted)</label>
                  <div className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 relative transition-all ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-[#557373]/20'
                  }`}>
                    {prodImage ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 group">
                        <img src={prodImage} alt="Product Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setProdImage(''); setProdCloudinaryPublicId(''); }}
                          className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow-md transition-all"
                          title="Remove Image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full flex flex-col items-center justify-center py-4 cursor-pointer hover:opacity-80 transition-opacity">
                        {uploadingImage ? (
                          <div className="flex flex-col items-center space-y-2">
                            <span className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></span>
                            <span className={`text-[9px] font-mono tracking-wider ${subText}`}>Uploading to Cloudinary...</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} className={`mb-1 ${accentText}`} />
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${textColor}`}>Click to Upload Product Image</span>
                            <span className={`text-[8px] ${subText} mt-0.5`}>PNG, JPG, WEBP up to 10MB</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageSelect} 
                          className="hidden" 
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                    {uploadError && (
                      <p className="text-[9px] text-danger font-semibold">{uploadError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Description</label>
                  <textarea 
                    value={prodDesc} 
                    onChange={e => setProdDesc(e.target.value)} 
                    rows={3} 
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'
                    }`} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Daily Rate (₹)</label>
                    <input 
                      type="number" 
                      value={prodPrice} 
                      onChange={e => setProdPrice(e.target.value)} 
                      className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'
                      }`} 
                      required 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[8px] font-extrabold uppercase ${subText}`}>Deposit Hold (₹)</label>
                    <input 
                      type="number" 
                      value={prodDeposit} 
                      onChange={e => setProdDeposit(e.target.value)} 
                      className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A]'
                      }`} 
                      required 
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className={`px-4 py-2 rounded-xl border font-bold uppercase text-[10px] ${
                      isDark ? 'border-white/10 text-white' : 'border-[#557373]/30 text-[#557373]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`px-5 py-2 rounded-xl text-white font-bold uppercase text-[10px] shadow-md ${
                      isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                    }`}
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
