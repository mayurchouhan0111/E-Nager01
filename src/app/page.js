'use client'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import { FileText, Baby, ArrowRight, Shield, Clock, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <ServiceHeader />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="space-y-5 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/15 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              मध्य प्रदेश शासन - नगर पालिका परिषद झाबुआ
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              जन्म एवं मृत्यु प्रमाण पत्र<br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">ऑनलाइन सेवा पोर्टल</span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
              नगर पालिका परिषद झाबुआ (म.प्र.) द्वारा संचालित डिजिटल सेवा पोर्टल। 
              अब घर बैठे अपने मृत्यु एवं जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन करें, 
              पावती पत्र एवं प्रमाण पत्र डाउनलोड करें।
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="/death-certificate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-all hover:shadow-lg hover:shadow-emerald-900/20">
                मृत्यु प्रमाण पत्र आवेदन करें
                <span className="text-emerald-600">→</span>
              </a>
              <a href="/birth-certificate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30">
                जन्म प्रमाण पत्र आवेदन करें
                <span className="text-blue-200">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">हमारी ऑनलाइन सेवाएँ</h2>
          <p className="text-sm text-slate-500 mt-2">अपनी आवश्यकता अनुसार सेवा चुनें</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          
          {/* Death Certificate Card */}
          <Link href="/death-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 hover:border-emerald-200 transition-all duration-500 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  मृत्यु प्रमाण पत्र ऑनलाइन आवेदन
                </h3>
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-3">
                  Death Certificate Service
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  मृत्यु प्रमाण पत्र हेतु ऑनलाइन आवेदन करें, दस्तावेज फोटो अपलोड करें, पावती पत्र प्रिंट करें एवं स्थिति ट्रैक करें।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>ऑनलाइन आवेदन व पावती पत्र (Hard Copy Letter)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>दस्तावेज अपलोड व स्थिति ट्रैकिंग</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>डिजिटल प्रमाण पत्र डाउनलोड</span>
                  </div>
                </div>

                <div className="flex items-center text-emerald-700 font-bold text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                  आवेदन शुरू करें
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

          {/* Birth Certificate Card */}
          <Link href="/birth-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-100 hover:border-blue-200 transition-all duration-500 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <Baby className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  जन्म प्रमाण पत्र ऑनलाइन आवेदन
                </h3>
                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-3">
                  Birth Certificate Service
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  जन्म प्रमाण पत्र हेतु ऑनलाइन आवेदन करें, आवश्यक दस्तावेज अपलोड करें, पावती पत्र प्रिंट करें एवं स्थिति ट्रैक करें।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>ऑनलाइन आवेदन व पावती पत्र (Hard Copy Letter)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>दस्तावेज फोटो अपलोड व स्थिति ट्रैकिंग</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>डिजिटल रूप से प्रमाणित प्रमाण पत्र</span>
                  </div>
                </div>

                <div className="flex items-center text-blue-700 font-bold text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                  आवेदन शुरू करें
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Info Section */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-lg">ℹ️</span> महत्वपूर्ण सूचना (Important Information)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">आवेदन हेतु आवश्यक दस्तावेज़ (Required Documents):</p>
                <ul className="space-y-1 text-xs">
                  <li>• आवेदक का आधार कार्ड (Applicant's Aadhaar Card)</li>
                  <li>• अस्पताल मृत्यु / जन्म प्रमाण पर्ची (Hospital Slip)</li>
                  <li>• निवास पता प्रमाण (Address Proof)</li>
                  <li>• जनरेटेड भौतिक पावती पत्र (Printed Application Letter)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">सहायता हेतु संपर्क करें (Contact for Help):</p>
                <ul className="space-y-1 text-xs">
                  <li>• नगर पालिका परिषद, झाबुआ (Nagar Palika Parishad, Jhabua)</li>
                  <li>• जिला - झाबुआ, मध्य प्रदेश (District - Jhabua, MP)</li>
                  <li>• कार्यालय समय: सोमवार - शनिवार (10:30 - 17:30)</li>
                  <li>• ई-नगरपालिका नागरिक सेवा केंद्र</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">ई</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">नगर पालिका परिषद झाबुआ (म.प्र.)</p>
                <p className="text-[10px] text-slate-400">Nagar Palika Parishad Jhabua, MP</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} डिजिटल नागरिक सेवा पोर्टल | Digital Citizen Service Portal
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
