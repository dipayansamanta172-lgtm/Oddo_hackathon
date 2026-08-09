import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CreditCard, 
  User, 
  Box, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  Building, 
  MapPin, 
  AlertCircle,
  Truck,
  Users,
  Sun,
  Moon,
  Settings
} from 'lucide-react';

export default function AdminDashboard({ isDark, currentUser, onLogout, toggleTheme, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'bookings', 'hubs', 'logs'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dynamic Data States
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Product Modal States (for Hub Owners)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDeposit, setProdDeposit] = useState('');
  const [prodQty, setProdQty] = useState('1');
  const [prodPickup, setProdPickup] = useState(true);
  const [prodDelivery, setProdDelivery] = useState(true);

  const token = localStorage.getItem('rexpo_token');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentUser.role === 'SUPER_ADMIN') {
        const response = await fetch('/api/admin/data', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load system data');
        setProducts(data.products || []);
        setBookings(data.bookings || []);
        setHubs(data.hubs || []);
        setUsers(data.users || []);
        setLogs(data.logs || []);
      } else if (currentUser.role === 'HUB_OWNER') {
        // Fetch hub products
        const prodRes = await fetch('/api/hub/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const prodData = await prodRes.json();
        if (!prodRes.ok) throw new Error(prodData.error || 'Failed to load products');
        setProducts(prodData || []);

        // Fetch hub bookings
        const bkRes = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bkData = await bkRes.json();
        if (!bkRes.ok) throw new Error(bkData.error || 'Failed to load bookings');
        setBookings(bkData || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handle Product Create/Update
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
      delivery: prodDelivery
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
      fetchData(); // Reload list
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return;
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete product');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Booking Approval
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

  // Handle Booking Settlement (Return & Release Deposit)
  const handleSettleBooking = async (bookingId) => {
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
    setIsModalOpen(true);
  };

  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/70';
  const accentText = isDark ? 'text-dark-accent' : 'text-[#557373]';
  const surfaceBg = isDark ? 'bg-charcoal border-white/5' : 'bg-white/75 border-[#557373]/15';
  const sidebarBg = isDark ? 'bg-slateDark border-white/5' : 'bg-[#DFE5F3] border-[#557373]/15';
  const inputBg = isDark ? 'bg-slateDark border-white/5 text-white' : 'bg-white/65 border-[#557373]/20 text-[#1A1A1A]';

  // KPI Calculations
  const activeRentalsCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pendingApprovalsCount = bookings.filter(b => b.status === 'PROCESSING').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'RELEASED')
    .reduce((sum, b) => sum + b.productPrice, 0);

  return (
    <div className={`w-full min-h-screen flex transition-colors duration-300 text-xs ${
      isDark ? 'bg-dark-bg text-white' : 'bg-[#DFE5F3] text-[#1A1A1A]'
    }`}>
      
      {/* SIDEBAR NAVIGATION */}
      <div className={`w-56 flex flex-col justify-between p-4 border-r ${sidebarBg}`}>
        <div className="space-y-6">
          <div className="flex items-center space-x-2.5 px-2 py-1">
            <span className={`text-xl font-extrabold tracking-wider font-display ${textColor}`}>REXPO</span>
            <span className="text-[8px] bg-dark-accent/15 text-dark-accent px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
              {currentUser.role === 'SUPER_ADMIN' ? 'Admin Desk' : 'Hub Desk'}
            </span>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-semibold text-left transition-all ${
                activeTab === 'overview' ? 'bg-dark-accent text-white' : `hover:bg-black/5 dark:hover:bg-white/5 ${subText}`
              }`}
            >
              <Box size={14} />
              <span>Overview Desk</span>
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-semibold text-left transition-all ${
                activeTab === 'products' ? 'bg-dark-accent text-white' : `hover:bg-black/5 dark:hover:bg-white/5 ${subText}`
              }`}
            >
              <Building size={14} />
              <span>{currentUser.role === 'SUPER_ADMIN' ? 'All Products' : 'My Inventory'}</span>
            </button>
            
            {currentUser.role === 'SUPER_ADMIN' && (
              <>
                <button 
                  onClick={() => setActiveTab('hubs')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-semibold text-left transition-all ${
                    activeTab === 'hubs' ? 'bg-dark-accent text-white' : `hover:bg-black/5 dark:hover:bg-white/5 ${subText}`
                  }`}
                >
                  <Building size={14} />
                  <span>Depot Hubs</span>
                </button>
                <button 
                  onClick={() => setActiveTab('logs')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md font-semibold text-left transition-all ${
                    activeTab === 'logs' ? 'bg-dark-accent text-white' : `hover:bg-black/5 dark:hover:bg-white/5 ${subText}`
                  }`}
                >
                  <FileText size={14} />
                  <span>Audit Logs</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-borderGrey/10">
          <button 
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center space-x-2 px-1 hover:bg-black/5 dark:hover:bg-white/5 py-1 rounded transition-all text-left focus:outline-none"
          >
            <div className="w-7 h-7 rounded-full bg-dark-accent/20 flex items-center justify-center font-bold text-dark-accent uppercase shrink-0">
              {currentUser.fullName.slice(0,2)}
            </div>
            <div className="text-[10px] overflow-hidden truncate">
              <p className={`font-bold leading-none ${textColor} truncate`}>{currentUser.fullName}</p>
              <span className={`text-[8px] ${subText} block truncate mt-0.5`}>{currentUser.email}</span>
            </div>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-md font-bold uppercase text-[9px] text-danger hover:bg-danger/5 transition-all text-left"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`h-14 border-b px-6 flex items-center justify-between ${
          isDark ? 'border-white/5 bg-dark-bg/50' : 'border-charcoal/5 bg-white/50'
        }`}>
          <h2 className={`font-bold text-sm tracking-tight ${textColor} uppercase`}>
            {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin Control Center' : 'Hub Operations Desk'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border transition-all ${
                isDark ? 'border-white/10 hover:bg-white/5' : 'border-charcoal/10 hover:bg-black/5'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={14} className={textColor} /> : <Moon size={14} className={textColor} />}
            </button>
            <button 
              onClick={() => onNavigate('/settings')}
              className={`p-1.5 rounded-lg border transition-all ${
                isDark ? 'border-white/10 hover:bg-white/5' : 'border-charcoal/10 hover:bg-black/5'
              }`}
              aria-label="Portal Settings"
            >
              <Settings size={14} className={textColor} />
            </button>
            <div className={`w-2 h-2 rounded-full bg-success animate-pulse`} />
          </div>
        </div>

        {/* Dynamic Inner views */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 relative">
          
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent">
              <span className="text-xs font-mono tracking-widest text-mutedGrey animate-pulse uppercase">Syncing Dashboard Data...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-danger/20 bg-danger/5 text-danger text-xs flex items-start space-x-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW PANEL */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI card grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl border ${surfaceBg} flex flex-col justify-between`}>
                      <span className={`text-[8px] font-extrabold tracking-wider ${subText}`}>ACTIVE RENTALS</span>
                      <p className={`text-2xl font-black mt-2 ${textColor}`}>{activeRentalsCount}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${surfaceBg} flex flex-col justify-between`}>
                      <span className={`text-[8px] font-extrabold tracking-wider ${subText}`}>PENDING APPROVALS</span>
                      <p className={`text-2xl font-black mt-2 ${pendingApprovalsCount > 0 ? 'text-warning' : textColor}`}>
                        {pendingApprovalsCount}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl border ${surfaceBg} flex flex-col justify-between`}>
                      <span className={`text-[8px] font-extrabold tracking-wider ${subText}`}>TOTAL REVENUE</span>
                      <p className={`text-2xl font-black mt-2 ${textColor}`}>₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-xl border bg-dark-accent/15 border-dark-accent/30 flex flex-col justify-between`}>
                      <span className="text-[8px] font-extrabold tracking-wider text-dark-accent">INVENTORY STATUS</span>
                      <p className="text-2xl font-black text-dark-accent mt-2">{products.length} Items</p>
                    </div>
                  </div>

                  {/* Pending approvals queue list */}
                  <div className="space-y-3">
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>Pending Approvals Queue</h3>
                    <div className={`rounded-xl border divide-y ${isDark ? 'border-white/5 divide-white/5' : 'border-charcoal/5 divide-charcoal/5'} ${surfaceBg}`}>
                      {bookings.filter(b => b.status === 'PROCESSING').length === 0 ? (
                        <div className="p-6 text-center text-mutedGrey">
                          <span>No bookings yet.</span>
                        </div>
                      ) : (
                        bookings.filter(b => b.status === 'PROCESSING').map(b => (
                          <div key={b.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className={`font-bold ${textColor}`}>{b.productName}</span>
                                <span className="text-[8px] font-mono bg-borderGrey/10 text-mutedGrey px-1.5 py-0.5 rounded uppercase">{b.id}</span>
                              </div>
                              <p className={`text-[10px] ${subText}`}>Requested by: <span className="font-semibold">{b.userName}</span> ({b.userPhone})</p>
                              <p className={`text-[10px] ${subText}`}>Delivery: <span className="font-semibold">{b.deliveryChoice}</span> | Duration: <span className="font-semibold">{b.duration}</span></p>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleApproveBooking(b.id)}
                                className="bg-success text-white font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] hover:bg-success/90 transition-all"
                              >
                                Approve Rental
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Active / return settlement logs */}
                  <div className="space-y-3">
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>Active Rentals Log</h3>
                    <div className={`rounded-xl border divide-y ${isDark ? 'border-white/5 divide-white/5' : 'border-charcoal/5 divide-charcoal/5'} ${surfaceBg}`}>
                      {bookings.filter(b => b.status === 'CONFIRMED').length === 0 ? (
                        <div className="p-6 text-center text-mutedGrey">
                          <span>No bookings yet.</span>
                        </div>
                      ) : (
                        bookings.filter(b => b.status === 'CONFIRMED').map(b => (
                          <div key={b.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className={`font-bold ${textColor}`}>{b.productName}</span>
                                <span className="text-[8px] font-mono bg-borderGrey/10 text-mutedGrey px-1.5 py-0.5 rounded uppercase">{b.id}</span>
                              </div>
                              <p className={`text-[10px] ${subText}`}>Rented by: <span className="font-semibold">{b.userName}</span> | Deposit Hold: <span className="font-mono font-bold text-dark-accent">₹{b.productDeposit.toLocaleString()}</span></p>
                              <p className={`text-[10px] ${subText}`}>Duration: <span className="font-semibold">{b.duration}</span> | Settle Option: <span className="font-semibold">{b.deliveryChoice}</span></p>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleSettleBooking(b.id)}
                                className="bg-dark-accent text-white font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] hover:bg-dark-accent/90 transition-all"
                              >
                                Settle Return & Release
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PRODUCTS MANAGER */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>
                      {currentUser.role === 'SUPER_ADMIN' ? 'Global Catalog List' : 'My Hub Products'}
                    </h3>
                    {currentUser.role === 'HUB_OWNER' && (
                      <button 
                        onClick={() => { resetProductForm(); setIsModalOpen(true); }}
                        className="bg-dark-accent hover:bg-dark-accent/90 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                      >
                        <Plus size={14} />
                        <span>Add Product</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-mutedGrey">
                        <span>No rental products available yet.</span>
                      </div>
                    ) : (
                      products.map(p => (
                        <div key={p.id} className={`p-4 rounded-xl border flex flex-col justify-between ${surfaceBg}`}>
                          <div className="space-y-3">
                            <div className="h-32 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center p-2 border border-borderGrey/10">
                              <img src={p.image} alt={p.name} className="h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:opacity-85" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`font-bold text-xs ${textColor}`}>{p.name}</h4>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                                  p.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-mutedGrey/20 text-mutedGrey'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                              <p className={`text-[10px] ${subText} line-clamp-2 leading-relaxed`}>{p.description}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-borderGrey/10 flex justify-between items-center">
                            <div className="space-y-0.5">
                              <p className={`font-mono font-bold text-xs ${textColor}`}>₹{p.price.toLocaleString()} / day</p>
                              <span className={`text-[8px] ${subText}`}>Deposit: ₹{p.deposit.toLocaleString()}</span>
                            </div>

                            {currentUser.role === 'HUB_OWNER' && (
                              <div className="flex space-x-1.5">
                                <button 
                                  onClick={() => openEditModal(p)}
                                  className={`p-1.5 rounded border border-borderGrey/10 hover:bg-black/5 dark:hover:bg-white/5 ${textColor}`}
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded border border-danger/10 hover:bg-danger/5 text-danger"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: HUBS & OWNERS (Super Admin only) */}
              {activeTab === 'hubs' && currentUser.role === 'SUPER_ADMIN' && (
                <div className="space-y-4">
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>Registered Depot Hubs & Sub Admins</h3>
                  <div className={`rounded-xl border divide-y overflow-hidden ${isDark ? 'border-white/5 divide-white/5' : 'border-charcoal/5 divide-charcoal/5'} ${surfaceBg}`}>
                    {hubs.length === 0 ? (
                      <div className="p-6 text-center text-mutedGrey">
                        <span>No hubs have been registered yet.</span>
                      </div>
                    ) : (
                      hubs.map(h => (
                        <div key={h.id} className="p-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                          <div className="space-y-1">
                            <h4 className={`font-bold text-xs ${textColor}`}>{h.name}</h4>
                            <p className={`text-[10px] ${subText} flex items-center space-x-1`}>
                              <MapPin size={10} className="text-dark-accent shrink-0" />
                              <span>{h.location} - {h.address}</span>
                            </p>
                          </div>
                          <div>
                            <p className={`font-semibold ${textColor}`}>{h.ownerName}</p>
                            <span className={`text-[9px] ${subText}`}>{h.ownerEmail}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] bg-dark-accent/15 text-dark-accent px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                              ID: {h.id}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT LOGS (Super Admin only) */}
              {activeTab === 'logs' && currentUser.role === 'SUPER_ADMIN' && (
                <div className="space-y-4">
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>System Operations Logs</h3>
                  <div className={`rounded-xl border divide-y overflow-hidden max-h-[400px] overflow-y-auto ${isDark ? 'border-white/5 divide-white/5' : 'border-charcoal/5 divide-charcoal/5'} ${surfaceBg}`}>
                    {logs.length === 0 ? (
                      <div className="p-6 text-center text-mutedGrey">
                        <span>No operation logs recorded.</span>
                      </div>
                    ) : (
                      logs.map(l => (
                        <div key={l.id} className="p-3 flex justify-between items-center text-[10px]">
                          <span className={textColor}>{l.message}</span>
                          <span className="text-mutedGrey font-mono text-[8px] shrink-0">{new Date(l.timestamp).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>

      {/* CREATE/EDIT PRODUCT MODAL FORM (Hub Owners Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md p-6 rounded-2xl border ${surfaceBg} space-y-4 shadow-2xl relative ${
              isDark ? 'bg-charcoal' : 'bg-white'
            }`}
          >
            <div className="border-b border-borderGrey/10 pb-3 flex justify-between items-center">
              <h3 className={`font-bold text-xs uppercase tracking-wider ${textColor}`}>
                {editingProduct ? 'Edit Product Listing' : 'List New Rental Product'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`text-xs font-semibold ${textColor}`}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider block">Product Name *</label>
                <input 
                  type="text" 
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Canon EOS R6 Kit"
                  className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none ${inputBg}`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider block">Description</label>
                <textarea 
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Provide product details, accessories included..."
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none h-16 resize-none ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider block">Price (₹ / day) *</label>
                  <input 
                    type="number" 
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="18000"
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none ${inputBg}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider block">Security Deposit (₹) *</label>
                  <input 
                    type="number" 
                    value={prodDeposit}
                    onChange={(e) => setProdDeposit(e.target.value)}
                    placeholder="25000"
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none ${inputBg}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider block">Quantity</label>
                  <input 
                    type="number" 
                    value={prodQty}
                    onChange={(e) => setProdQty(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none ${inputBg}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider block">Status</label>
                  <select 
                    value={editingProduct ? editingProduct.status : 'ACTIVE'}
                    onChange={(e) => {
                      if (editingProduct) editingProduct.status = e.target.value;
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs focus:outline-none bg-transparent ${inputBg}`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-6 pt-1">
                <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={prodPickup}
                    onChange={(e) => setProdPickup(e.target.checked)}
                    className="rounded border-borderGrey/10 bg-transparent text-dark-accent focus:ring-0 cursor-pointer"
                  />
                  <span>Store Pickup</span>
                </label>

                <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={prodDelivery}
                    onChange={(e) => setProdDelivery(e.target.checked)}
                    className="rounded border-borderGrey/10 bg-transparent text-dark-accent focus:ring-0 cursor-pointer"
                  />
                  <span>Home Delivery</span>
                </label>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all shadow-md bg-dark-accent hover:bg-dark-accent/90 text-white"
              >
                {editingProduct ? 'Save Changes' : 'List Product'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
