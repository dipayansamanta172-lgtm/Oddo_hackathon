import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Compass, 
  Clock, 
  CreditCard, 
  User, 
  Box, 
  ArrowLeft, 
  Heart, 
  ShoppingCart,
  Calendar,
  Lock,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Settings
} from 'lucide-react';

export default function ProductCatalog({ isDark, onNavigate, currentUser, onLogout, toggleTheme }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [durationDays, setDurationDays] = useState(3);
  const [deliveryChoice, setDeliveryChoice] = useState('Store Pickup');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const token = localStorage.getItem('rexpo_token');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch catalog');
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [nearestHubInfo, setNearestHubInfo] = useState(null);

  const handleOpenBookingModal = async (product) => {
    setSelectedProduct(product);
    setDurationDays(3);
    setDeliveryChoice('Store Pickup');
    setBookingSuccess('');
    setBookingError('');
    setNearestHubInfo(null);

    try {
      const response = await fetch('/api/hubs/nearest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });
      const data = await response.json();
      if (response.ok && data.available) {
        setNearestHubInfo({
          name: data.nearestHub.name,
          location: data.nearestHub.location,
          distanceKm: data.distanceKm
        });
      } else if (data.available === false) {
        setBookingError(data.message || 'Product is currently unavailable at nearest eligible hubs.');
      }
    } catch {
      // Graceful fallback
    }
  };

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const isAvailable = (
      selectedProduct.status === 'ACTIVE' &&
      selectedProduct.available !== false &&
      (selectedProduct.available_quantity === undefined || Number(selectedProduct.available_quantity) > 0) &&
      (selectedProduct.quantity === undefined || Number(selectedProduct.quantity) > 0)
    );

    if (!isAvailable) {
      setBookingError('Product is currently unavailable.');
      return;
    }

    const activeToken = localStorage.getItem('rexpo_token') || token;
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      // Step 1: Ensure Razorpay SDK is loaded
      const isSDKLoaded = await loadRazorpaySDK();
      if (!isSDKLoaded) {
        throw new Error('Failed to load Razorpay payment gateway SDK.');
      }

      // Step 2: Create Razorpay Test Order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          productId: selectedProduct.id
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        if (orderRes.status === 401) {
          throw new Error('Please log in to your account to complete rental payment.');
        }
        throw new Error(orderData.error || 'Failed to initialize Razorpay test order');
      }

      // Step 3: Launch Razorpay Test Checkout Modal
      const options = {
        key: orderData.keyId || 'rzp_test_TNDaZSZ',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'REXPO Rental Equipment',
        description: `Rental: ${selectedProduct.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Step 4: Verify Payment Signature on Backend
            const verifyRes = await fetch('/api/payments/verify-signature', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${activeToken}`
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            // Step 5: Save Booking in Database after verified payment
            const bookingRes = await fetch('/api/bookings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${activeToken}`
              },
              body: JSON.stringify({
                productId: selectedProduct.id,
                duration: `${validDuration} Days`,
                deliveryChoice
              })
            });

            const bookingData = await bookingRes.json();
            if (!bookingRes.ok) throw new Error(bookingData.error || 'Failed to place booking request');

            setBookingSuccess('Payment verified & rental request placed successfully!');
            setTimeout(() => {
              setSelectedProduct(null);
              if (onNavigate) onNavigate('dashboard');
            }, 1500);
          } catch (err) {
            setBookingError(err.message);
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBookingError('Payment cancelled by user.');
            setBookingLoading(false);
          }
        },
        prefill: {
          name: currentUser?.fullName || '',
          email: currentUser?.email || ''
        },
        theme: {
          color: '#557373'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setBookingError(response.error?.description || 'Payment failed.');
        setBookingLoading(false);
      });
      rzp.open();

    } catch (err) {
      setBookingError(err.message);
      setBookingLoading(false);
    }
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

  const glassInputStyle = {
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.65)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(85, 115, 115, 0.20)',
    borderRadius: '10px',
  };

  // Explicit Numeric Cost calculations
  const dailyRate = selectedProduct ? (Number(selectedProduct.price) || 0) : 0;
  const validDuration = Math.max(1, parseInt(durationDays) || 1);
  const depositHold = selectedProduct ? (Number(selectedProduct.deposit) || 0) : 0;

  const rentalFee = dailyRate * validDuration;
  const totalAmount = rentalFee + depositHold;

  const isProductAvailable = selectedProduct && (
    selectedProduct.status === 'ACTIVE' &&
    selectedProduct.available !== false &&
    (selectedProduct.available_quantity === undefined || Number(selectedProduct.available_quantity) > 0) &&
    (selectedProduct.quantity === undefined || Number(selectedProduct.quantity) > 0)
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`w-full min-h-screen flex flex-col transition-colors duration-300 text-xs ${
      isDark ? 'bg-dark-bg text-white' : 'bg-[#DFE5F3] text-[#1A1A1A]'
    }`}>
      
      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden pb-32">
        {/* Header */}
        <div className={`h-14 border-b px-6 flex items-center justify-between ${
          isDark ? 'border-white/5 bg-dark-bg/50' : 'border-[#557373]/15 bg-[#DFE5F3]/85 backdrop-blur-md'
        }`}>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className={`flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[10px] ${
              isDark ? textColor : 'text-[#557373]'
            }`}
          >
            <ArrowLeft size={12} className="mr-0.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border transition-all ${
                isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button 
              onClick={() => onNavigate('/settings')}
              className={`p-1.5 rounded-lg border transition-all ${
                isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/20 hover:bg-[#557373]/10 text-[#557373]'
              }`}
              aria-label="Portal Settings"
            >
              <Settings size={14} />
            </button>
            <button 
              onClick={() => onNavigate('profile')}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold border hover:opacity-85 transition-all focus:outline-none ${
                isDark ? 'border-white/10 text-white' : 'border-[#557373]/30 bg-[#557373]/15 text-[#557373]'
              }`}
              aria-label="View Profile"
            >
              {currentUser ? currentUser.fullName.slice(0, 2).toUpperCase() : 'US'}
            </button>
          </div>
        </div>

        {/* Product catalog content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className={`text-[9px] uppercase tracking-wider font-extrabold ${accentText}`}>Catalog / Hardware</span>
              <h2 className={`text-xl md:text-2xl font-bold tracking-tight mt-1 ${textColor}`}>Available Products</h2>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subText}`} size={14} />
              <input 
                type="text" 
                placeholder="Filter catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder-mutedGrey/40 focus:border-dark-accent/50' 
                    : 'bg-white/60 border-[#557373]/20 text-[#1A1A1A] placeholder-[#557373]/50 focus:border-[#557373]'
                }`}
              />
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className={`text-xs font-mono tracking-widest animate-pulse uppercase ${subText}`}>Syncing Catalog...</span>
            </div>
          ) : error ? (
            <div className={`p-4 rounded-xl border text-xs ${isDark ? 'border-danger/20 bg-danger/5 text-danger' : 'border-[#557373]/20 bg-[#557373]/10 text-[#557373]'}`}>
              <span>{error}</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={glassCardStyle} className="p-16 text-center space-y-4 max-w-xl mx-auto my-8">
              <div className={`p-4 rounded-2xl inline-block ${isDark ? 'bg-dark-accent/10 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'}`}>
                <Box size={32} />
              </div>
              <div className="space-y-1">
                <h3 className={`font-bold text-base ${textColor}`}>No rental products available yet.</h3>
                <p className={`text-xs ${subText}`}>
                  Check back soon or explore other hubs for equipment inventory.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={glassCardStyle}
                  className="p-5 flex flex-col justify-between space-y-4 hover:border-[#557373]/40 transition-all group"
                >
                  <div className={`w-full h-44 rounded-xl overflow-hidden relative border ${
                    isDark ? 'bg-white/5 border-white/5' : 'bg-[#557373]/5 border-[#557373]/10'
                  } flex items-center justify-center`}>
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="text-center p-4 space-y-1">
                        <Box size={24} className={`mx-auto ${isDark ? 'text-dark-accent/40' : 'text-[#557373]/40'}`} />
                        <span className={`text-[8px] font-mono uppercase tracking-widest ${subText}`}>No Image Available</span>
                      </div>
                    )}

                    <div className={`absolute top-2.5 right-2.5 backdrop-blur-md text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
                      isDark ? 'bg-dark-accent/90 text-white' : 'bg-[#557373] text-white'
                    }`}>
                      {product.category || 'Hardware'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className={`font-bold text-sm tracking-tight ${textColor} line-clamp-1`}>{product.name}</h3>
                    <p className={`text-[10px] ${subText} line-clamp-2 leading-relaxed`}>{product.description}</p>
                    <div className={`flex items-center space-x-2 text-[9px] font-semibold pt-1 ${accentText}`}>
                      <MapPin size={11} />
                      <span>Depot: {product.hubName || 'Central Hub'}</span>
                    </div>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                    <div>
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Daily Rate</span>
                      <p className={`font-mono font-bold text-sm ${accentText}`}>₹{Number(product.price).toLocaleString()}<span className={`text-[9px] font-normal ${subText}`}>/day</span></p>
                    </div>
                    <button 
                      onClick={() => handleOpenBookingModal(product)}
                      className={`font-bold text-[10px] px-3.5 py-2 rounded-xl uppercase tracking-wider transition-all shadow-md ${
                        isDark ? 'bg-dark-accent hover:bg-dark-accent/90 text-white' : 'bg-[#557373] hover:bg-[#557373]/90 text-white'
                      }`}
                    >
                      Rent Item
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* RENTAL BOOKING OVERLAY MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={glassCardStyle}
              className="w-full max-w-lg p-6 md:p-8 space-y-6 relative"
            >
              <div className={`border-b pb-4 flex justify-between items-start ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                <div>
                  <span className={`text-[8px] font-extrabold uppercase tracking-widest ${accentText}`}>Confirm Booking Agreement</span>
                  <h2 className={`text-xl font-bold ${textColor} mt-0.5`}>{selectedProduct.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className={`text-xs font-mono p-1 rounded hover:opacity-80 ${subText}`}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                
                {selectedProduct.imageUrl && (
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* Duration Picker */}
                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Duration (Days)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30" 
                    value={durationDays} 
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    style={glassInputStyle}
                    className={`w-full px-3 py-2 font-mono text-xs focus:outline-none ${textColor}`}
                    required 
                  />
                </div>

                {/* Fulfillment Method */}
                <div className="space-y-1">
                  <label className={`text-[8px] font-extrabold uppercase tracking-widest ${subText}`}>Fulfillment Method</label>
                  <select 
                    value={deliveryChoice} 
                    onChange={(e) => setDeliveryChoice(e.target.value)}
                    style={glassInputStyle}
                    className={`w-full px-3 py-2 text-xs focus:outline-none ${isDark ? 'bg-[#191919] text-white' : 'bg-white text-[#1A1A1A]'}`}
                  >
                    <option value="Store Pickup">Direct Store Pickup</option>
                    <option value="Home Delivery">Doorstep Delivery</option>
                  </select>
                </div>

                {/* Nearest Fulfillment Hub Indicator */}
                {nearestHubInfo && (
                  <div className={`p-3 rounded-xl border flex items-center space-x-2 font-mono text-[10px] ${
                    isDark ? 'border-white/10 bg-white/5 text-white' : 'border-[#557373]/20 bg-[#557373]/10 text-[#557373]'
                  }`}>
                    <MapPin size={14} className="shrink-0" />
                    <div>
                      <span className="font-bold">Nearest Fulfillment Hub: </span>
                      <span>{nearestHubInfo.name} ({nearestHubInfo.location}) • {nearestHubInfo.distanceKm} km away</span>
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div className={`p-4 rounded-xl border space-y-2 font-mono text-[11px] ${
                  isDark ? 'border-borderGrey/10 bg-black/5' : 'border-[#557373]/15 bg-white/50'
                }`}>
                  <div className="flex justify-between">
                    <span className={subText}>Daily Rate x {validDuration} Days</span>
                    <span className={`font-semibold ${textColor}`}>₹{rentalFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={subText}>Refundable Deposit Hold</span>
                    <span className={`font-semibold ${textColor}`}>₹{depositHold.toLocaleString()}</span>
                  </div>
                  <div className={`pt-2 border-t flex justify-between font-bold text-xs ${accentText} ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                    <span>Total Upfront Amount</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {!isProductAvailable && (
                  <div className={`p-3 rounded-lg border text-[10px] flex items-center space-x-2 ${
                    isDark ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-red-500/10 border-red-500/20 text-red-600'
                  }`}>
                    <AlertCircle size={14} />
                    <span>Product is currently unavailable.</span>
                  </div>
                )}

                {bookingError && (
                  <div className={`p-3 rounded-lg border text-[10px] flex items-center space-x-2 ${
                    isDark ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-[#557373]/15 border-[#557373]/30 text-[#557373]'
                  }`}>
                    <AlertCircle size={14} />
                    <span>{bookingError}</span>
                  </div>
                )}

                {bookingSuccess && (
                  <div className={`p-3 rounded-lg border text-[10px] flex items-center space-x-2 ${
                    isDark ? 'bg-success/10 border-success/20 text-success' : 'bg-[#557373]/15 border-[#557373]/30 text-[#557373]'
                  }`}>
                    <CheckCircle2 size={14} />
                    <span>{bookingSuccess}</span>
                  </div>
                )}

                <div className="pt-2 flex space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setSelectedProduct(null)}
                    className={`w-1/2 py-2.5 rounded-xl border font-bold uppercase tracking-wider text-[10px] ${
                      isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-[#557373]/30 hover:bg-[#557373]/10 text-[#557373]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={bookingLoading || !isProductAvailable}
                    className={`w-1/2 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all shadow-md disabled:opacity-50 ${
                      isDark ? 'bg-dark-accent hover:bg-dark-accent/90 text-white' : 'bg-[#557373] hover:bg-[#557373]/90 text-white'
                    }`}
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Rental'}
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
