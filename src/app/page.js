'use client'
import { useState } from 'react'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import DocumentChecklist from '@/components/DocumentChecklist'
import { 
  FileText, Baby, Droplet, ShieldCheck, ArrowRight, Shield, Clock, 
  CheckCircle2, AlertTriangle, ShieldAlert, ListChecks, Droplets, 
  FileCheck, MessageSquare, LayoutGrid, Sparkles, Search, Check, 
  Download, Upload, HelpCircle, Phone, ArrowUpRight
} from 'lucide-react'

export default function HomePage() {
  const [trackId, setTrackId] = useState('')

  const handleTrackSubmit = (e) => {
    e.preventDefault()
    if (!trackId.trim()) return
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-track-modal', { detail: { search: trackId.trim() } }))
    }
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col antialiased">
      <ServiceHeader />

      {/* ── 1. Hero Banner with Deep Obsidian Emerald & Nagarpalika Facade Integration ── */}
      <div className="relative w-full bg-[#031c14] overflow-hidden min-h-[540px] sm:min-h-[590px] flex items-center border-b border-[#0d3b2c]">
        
        {/* Background Nagarpalika Building Image (Preserved exactly) */}
        <div 
          className="absolute inset-y-0 right-0 w-full lg:w-[65%] xl:w-[60%] bg-cover bg-center bg-no-repeat z-0 transition-transform duration-1000"
          style={{ backgroundImage: "url('/assets/nagarpalika.png')" }}
        >
          {/* Mobile Overlay Fallback */}
          <div className="absolute inset-0 bg-[#031c14]/85 lg:hidden z-0" />
        </div>

        {/* Desktop Left Solid Obsidian Pine Block */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[44%] bg-[#031c14] z-0 hidden lg:block" />
        
        {/* Desktop Multi-Stop Smooth Feather Gradient Mask into Photo */}
        <div className="absolute inset-y-0 left-[44%] w-[26%] bg-gradient-to-r from-[#031c14] via-[#031c14]/90 to-transparent z-0 hidden lg:block" />

        {/* Ambient Glow Element */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 z-20">
          <div className="max-w-2xl space-y-6">
            
            {/* Top State Insignia & Tagline Chip */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 p-2 shadow-2xl flex items-center justify-center shrink-0 border border-white/80 backdrop-blur-md">
                <img 
                  src="/mp-logo.png" 
                  alt="मध्य प्रदेश शासन" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-semibold shadow-inner backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-[#20e3b2] shrink-0" />
                <span>मध्य प्रदेश शासन • नगर पालिका परिषद झाबुआ</span>
              </div>
            </div>

            {/* Main Headlines with High-Legibility Devanagari */}
            <div className="space-y-1.5" style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}>
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-[1.18] drop-shadow-sm">
                नागरिक ई-सेवाएं पोर्टल
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-[#20e3b2] tracking-tight leading-[1.18]">
                जन्म, मृत्यु, जल कनेक्शन एवं एनओसी
              </h2>
            </div>

            {/* Subtitle Description */}
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal max-w-xl text-opacity-90" style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}>
              घर बैठे बिना कार्यालय जाए आवश्यक प्रमाण पत्रों के लिए ऑनलाइन आवेदन प्रस्तुत करें, 
              पावती रसीद प्राप्त करें और डिजिटल रूप से हस्ताक्षरित प्रमाण पत्र डाउनलोड करें।
            </p>

            {/* 4 Action Pills in 2x2 on mobile, row on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-2 max-w-2xl w-full">
              {/* Button 1: Death Cert */}
              <Link 
                href="/death-certificate" 
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#031c14] font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span className="truncate">मृत्यु प्रमाण पत्र</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              </Link>

              {/* Button 2: Birth Cert */}
              <Link 
                href="/birth-certificate" 
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Baby className="w-4 h-4 text-white shrink-0" />
                  <span className="truncate">जन्म प्रमाण पत्र</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
              </Link>

              {/* Button 3: Water Conn */}
              <Link 
                href="/water-connection" 
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full bg-[#0088cc] hover:bg-[#007cbd] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Droplet className="w-4 h-4 text-white shrink-0" />
                  <span className="truncate">जल कनेक्शन</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sky-100 shrink-0" />
              </Link>

              {/* Button 4: No Dues */}
              <Link 
                href="/no-dues-certificate" 
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full bg-[#5c54e5] hover:bg-[#4e45d9] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                  <span className="truncate">नो ड्यूज (NOC)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-100 shrink-0" />
              </Link>
            </div>

          </div>
        </div>

        {/* Right Floating Badge Overlay Centered on Nagarpalika Building Image */}
        <div className="absolute bottom-6 right-0 w-full lg:w-[56%] xl:w-[54%] flex flex-col items-center text-center z-20 hidden sm:flex px-4 pointer-events-none">
          <div className="bg-[#031c14]/75 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-emerald-500/20 shadow-2xl">
            <h2 
              className="text-2xl sm:text-3xl font-black text-white tracking-wide"
              style={{ fontFamily: "'Tiro Devanagari Hindi', 'Rozha One', 'Noto Sans Devanagari', serif" }}
            >
              झाबुआ नगर पालिका परिषद
            </h2>
            <div className="flex items-center justify-center gap-2 my-1">
              <span className="h-[1px] w-12 bg-[#20e3b2]" />
              <span className="text-[#20e3b2] font-bold text-sm tracking-wider uppercase">नागरिक सेवा केंद्र</span>
              <span className="h-[1px] w-12 bg-[#20e3b2]" />
            </div>
            <p className="text-slate-200 text-xs font-medium">
              पारदर्शी, समयबद्ध एवं सुलभ ऑनलाइन नागरिक सेवाएं
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Floating Quick-Tracker Bar ── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 -mt-8 relative z-30">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/90 p-3.5 sm:p-4.5 backdrop-blur-md">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-2 text-slate-800 font-bold text-sm shrink-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <Search className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-black text-slate-900">आवेदन स्थिति जांचें</span>
                <span className="text-[11px] text-slate-500 font-normal">Track Application Status</span>
              </div>
            </div>

            <div className="flex-1 relative">
              <input 
                type="text" 
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="अपना आवेदन क्रमांक दर्ज करें (उदा. DC-1738..., BC-..., WC-...)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-slate-50/60"
              />
            </div>

            <button 
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#031c14] hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer min-h-[42px]"
            >
              <span>स्थिति खोजें</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </form>
        </div>
      </div>

      {/* ── 3. Citizen 4-Step Journey Guide ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4 w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              सरल एवं पारदर्शी प्रक्रिया
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              केवल 4 चरणों में प्रमाणपत्र प्राप्त करें
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">ऑनलाइन फॉर्म भरें</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  संबंधित सेवा का चयन कर आवेदक एवं विवरण दर्ज करें।
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">दस्तावेज अपलोड</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  आधार, शपथ पत्र व आवश्यक प्रमाण पत्र मोबाइल से अपलोड करें।
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">डिजिटल पावती रसीद</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  तुरंत आवेदन क्रमांक के साथ वैध डिजिटल पावती डाउनलोड करें।
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                4
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">प्रमाण पत्र डाउनलोड</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  अधिकारी द्वारा अनुमोदन उपरांत अधिकृत प्रमाण पत्र डाउनलोड करें।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Main Citizen Services Grid (Modernized Cards with SLA Badges) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ई-नगर पालिका नागरिक पोर्टल</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            उपलब्ध ऑनलाइन नागरिक सेवाएं
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            सभी सेवाएं समयबद्ध नागरिक सेवा गारंटी अधिनियम के अंतर्गत संचालित हैं।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          
          {/* Card 1: Death Certificate */}
          <Link href="/death-certificate" className="group flex">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between w-full relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                    ⏱️ 3 से 7 कार्यदिवस
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                  मृत्यु प्रमाण पत्र
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Death Certificate
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  मृत्यु पंजीयन, आवश्यक दस्तावेज अपलोड, पावती पत्र एवं डिजिटल प्रमाण पत्र जारीकरण।
                </p>

                <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                    <span>हॉस्पिटल पर्ची / श्मशान पावती</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                    <span>मृतक व आवेदक का आधार कार्ड</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>आवेदन शुरू करें</span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 group-hover:bg-emerald-800 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Birth Certificate */}
          <Link href="/birth-certificate" className="group flex">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between w-full relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    <Baby className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full">
                    ⏱️ 3 से 7 कार्यदिवस
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  जन्म प्रमाण पत्र
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Birth Certificate
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  नवजात शिशु का जन्म पंजीयन, अस्पताल डिस्चार्ज पर्ची अपलोड व पावती पत्र।
                </p>

                <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>अस्पताल की डिस्चार्ज पर्ची</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>माता-पिता का आधार कार्ड</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>आवेदन शुरू करें</span>
                <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Water Connection */}
          <Link href="/water-connection" className="group flex">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between w-full relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
                    <Droplet className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full">
                    ⏱️ 7 से 15 कार्यदिवस
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                  जल (नल) कनेक्शन
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Water Supply Connection
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  घरेलू या व्यावसायिक नल कनेक्शन हेतु नया आवेदन, शपथ पत्र व स्थल स्वीकृति।
                </p>

                <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>संपत्ति कर / रजिस्ट्री दस्तावेज</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>नोटरी शपथ पत्र एवं आधार</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>आवेदन शुरू करें</span>
                <div className="w-7 h-7 rounded-full bg-teal-50 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 4: No Dues Certificate */}
          <Link href="/no-dues-certificate" className="group flex">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between w-full relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-violet-700 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-violet-800 bg-violet-50 border border-violet-200/80 px-2.5 py-1 rounded-full">
                    ⏱️ 1 से 3 कार्यदिवस
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-violet-700 transition-colors">
                  नो ड्यूज (NOC) प्रमाण पत्र
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  No Dues Certificate
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  संपत्ति एवं जल कर का कोई बकाया न होने का आधिकारिक अनापत्ति प्रमाण पत्र।
                </p>

                <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>अंतिम कर भुगतान रसीद</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>संपत्ति धारक का आधार कार्ड</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-700">
                <span>आवेदन शुरू करें</span>
                <div className="w-7 h-7 rounded-full bg-violet-50 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* ── 5. Document Checklist Component (Preserved) ── */}
        <div className="mt-12 sm:mt-16 max-w-6xl mx-auto">
          <DocumentChecklist defaultCategory="all" />
        </div>

        {/* ── 6. Official Contact Directory Section ── */}
        <div className="mt-8 sm:mt-12 max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center justify-center">📞</span>
                नगर पालिका परिषद झाबुआ — आधिकारिक विभागीय संपर्क सूत्र
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">प्रातः 10:00 से सायं 5:30</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-emerald-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">नोडल प्रशासक (Nodal Officer)</span>
                <p className="font-extrabold text-slate-900 text-sm">मुख्य नगर पालिका अधिकारी (CMO)</p>
                <p className="text-xs text-slate-500 font-medium">समस्त नगर पालिका सेवाएँ व निगरानी</p>
                <a href="tel:9713175838" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition-all duration-200 mt-1">
                  <span>📞</span> 9713175838
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-purple-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">राजस्व शाखा प्रभारी</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री प्रेमसिंह वसुनिया</p>
                <p className="text-xs text-slate-500 font-medium">संपत्ति कर एवं नो ड्यूज एनओसी</p>
                <a href="tel:9424032601" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl border border-purple-300 transition-all duration-200 mt-1">
                  <span>📞</span> 9424032601
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-teal-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">जल कर / नल कनेक्शन</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री अय्यूब खान</p>
                <p className="text-xs text-slate-500 font-medium">Water Supply & Pipeline Incharge</p>
                <a href="tel:8224083390" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-teal-800 bg-teal-100 hover:bg-teal-200 px-3 py-1.5 rounded-xl border border-teal-300 transition-all duration-200 mt-1">
                  <span>📞</span> 8224083390
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-blue-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">जन्म एवं मृत्यु पंजीयन</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री अरविंद बुंदेला</p>
                <p className="text-xs text-slate-500 font-medium">Civil Registration & Issuance</p>
                <a href="tel:9993177917" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-300 transition-all duration-200 mt-1">
                  <span>📞</span> 9993177917
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
