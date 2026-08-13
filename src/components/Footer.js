import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 font-sans mt-auto no-print print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">

          {/* BRANDING COL */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/mp-logo.png" alt="मध्य प्रदेश शासन" className="w-10 h-10 object-contain drop-shadow-sm" />
              <div>
                <h3 className="font-extrabold text-white text-sm">नगर पालिका परिषद झाबुआ (म.प्र.)</h3>
                <p className="text-[10px] text-emerald-400 font-semibold">Nagar Palika Parishad Jhabua, MP</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              जन्म-मृत्यु पंजीकरण अधिनियम 1969 एवं मध्य प्रदेश नगर पालिका अधिनियम के अंतर्गत प्राधिकृत डिजिटल नागरिक सेवा पोर्टल।
            </p>
          </div>

          {/* MAIN SERVICES COL */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-emerald-400">नागरिक ऑनलाइन सेवाएं</h4>
            <ul className="space-y-1.5 font-medium">
              <li>
                <Link href="/death-certificate" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  📋 मृत्यु प्रमाण पत्र
                </Link>
              </li>
              <li>
                <Link href="/birth-certificate" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  👶 जन्म प्रमाण पत्र
                </Link>
              </li>
              <li>
                <Link href="/water-connection" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  💧 जल प्रदाय कनेक्शन
                </Link>
              </li>
              <li>
                <Link href="/no-dues-certificate" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  🏛️ नो ड्यूज प्रमाण पत्र (NOC)
                </Link>
              </li>
            </ul>
          </div>

          {/* GOVERNANCE & POLICY COL */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-purple-400">कानूनी व प्राइवेसी अनुपालन</h4>
            <ul className="space-y-1.5 font-medium">
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  🛡️ DPDP प्राइवेसी नीति (DPDP Act 2023)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  📜 सेवा की शर्तें व वैधानिक घोषणा
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  🏢 शिकायत निवारण व नोडल अधिकारी
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-slate-400 font-bold">
                  🔑 अधिकारी लॉगिन (/admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* HELPDESK & CONTACT COL */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-cyan-400">संपर्क व हेल्पलाइन (Helpdesk)</h4>
            <p className="text-slate-300 text-[11px]">नगर पालिका परिषद कार्यालय, झाबुआ (म.प्र.) - 457661</p>
            <p className="text-slate-300 text-[11px]">हेल्पलाइन (CMO मिलन सर): <a href="tel:9713175838" className="font-bold text-emerald-400 hover:underline">+91 97131 75838</a></p>
            <p className="text-slate-300 text-[11px]">कार्यालय हेल्पलाइन: +91-7392-243201</p>
            <p className="text-slate-300 text-[11px]">ई-मेल: cmomjhabua@mp.gov.in</p>
            <p className="text-slate-400 text-[10px] pt-1">समय: सोमवार से शुक्रवार (10:30 AM - 05:30 PM)</p>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            &copy; 2025-26 नगर पालिका परिषद झाबुआ (म.प्र.) | Digital Citizen Service Portal
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy-policy" className="hover:underline">DPDP Act Compliant</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">IT Act 2000</Link>
            <span>•</span>
            <Link href="/grievance" className="hover:underline">हेल्पडेस्क</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
