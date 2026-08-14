'use client'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import DocumentChecklist from '@/components/DocumentChecklist'
import { FileText, Baby, Droplet, ShieldCheck, ArrowRight, Shield, Clock, CheckCircle2, AlertTriangle, ShieldAlert, ListChecks, Droplets, FileCheck, MessageSquare, LayoutGrid, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <ServiceHeader />

      {/* Hero Banner with Full-Width Split Composition (Dark Emerald Content Left, Building Photo Right) */}
      <div className="relative w-full bg-[#013524] overflow-hidden min-h-[520px] sm:min-h-[580px] flex items-center">
        
        {/* Background Nagarpalika Building Image - Positioned on the right */}
        <div 
          className="absolute inset-y-0 right-0 w-full lg:w-[65%] xl:w-[60%] bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/assets/nagarpalika.png')" }}
        >
          {/* Mobile Overlay Fallback */}
          <div className="absolute inset-0 bg-slate-950/60 lg:hidden z-0" />
        </div>

        {/* Desktop Left Solid Green Content Area */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[42%] bg-[#013524] z-0 hidden lg:block" />
        
        {/* Desktop Center Smooth Gradient Feather Blend (No sharp lines or dark center opacity) */}
        <div className="absolute inset-y-0 left-[42%] w-[23%] bg-gradient-to-r from-[#013524] to-transparent z-0 hidden lg:block" />



        {/* Hero Content Container */}
        <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 z-20">
          <div className="max-w-2xl space-y-6">
            
            {/* Top Logo Badge + Tagline Pill */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1.5 shadow-2xl flex items-center justify-center shrink-0 border-2 border-white/90">
                <img 
                  src="/mp-logo.png" 
                  alt="मध्य प्रदेश शासन" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#044a37]/95 border border-[#0d7d5f] text-white text-xs sm:text-sm font-bold shadow-md backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-[#20e3b2] shrink-0" />
                <span>स्वच्छ झाबुआ • बेहतर भविष्य</span>
              </div>
            </div>

            {/* Main Headlines */}
            <div className="space-y-1" style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}>
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-[1.18] drop-shadow-xs">
                नगर पालिका नागरिक ई-सेवाएं
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-[#20e3b2] tracking-tight leading-[1.18] drop-shadow-xs">
                जन्म, मृत्यु एवं जल कनेक्शन पोर्टल
              </h2>
            </div>

            {/* Description Paragraph */}
            <div className="text-slate-100 text-xs sm:text-sm leading-relaxed space-y-1 font-medium max-w-xl text-opacity-95" style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}>
              <p>नगर पालिका परिषद झाबुआ (म.प्र.) द्वारा संचालित डिजिटल सेवा पोर्टल।</p>
              <p>अब घर बैठे अपने महत्वपूर्ण प्रमाण पत्र, जन्म प्रमाण पत्र, मृत्यु प्रमाण पत्र</p>
              <p>एवं नल कनेक्शन के लिए ऑनलाइन आवेदन करें,</p>
              <p>पावती पत्र एवं स्वीकृत प्रमाण पत्र डाउनलोड करें।</p>
            </div>

            {/* 4 Action Buttons in UNIFORM 2x2 Grid on Mobile, Horizontal Row on Desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-3 max-w-2xl w-full">
              {/* Button 1: Death Cert */}
              <Link 
                href="/death-certificate" 
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-3.5 sm:px-4.5 py-2.5 rounded-full bg-white text-[#013524] font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-[#013524] shrink-0 animate-pulse" />
                  <span className="truncate">मृत्यु प्रमाण पत्र</span>
                </div>
                <span className="text-[#013524] font-bold shrink-0">&rarr;</span>
              </Link>

              {/* Button 2: Birth Cert */}
              <Link 
                href="/birth-certificate" 
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-3.5 sm:px-4.5 py-2.5 rounded-full bg-[#0088cc] hover:bg-[#007cbd] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Baby className="w-4 h-4 text-white shrink-0 animate-bounce" />
                  <span className="truncate">जन्म प्रमाण पत्र</span>
                </div>
                <span className="text-sky-100 font-bold shrink-0">&rarr;</span>
              </Link>

              {/* Button 3: Water Conn */}
              <Link 
                href="/water-connection" 
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-3.5 sm:px-4.5 py-2.5 rounded-full bg-[#00a884] hover:bg-[#009676] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Droplets className="w-4 h-4 text-white shrink-0 animate-pulse" />
                  <span className="truncate">जल कनेक्शन</span>
                </div>
                <span className="text-teal-100 font-bold shrink-0">&rarr;</span>
              </Link>

              {/* Button 4: My Requests */}
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-track-modal'));
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2 px-3.5 sm:px-4.5 py-2.5 rounded-full bg-[#5c54e5] hover:bg-[#4e45d9] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <LayoutGrid className="w-4 h-4 text-white shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="truncate">अनुरोध देखें</span>
                </div>
                <span className="text-indigo-100 font-bold shrink-0">&rarr;</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Bottom Floating Text Overlay Centered on Nagarpalika Building Image */}
        <div className="absolute bottom-6 right-0 w-full lg:w-[58%] xl:w-[55%] flex flex-col items-center text-center z-20 hidden sm:flex px-4 pointer-events-none">
          <h2 
            className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] tracking-wide"
            style={{ fontFamily: "'Tiro Devanagari Hindi', 'Rozha One', 'Noto Sans Devanagari', serif" }}
          >
            झाबुआ नगर पालिका
          </h2>
          <div className="flex items-center justify-center gap-3 my-1.5 w-full max-w-md">
            <span className="h-[2px] flex-1 bg-[#20e3b2] rounded-full shadow-sm" />
            <span 
              className="text-[#20e3b2] font-extrabold text-2xl sm:text-3xl tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] shrink-0"
              style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}
            >
              आपके द्वारा
            </span>
            <span className="h-[2px] flex-1 bg-[#20e3b2] rounded-full shadow-sm" />
          </div>
          <p 
            className="text-slate-100 font-semibold text-xs sm:text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] mt-1 max-w-lg tracking-wide"
            style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}
          >
            नागरिक सेवाओं को सरल, पारदर्शी और सुलभ बनाना हमारा संकल्प है।
          </p>
        </div>
      </div>

      {/* Official Legal Disclaimer Strip matching reference image (Commented out) */}
      {/* 
      <div className="bg-[#FAF7F2] border-t border-b border-amber-200/70 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-slate-700 text-xs leading-relaxed font-medium">
          <div className="flex items-center gap-2 font-extrabold text-[#c25e00] shrink-0">
            <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center border border-orange-300 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-[#c25e00]" />
            </div>
            <span>वैधानिक चेतावनी (Official Disclaimer)</span>
          </div>
          <div className="flex-1 w-full">
            <p className="text-slate-700 font-medium block text-xs leading-relaxed">
              समस्त नागरिकों, साथियों एवं संबंधितों से विनम्र अनुरोध है कि आवेदन द्वारा कोई असत्य जानकारी दर्ज की जाती है, तो उसके लिए आवेदककर्ता जिम्मेदार होगा।<br className="hidden sm:block" />
              समस्त जानकारी व आवेदन विभागीय जाँच एवं सत्यापन के अधीन है।
            </p>
          </div>
          <div className="shrink-0 hidden md:block">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-[#c25e00] flex items-center justify-center shadow-xs">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Service Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            <span>हमारी ऑनलाइन नागरिक सेवाएँ</span>
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          </h2>
          <p className="text-sm text-slate-500 mt-2">अपनी आवश्यकता अनुसार नगर पालिका सेवा चुनें</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Death Certificate Card */}
          <Link href="/death-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 hover:border-emerald-200 transition-all duration-500 h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 transform-gpu">
                  <FileText className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  मृत्यु प्रमाण पत्र ऑनलाइन आवेदन
                </h3>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-3">
                  Death Certificate Service
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  मृत्यु प्रमाण पत्र हेतु ऑनलाइन आवेदन करें, दस्तावेज फोटो अपलोड करें, पावती पत्र प्रिंट करें एवं स्थिति ट्रैक करें।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 animate-pulse" />
                    </div>
                    <span>ऑनलाइन फॉर्म व Hard Copy पावती</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600 animate-pulse" />
                    </div>
                    <span>दस्तावेज अपलोड व ट्रैकिंग</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-emerald-600 animate-pulse" />
                    </div>
                    <span>डिजिटल प्रमाण पत्र डाउनलोड</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-emerald-700 font-bold text-xs group-hover:gap-2 gap-1.5 transition-all duration-300 pt-2 border-t border-slate-100">
                आवेदन शुरू करें
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* Birth Certificate Card */}
          <Link href="/birth-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:shadow-blue-100 hover:border-blue-200 transition-all duration-500 h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 transform-gpu">
                  <Baby className="w-7 h-7 text-white animate-bounce" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  जन्म प्रमाण पत्र ऑनलाइन आवेदन
                </h3>
                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-3">
                  Birth Certificate Service
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  जन्म प्रमाण पत्र हेतु ऑनलाइन आवेदन करें, आवश्यक दस्तावेज अपलोड करें, पावती पत्र प्रिंट करें एवं स्थिति ट्रैक करें।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-600 animate-pulse" />
                    </div>
                    <span>ऑनलाइन फॉर्म व Hard Copy पावती</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
                    </div>
                    <span>दस्तावेज फोटो अपलोड व स्थिति ट्रैकिंग</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-blue-600 animate-pulse" />
                    </div>
                    <span>डिजिटल रूप से प्रमाणित प्रमाण पत्र</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-blue-700 font-bold text-xs group-hover:gap-2 gap-1.5 transition-all duration-300 pt-2 border-t border-slate-100">
                आवेदन शुरू करें
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* Water Connection Card */}
          <Link href="/water-connection" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:shadow-teal-100 hover:border-teal-200 transition-all duration-500 h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-200 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 transform-gpu">
                  <Droplet className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  जल (नल) कनेक्शन ऑनलाइन आवेदन
                </h3>
                <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider mb-3">
                  Water Connection Service
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  नए नल कनेक्शन हेतु आधिकारिक ऑनलाइन आवेदन प्रस्तुत करें, नोटरी शपथ पत्र व दस्तावेज अपलोड करें तथा स्वीकृति आदेश प्राप्त करें।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-teal-600 animate-pulse" />
                    </div>
                    <span>आधिकारिक नल कनेक्शन आवेदन पत्र</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-teal-600 animate-pulse" />
                    </div>
                    <span>शपथ पत्र व संपत्ति कर रसीद अपलोड</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-teal-600 animate-pulse" />
                    </div>
                    <span>जल कनेक्शन स्वीकृति पत्र डाउनलोड</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-teal-700 font-bold text-xs group-hover:gap-2 gap-1.5 transition-all duration-300 pt-2 border-t border-slate-100">
                आवेदन शुरू करें
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* No Dues Certificate Card */}
          <Link href="/no-dues-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:shadow-violet-100 hover:border-violet-200 transition-all duration-500 h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 transform-gpu">
                  <ShieldCheck className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  नो ड्यूज प्रमाण पत्र
                </h3>
                <p className="text-[10px] text-violet-700 font-bold uppercase tracking-wider mb-3">
                  No Dues Certificate (NOC)
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  संपत्ति कर एवं जल कर का कोई बकाया नहीं है इसका आधिकारिक प्रमाण पत्र प्राप्त करें। 100% डिजिटल सेवा।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-violet-600" />
                    </div>
                    <span>ऑनलाइन आवेदन व भुगतान रसीद</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-violet-600" />
                    </div>
                    <span>100% डिजिटल - कार्यालय जाने की आवश्यकता नहीं</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-violet-700 font-bold text-xs group-hover:gap-2 gap-1.5 transition-all duration-300 pt-2 border-t border-slate-100">
                आवेदन शुरू करें
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </Link>

        </div>

        {/* Official Document Checklist Section */}
        <div className="mt-12 sm:mt-16 max-w-6xl mx-auto">
          <DocumentChecklist defaultCategory="all" />
        </div>

        {/* Info & Official Contact Directory Section */}
        <div className="mt-8 sm:mt-12 max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center justify-center">📞</span> नगर पालिका परिषद झाबुआ — आधिकारिक विभागीय संपर्क सूत्र (Official Contact Directory)
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">MP e-Nagar Helpline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-emerald-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">नोडल प्रशासक (Nodal Administrator)</span>
                <p className="font-extrabold text-slate-900 text-sm">मुख्य नगर पालिका अधिकारी (CMO)</p>
                <p className="text-xs text-slate-500 font-medium">समस्त नगर पालिका सेवाएँ व शिकायत निवारण</p>
                <a href="tel:9713175838" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition-all duration-200 hover:scale-105 mt-1">
                  <span className="animate-pulse">📞</span> 9713175838
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-purple-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">राजस्व शाखा प्रभारी (नो ड्यूज NOC)</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री प्रेमसिंह वसुनिया</p>
                <p className="text-xs text-slate-500 font-medium">संपत्ति कर एवं नो ड्यूज एनओसी प्रभारी</p>
                <a href="tel:9424032601" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl border border-purple-300 transition-all duration-200 hover:scale-105 mt-1">
                  <span className="animate-pulse">📞</span> 9424032601
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-teal-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">जल कर / नल कनेक्शन प्रभारी</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री अय्यूब खान</p>
                <p className="text-xs text-slate-500 font-medium">Water Tax & New Connection Official</p>
                <a href="tel:8224083390" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-teal-800 bg-teal-100 hover:bg-teal-200 px-3 py-1.5 rounded-xl border border-teal-300 transition-all duration-200 hover:scale-105 mt-1">
                  <span className="animate-pulse">📞</span> 8224083390
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-blue-300 transition-all group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">जन्म एवं मृत्यु पंजीयन प्रभारी</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री अरविंद बुंदेला</p>
                <p className="text-xs text-slate-500 font-medium">Birth & Death Registration Official</p>
                <a href="tel:9993177917" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-300 transition-all duration-200 hover:scale-105 mt-1">
                  <span className="animate-pulse">📞</span> 9993177917
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
