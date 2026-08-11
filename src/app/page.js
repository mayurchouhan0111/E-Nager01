'use client'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import DocumentChecklist from '@/components/DocumentChecklist'
import { FileText, Baby, Droplet, ShieldCheck, ArrowRight, Shield, Clock, CheckCircle2, AlertTriangle, ShieldAlert, ListChecks } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <ServiceHeader />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center gap-3">
              <img 
                src="/mp-logo.png" 
                alt="मध्य प्रदेश शासन" 
                className="w-16 h-16 object-contain drop-shadow-md shrink-0" 
              />
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-teal-200 border border-white/15 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                मध्य प्रदेश शासन - नगर पालिका परिषद झाबुआ
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              नगर पालिका नागरिक ई-सेवाएँ<br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent">जन्म, मृत्यु एवं जल कनेक्शन पोर्टल</span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
              नगर पालिका परिषद झाबुआ (म.प्र.) द्वारा संचालित डिजिटल सेवा पोर्टल। 
              अब घर बैठे अपने मृत्यु प्रमाण पत्र, जन्म प्रमाण पत्र एवं नए जल (नल) कनेक्शन के लिए ऑनलाइन आवेदन करें, 
              पावती पत्र एवं स्वीकृत प्रमाण पत्र डाउनलोड करें।
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="/death-certificate" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-all shadow-md">
                मृत्यु प्रमाण पत्र <span className="text-emerald-600">→</span>
              </a>
              <a href="/birth-certificate" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md">
                जन्म प्रमाण पत्र <span className="text-blue-200">→</span>
              </a>
              <a href="/water-connection" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-md">
                जल कनेक्शन आवेदन <span className="text-teal-200">→</span>
              </a>
              <a href="/no-dues-certificate" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-all shadow-md">
                नो ड्यूज प्रमाण पत्र <span className="text-violet-200">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Official Legal Responsibility & Hard Copy Submission Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-950 text-xs leading-relaxed font-medium">
          <div className="flex items-center gap-2 font-bold text-amber-900 shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>वैधानिक चेतावनी (Official Disclaimer):</span>
          </div>
          <p className="flex-1">
            समस्त प्रविष्टियाँ शासकीय रिकॉर्ड हेतु आधिकारिक हैं। यदि आवेदक द्वारा कोई असत्य जानकारी दर्ज की जाती है, तो उसके लिए आवेदक स्वयं जिम्मेदार रहेगा। फॉर्म भरने के पश्चात <strong>पावती पत्र (Hard Copy Application Letter)</strong> का प्रिंट निकाल कर <strong>नगर पालिका कार्यालय झाबुआ</strong> में मूल दस्तावेजों सहित भौतिक रूप से अनिवार्यतः जमा करें।
          </p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">हमारी ऑनलाइन नागरिक सेवाएँ</h2>
          <p className="text-sm text-slate-500 mt-2">अपनी आवश्यकता अनुसार नगर पालिका सेवा चुनें</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Death Certificate Card */}
          <Link href="/death-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 hover:border-emerald-200 transition-all duration-500 h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <FileText className="w-7 h-7 text-white" />
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
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>ऑनलाइन फॉर्म व Hard Copy पावती</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>दस्तावेज अपलोड व ट्रैकिंग</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-emerald-600" />
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <Baby className="w-7 h-7 text-white" />
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
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>ऑनलाइन फॉर्म व Hard Copy पावती</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>दस्तावेज फोटो अपलोड व स्थिति ट्रैकिंग</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-blue-600" />
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-200 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Droplet className="w-7 h-7 text-white" />
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
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    </div>
                    <span>आधिकारिक नल कनेक्शन आवेदन पत्र</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-teal-600" />
                    </div>
                    <span>शपथ पत्र व संपत्ति कर रसीद अपलोड</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Shield className="w-3 h-3 text-teal-600" />
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <ShieldCheck className="w-7 h-7 text-white" />
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
                      <Clock className="w-3 h-3 text-violet-600" />
                    </div>
                    <span>तत्काल डिजिटल प्रमाण पत्र</span>
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
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs">📞</span> नगर पालिका परिषद झाबुआ — आधिकारिक विभागीय संपर्क सूत्र (Official Contact Directory)
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">MP e-Nagar Helpline</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-emerald-300 transition-all">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">नोडल प्रशासक (Nodal Administrator)</span>
                <p className="font-extrabold text-slate-900 text-sm">मुख्य नगर पालिका अधिकारी (CMO)</p>
                <p className="text-xs text-slate-500 font-medium">समस्त नगर पालिका सेवाएँ व शिकायत निवारण</p>
                <a href="tel:9713175838" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition mt-1">
                  📞 9713175838
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-teal-300 transition-all">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">जल कर / नल कनेक्शन प्रभारी</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री अय्यूब खान</p>
                <p className="text-xs text-slate-500 font-medium">Water Tax & New Connection Official</p>
                <a href="tel:8224083390" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-teal-800 bg-teal-100 hover:bg-teal-200 px-3 py-1.5 rounded-xl border border-teal-300 transition mt-1">
                  📞 8224083390
                </a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 hover:border-blue-300 transition-all">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">जन्म एवं मृत्यु पंजीयन प्रभारी</span>
                <p className="font-extrabold text-slate-900 text-sm">श्री अरविंद बुंदेला</p>
                <p className="text-xs text-slate-500 font-medium">Birth & Death Registration Official</p>
                <a href="tel:9993177917" className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-300 transition mt-1">
                  📞 9993177917
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
