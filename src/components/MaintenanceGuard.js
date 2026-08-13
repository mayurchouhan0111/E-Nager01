'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { subscribeToMaintenance } from '../services/maintenanceService';
import { Key, Wrench } from 'lucide-react';

export default function MaintenanceGuard() {
  const pathname = usePathname();
  const [maintStatus, setMaintStatus] = useState({ isMaintenanceMode: false });

  useEffect(() => {
    const unsub = subscribeToMaintenance((status) => {
      setMaintStatus(status);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
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

  const isAdminRoute = pathname && pathname.startsWith('/admin');

  if (!maintStatus.isMaintenanceMode || isAdminRoute) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden select-none animate-fade-in">
      {/* Subtle Background Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/mp-logo.png" alt="" className="w-[550px] h-[550px] object-contain" />
      </div>

      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center space-y-6 backdrop-blur-xl">
        {/* Official Header */}
        <div className="flex flex-col items-center space-y-3">
          <img 
            src="/mp-logo.png" 
            alt="मध्य प्रदेश शासन" 
            className="w-16 h-16 object-contain drop-shadow-md" 
          />
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग
            </p>
          </div>
        </div>

        {/* Maintenance Badge */}
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            पोर्टल तकनीकी एवं सुरक्षा अद्यतन (System Maintenance)
          </span>
        </div>

        {/* Official Notice Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-3 text-left shadow-inner">
          <div className="font-extrabold text-amber-400 flex items-center gap-2 text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
            <span>आधिकारिक सूचना (Official Notice)</span>
          </div>
          <p className="leading-relaxed text-slate-300 text-xs sm:text-sm font-medium">
            {maintStatus.message || 'सुरक्षा एवं तकनीकी सर्वर अद्यतन के कारण नागरिक ऑनलाइन सेवाएं (जन्म, मृत्यु, जल कनेक्शन, नो ड्यूज NOC) अस्थायी रूप से स्थगित की गई हैं। सेवाएं अतिशीघ्र पुनः बहाल की जाएंगी।'}
          </p>
          <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium flex-wrap gap-2">
            <span>हेल्पलाइन (CMO मिलन सर, सोम-शुक्र): <strong>+91 97131 75838</strong> / <strong>+91-7392-243201</strong></span>
            <span>ई-मेल: <strong>cmomjhabua@mp.gov.in</strong></span>
          </div>
        </div>

        {/* Clean Officer Login Button without path mention */}
        <div className="pt-2 border-t border-slate-800/80">
          <Link 
            href="/admin" 
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md hover:border-slate-600"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>अधिकृत अधिकारी लॉगिन (Officer Portal)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
