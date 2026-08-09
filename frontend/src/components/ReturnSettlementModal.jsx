import React, { useState } from 'react';
import { Check, X, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ReturnSettlementModal({ isDark, rental, onClose, onConfirm }) {
  const [checklist, setChecklist] = useState({
    received: true,
    accessories: true,
    condition: true,
    refunded: false,
  });

  const textColor = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText = isDark ? 'text-mutedGrey' : 'text-[#557373]/70';
  const surfaceBg = isDark ? 'bg-charcoal border-white/5' : 'bg-white/75 border-[#557373]/15';

  if (!rental) return null;

  return (
    <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        isDark ? 'bg-[#151515] border-white/10 text-white' : 'bg-[#DFE5F3] border-[#557373]/20 text-[#1A1A1A]'
      }`}>
        
        {/* macOS Style Bar */}
        <div className={`h-10 border-b px-4 flex items-center justify-between ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
          <div className="flex items-center space-x-1.5">
            <div onClick={onClose} className={`w-3 h-3 rounded-full cursor-pointer ${isDark ? 'bg-danger/80' : 'bg-[#557373]/40'}`} />
            <div className={`w-3 h-3 rounded-full cursor-pointer ${isDark ? 'bg-warning/80' : 'bg-[#557373]/60'}`} />
            <div className={`w-3 h-3 rounded-full cursor-pointer ${isDark ? 'bg-success/80' : 'bg-[#557373]'}`} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Security Deposit Settlement</span>
          <button onClick={onClose} className={`hover:opacity-75 ${textColor}`}>
            <X size={14} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left: Product Image & Checklist */}
          <div className="md:col-span-2 space-y-4">
            <div className={`w-full aspect-square rounded-lg flex items-center justify-center p-4 border ${
              isDark ? 'bg-neutral-900 border-borderGrey/10' : 'bg-white/60 border-[#557373]/20'
            }`}>
              <img src={rental.image} alt={rental.name} className="h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:opacity-80" />
            </div>

            {/* Verification Checklist */}
            <div className="space-y-2">
              <span className={`text-[9px] uppercase tracking-wider font-extrabold ${subText}`}>Operational Checks</span>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isDark ? 'bg-success/15 border-success/30 text-success' : 'bg-[#557373]/15 border-[#557373]/30 text-[#557373]'
                  }`}>
                    <Check size={11} />
                  </div>
                  <span className="text-[10px]">Product Received</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isDark ? 'bg-success/15 border-success/30 text-success' : 'bg-[#557373]/15 border-[#557373]/30 text-[#557373]'
                  }`}>
                    <Check size={11} />
                  </div>
                  <span className="text-[10px]">Accessories Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isDark ? 'bg-success/15 border-success/30 text-success' : 'bg-[#557373]/15 border-[#557373]/30 text-[#557373]'
                  }`}>
                    <Check size={11} />
                  </div>
                  <span className="text-[10px]">Condition Checked</span>
                </div>
                
                {/* interactive final check */}
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setChecklist(prev => ({ ...prev, refunded: !prev.refunded }))}>
                  <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                    checklist.refunded 
                      ? (isDark ? 'bg-success border-success text-white' : 'bg-[#557373] border-[#557373] text-white')
                      : (isDark ? 'border-borderGrey/40 hover:border-success/50' : 'border-[#557373]/40 hover:border-[#557373]/80')
                  }`}>
                    {checklist.refunded && <Check size={11} />}
                  </div>
                  <span className="text-[10px] font-semibold">Verify Refund Status</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Deposit details & Confirmation */}
          <div className="md:col-span-3 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  isDark ? 'bg-dark-accent/10 text-dark-accent' : 'bg-[#557373]/15 text-[#557373]'
                }`}>Active Audit</span>
                <h3 className="text-base font-bold tracking-tight mt-2">{rental.name}</h3>
                <p className={`text-[10px] ${subText}`}>Returns audit log associated with invoice #REX-1048</p>
              </div>

              <div className={`divide-y space-y-2 text-[11px] ${isDark ? 'divide-borderGrey/10' : 'divide-[#557373]/15'}`}>
                <div className="flex justify-between py-1">
                  <span className={subText}>Rental Period Price</span>
                  <span className="font-semibold">{rental.price}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className={subText}>Security Deposit Held</span>
                  <span className={`font-bold ${isDark ? 'text-success' : 'text-[#557373]'}`}>₹10,000.00</span>
                </div>
                <div className={`flex justify-between py-1 pt-2 border-t font-semibold ${isDark ? 'border-borderGrey/10' : 'border-[#557373]/15'}`}>
                  <span>Refund Amount</span>
                  <span className={isDark ? 'text-dark-accent' : 'text-[#557373]'}>₹10,000.00</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg border flex items-start space-x-2 text-[9px] ${
                isDark ? 'bg-dark-accent/5 border-dark-accent/20 text-dark-accent' : 'bg-[#557373]/10 border-[#557373]/25 text-[#557373]'
              }`}>
                <ShieldCheck size={14} className="shrink-0" />
                <p className="leading-tight">All escrow hold releases are logged permanently in the MySQL database.</p>
              </div>
              
              <button 
                onClick={onConfirm}
                className={`w-full py-3 rounded-lg text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md ${
                  isDark ? 'bg-dark-accent hover:bg-dark-accent/90' : 'bg-[#557373] hover:bg-[#557373]/90'
                }`}
              >
                Clear Return & Release Deposit
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
