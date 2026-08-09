import React from 'react';
import { Calendar, Truck, ArrowRight, X, AlertCircle } from 'lucide-react';

export default function OrderCartModal({ isDark, product, onClose, onConfirm }) {
  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/70';
  const surfaceBg = isDark ? 'bg-charcoal border-white/5' : 'bg-white/75 border-[#557373]/15';
  
  if (!product) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-end">
      <div className={`w-80 h-full p-6 flex flex-col justify-between border-l shadow-2xl transition-all duration-300 ${
        isDark ? 'bg-dark-bg border-white/5 text-white' : 'bg-[#DFE5F3] border-[#557373]/20 text-[#1A1A1A]'
      }`}>
        
        <div className="space-y-6">
          <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
            <div>
              <h3 className="text-base font-bold tracking-tight">Order Cart</h3>
              <span className={`text-[10px] ${subText}`}>Configure rental details</span>
            </div>
            <button onClick={onClose} className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${textColor}`}>
              <X size={16} />
            </button>
          </div>

          {/* Product selected mini card */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3.5 ${surfaceBg}`}>
            <div className="w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-1">
              <img src={product.image} alt={product.name} className="h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:opacity-80" />
            </div>
            <div>
              <h4 className="font-semibold text-xs">{product.name}</h4>
              <span className={`text-[10px] ${subText}`}>₹{product.price} / day</span>
            </div>
          </div>

          {/* Date Picker Section */}
          <div className="space-y-2">
            <span className={`text-[9px] uppercase tracking-wider font-extrabold ${subText}`}>Collection Dates</span>
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2.5 rounded-lg border flex flex-col ${surfaceBg}`}>
                <span className={`text-[8px] uppercase tracking-wider font-bold mb-1 ${subText}`}>Start Date</span>
                <span className="font-bold text-[10px] flex items-center space-x-1">
                  <Calendar size={11} className={`${isDark ? 'text-dark-accent' : 'text-[#557373]'} mr-1`} />
                  <span>Aug 12</span>
                </span>
              </div>
              <div className={`p-2.5 rounded-lg border flex flex-col ${surfaceBg}`}>
                <span className={`text-[8px] uppercase tracking-wider font-bold mb-1 ${subText}`}>End Date</span>
                <span className="font-bold text-[10px] flex items-center space-x-1">
                  <Calendar size={11} className={`${isDark ? 'text-dark-accent' : 'text-[#557373]'} mr-1`} />
                  <span>Aug 15</span>
                </span>
              </div>
            </div>
            <div className={`text-[10px] flex justify-between p-2 rounded-lg border ${
              isDark ? 'bg-dark-accent/5 text-dark-accent border-dark-accent/15' : 'bg-[#557373]/15 text-[#557373] border-[#557373]/30'
            }`}>
              <span>Rental Duration</span>
              <span className="font-bold">3 days</span>
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="space-y-2">
            <span className={`text-[9px] uppercase tracking-wider font-extrabold ${subText}`}>Delivery Mode</span>
            <div className={`flex items-center justify-between p-3 rounded-xl border ${
              isDark ? 'border-dark-accent bg-dark-accent/5' : 'border-[#557373] bg-[#557373]/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg text-white ${isDark ? 'bg-dark-accent' : 'bg-[#557373]'}`}><Truck size={14} /></div>
                <div className="text-[10px]">
                  <p className="font-bold">HOME DELIVERY</p>
                  <span className={subText}>Delivered directly to address</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isDark ? 'border-dark-accent bg-dark-accent' : 'border-[#557373] bg-[#557373]'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
            <div className="flex justify-between text-[11px]">
              <span className={subText}>Subtotal</span>
              <span>₹{parseFloat(product.price.replace(/,/g, '')) * 3}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className={subText}>Security Deposit</span>
              <span>₹10,000</span>
            </div>
            <div className={`flex justify-between text-xs font-bold pt-2 border-t border-dashed ${isDark ? 'border-borderGrey/20' : 'border-[#557373]/20'}`}>
              <span>Total Payment</span>
              <span className={isDark ? 'text-dark-accent' : 'text-[#557373]'}>₹{parseFloat(product.price.replace(/,/g, '')) * 3 + 10000}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className={`flex items-start space-x-2 text-[9px] p-2.5 rounded-lg border ${
            isDark ? 'bg-warning/5 border-warning/20 text-warning' : 'bg-[#557373]/10 border-[#557373]/25 text-[#557373]'
          }`}>
            <AlertCircle size={14} className="shrink-0" />
            <p className="leading-tight">Security deposit is fully refunded once the hardware return is cleared in the panel.</p>
          </div>
          <button 
            onClick={onConfirm}
            className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
              isDark ? 'bg-success hover:bg-success/90 text-white' : 'bg-[#557373] hover:bg-[#557373]/90 text-white'
            }`}
          >
            <span>Proceed with Booking</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
