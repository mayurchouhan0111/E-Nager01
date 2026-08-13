import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Baby, 
  Droplets, 
  Building2, 
  ShieldCheck, 
  FileCheck, 
  Headphones, 
  Lock, 
  PhoneCall, 
  Mail, 
  Clock, 
  Shield, 
  ChevronRight 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 font-sans mt-auto no-print print:hidden relative overflow-hidden">
      {/* Decorative Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 lg:pb-10 relative z-10">
        
        {/* TOP BRANDING & STATS HEADER (MOBILE & DESKTOP) */}
        <div className="pb-8 mb-8 border-b border-slate-800/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-md shrink-0">
                <img src="/mp-logo.png" alt="मध्य प्रदेश शासन" className="w-10 h-10 object-contain drop-shadow-sm" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-white text-base tracking-tight">नगर पालिका परिषद झाबुआ (म.प्र.)</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ई-सेवा पोर्टल
                  </span>
                </div>
                <p className="text-xs text-emerald-400/90 font-medium mt-0.5">Nagar Palika Parishad Jhabua, MP • Government Citizen Portal</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              जन्म-मृत्यु पंजीकरण अधिनियम 1969 एवं मध्य प्रदेश नगर पालिका अधिनियम के अंतर्गत प्राधिकृत डिजिटल नागरिक सेवा पोर्टल।
            </p>
          </div>
        </div>

        {/* MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">

          {/* CITIZEN SERVICES SECTION */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-emerald-500 rounded-full" />
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-emerald-400">
                नागरिक ऑनलाइन सेवाएं
              </h4>
            </div>
            
            {/* Mobile: 2-column card grid / Desktop: clean list */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5 pt-1">
              <Link 
                href="/death-certificate" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-emerald-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  मृत्यु प्रमाण पत्र
                </span>
              </Link>

              <Link 
                href="/birth-certificate" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-teal-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Baby className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">
                  जन्म प्रमाण पत्र
                </span>
              </Link>

              <Link 
                href="/water-connection" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-sky-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Droplets className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                  जल प्रदाय कनेक्शन
                </span>
              </Link>

              <Link 
                href="/no-dues-certificate" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-cyan-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors leading-tight">
                  नो ड्यूज प्रमाण पत्र (NOC)
                </span>
              </Link>
            </div>
          </div>

          {/* LEGAL & GOVERNANCE SECTION */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-purple-500 rounded-full" />
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-purple-400">
                कानूनी व प्राइवेसी अनुपालन
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5 pt-1">
              <Link 
                href="/privacy-policy" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-purple-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 transition-colors leading-tight">
                  DPDP नीति (Act 2023)
                </span>
              </Link>

              <Link 
                href="/terms" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors leading-tight">
                  सेवा की शर्तें & घोषणा
                </span>
              </Link>

              <Link 
                href="/grievance" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-amber-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Headphones className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors leading-tight">
                  शिकायत व नोडल अधिकारी
                </span>
              </Link>

              <Link 
                href="/admin" 
                className="group flex items-center gap-2.5 p-2.5 md:p-2 rounded-xl bg-slate-900/60 md:bg-transparent border border-slate-800/80 md:border-none hover:bg-slate-900 hover:border-slate-700 transition-all duration-200"
              >
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Lock className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                  अधिकारी लॉगिन (/admin)
                </span>
              </Link>
            </div>
          </div>

          {/* HELPDESK & CONTACT CARD (INTERACTIVE MOBILE HERO WIDGET) */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-cyan-500 rounded-full" />
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-cyan-400">
                संपर्क व हेल्पडेस्क (Helpdesk)
              </h4>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3.5">
              
              {/* Tap-to-Call Primary Action Pill */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-emerald-950/40 border border-emerald-500/25 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">मुख्य हेल्पलाइन (CMO मिलन सर)</div>
                    <div className="text-sm font-black text-white">+91 97131 75838</div>
                  </div>
                </div>
                <a 
                  href="tel:9713175838" 
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-900/40"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>कॉल करें</span>
                </a>
              </div>

              {/* Secondary Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-[11px]">कार्यालय: <a href="tel:+917392243201" className="font-bold text-white hover:underline">+91-7392-243201</a></span>
                </div>

                <a 
                  href="mailto:cmomjhabua@mp.gov.in" 
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-[11px] truncate text-slate-200">cmomjhabua@mp.gov.in</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  नगर पालिका कार्यालय, झाबुआ - 457661
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full text-[10px]">
                  <Clock className="w-3 h-3 text-amber-400" />
                  सोम-शुक्र (10:30 AM - 05:30 PM)
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & COMPLIANCE BAR */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div className="text-center sm:text-left text-[11px] leading-relaxed">
            © 2025-26 <span className="font-semibold text-slate-200">नगर पालिका परिषद झाबुआ (म.प्र.)</span> | Digital Citizen Service Portal
          </div>
          
          <div className="flex items-center flex-wrap justify-center gap-2 text-[10px]">
            <Link 
              href="/privacy-policy" 
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-emerald-400" />
              DPDP Act Compliant
            </Link>

            <Link 
              href="/terms" 
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              IT Act 2000
            </Link>

            <Link 
              href="/grievance" 
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              हेल्पडेस्क
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
