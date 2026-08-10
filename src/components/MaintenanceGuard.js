'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { subscribeToMaintenance } from '../services/maintenanceService';
import { ShieldAlert, Key, RefreshCw, Lock } from 'lucide-react';

export default function MaintenanceGuard() {
  const pathname = usePathname();
  const [maintStatus, setMaintStatus] = useState({ isMaintenanceMode: false });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = subscribeToMaintenance((status) => {
      setMaintStatus(status);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Lock body scrolling when maintenance lockdown is active for citizens
    const isCitizenPage = pathname && !pathname.startsWith('/admin');
    if (maintStatus.isMaintenanceMode && isCitizenPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [maintStatus.isMaintenanceMode, pathname]);

  // Admin pages (/admin) are exempt so officers can log in & turn maintenance off
  const isAdminRoute = pathname && pathname.startsWith('/admin');

  if (!maintStatus.isMaintenanceMode || isAdminRoute) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden select-none animate-fade-in">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <img src="/mp-logo.png" alt="" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            रूटीन सुरक्षा अद्यतन एवं रखरखाव मोड (Maintenance Lockdown Active)
          </span>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            ई-सेवा डिजिटल नागरिक पोर्टल सुरक्षा जांच एवं तकनीकी रखरखाव हेतु अस्थायी रूप से स्थगित है
          </p>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-2.5 text-left shadow-inner">
          <div className="font-bold text-rose-400 flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>आधिकारिक सूचना (Official Maintenance Notice):</span>
          </div>
          <p className="leading-relaxed text-slate-300 text-xs sm:text-sm">
            {maintStatus.message || 'सुरक्षा एवं तकनीकी सर्वर अद्यतन के कारण नागरिक ऑनलाइन सेवाएं (जन्म, मृत्यु, जल कनेक्शन, नो ड्यूज NOC) अस्थायी रूप से स्थगित की गई हैं। सेवाएं अतिशीघ्र पुनः बहाल की जाएंगी।'}
          </p>
          {maintStatus.reason && (
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              कार्रवाई कारण: <span className="text-slate-300">{maintStatus.reason}</span>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-slate-800/80 text-xs">
          <Link 
            href="/admin" 
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>अधिकारी लॉगिन (/admin Officer Login)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
