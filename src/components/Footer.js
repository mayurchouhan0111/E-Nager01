import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 font-sans mt-auto no-print print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start pb-8 border-b border-slate-800/80">

          {/* BRANDING COL */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img src="/mp-logo.png" alt="मध्य प्रदेश शासन" className="w-10 h-10 object-contain drop-shadow-sm" />
              <div>
                <h3 className="font-extrabold text-white text-sm">कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)</h3>
                <p className="text-xs text-slate-400">मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              नागरिकों को पारदर्शी, तीव्र एवं डिजिटल सेवाएं प्रदान करने हेतु एकीकृत ई-नगर पालिका झाबुआ ऑनलाइन सेवा पोर्टल।
            </p>
          </div>

          {/* MAIN SERVICES COL */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-emerald-400">नागरिक ऑनलाइन सेवाएं</h4>
            <ul className="space-y-1.5 font-medium">
              <li>
                <Link href="/death-certificate" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  📋 मृत्यु प्रमाण पत्र (Form-6)
                </Link>
              </li>
              <li>
                <Link href="/birth-certificate" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  👶 जन्म प्रमाण पत्र (Form-5)
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
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-purple-400">शासकीय नियम व नीतियां</h4>
            <ul className="space-y-1.5 font-medium">
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  🛡️ DPDP प्राइवेसी नीति
                </Link>
              </li>
              <li>
                <Link href="/presentation" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  📊 SOP प्रेजेंटेशन
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  📢 जन शिकायत निवारण
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-slate-400 font-bold">
                  🔑 अधिकारी लॉगिन (/admin)
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT BAR — Static year, no JS Date() */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            &copy; 2025-26 नगर पालिका परिषद झाबुआ (म.प्र.) | सर्वाधिकार सुरक्षित।
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:underline">प्राइवेसी पॉलिसी</Link>
            <span>•</span>
            <Link href="/presentation" className="hover:underline">एसओपी गाइड</Link>
            <span>•</span>
            <Link href="/grievance" className="hover:underline">हेल्पडेस्क</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
