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
    <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100/70 backdrop-blur-lg text-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden select-none animate-fade-in">
      {/* Subtle Background Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
        <img src="/mp-logo.png" alt="" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="max-w-lg w-full bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center space-y-6 backdrop-blur-xl">
        {/* Official Header */}
        <div className="flex flex-col items-center space-y-3">
          <img 
            src="/mp-logo.png" 
            alt="मध्य प्रदेश शासन" 
            className="w-16 h-16 object-contain drop-shadow-md" 
          />
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग
            </p>
          </div>
        </div>

        {/* Maintenance Badge */}
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            पोर्टल तकनीकी एवं सुरक्षा अद्यतन (System Maintenance)
          </span>
        </div>

        {/* Official Notice Card */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-5 text-xs text-amber-950 space-y-3 text-left shadow-sm">
          <div className="font-extrabold text-amber-800 flex items-center gap-2 text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-amber-700 shrink-0" />
            <span>आधिकारिक सूचना (OFFICIAL NOTICE)</span>
          </div>
          <p className="leading-relaxed text-amber-950 text-xs sm:text-sm font-medium">
            {maintStatus.message || 'सुरक्षा एवं तकनीकी रखरखाव हेतु पोर्टल अस्थायी रूप से स्थगित है। शीघ्र सेवाएं पुनः शुरू की जाएंगी।'}
          </p>
          <div className="border-t border-amber-200/80 pt-2.5 flex flex-col gap-1.5 text-[11px] text-amber-900 font-medium">
            <span>हेल्पलाइन (CMO मिलन सर, सोम-शुक्र): <strong className="font-mono text-amber-950">+91 97131 75838</strong> / <strong className="font-mono text-amber-950">+91-7392-243201</strong></span>
            <span>ई-मेल: <strong className="font-mono text-amber-950">cmomjhabua@mp.gov.in</strong></span>
          </div>
        </div>

        {/* Officer Login Button */}
        <div className="pt-2 border-t border-slate-100">
          <Link 
            href="/admin" 
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 text-xs font-bold transition-all shadow-md hover:shadow-lg"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>अधिकृत अधिकारी लॉगिन (Officer Portal)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
