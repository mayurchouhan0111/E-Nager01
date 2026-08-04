'use client'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import { FileText, Baby, ArrowRight, Shield, Clock, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <ServiceHeader />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="space-y-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/20 backdrop-blur-md">
              🏛️ मध्य प्रदेश शासन - नगर पालिका परिषद झाबुआ
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              जन्म एवं मृत्यु प्रमाण पत्र<br />
              <span className="text-emerald-300">ऑनलाइन सेवा पोर्टल</span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
              नगर पालिका परिषद झाबुआ (म.प्र.) द्वारा संचालित डिजिटल सेवा पोर्टल। 
              अब घर बैठे अपने मृत्यु एवं जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन करें, 
              स्थिति ट्रैक करें एवं स्वीकृत प्रमाण पत्र डाउनलोड करें।
            </p>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 w-full">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">हमारी सेवाएँ (Our Services)</h2>
          <p className="text-sm text-slate-500 mt-2">अपनी आवश्यकता अनुसार सेवा चुनें</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          
          {/* Death Certificate Card */}
          <Link href="/death-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-200 mb-6 group-hover:scale-105 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                मृत्यु प्रमाण पत्र
              </h3>
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-3">
                Death Certificate Application
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                मृत्यु प्रमाण पत्र के लिए ऑनलाइन आवेदन करें। आवेदन की स्थिति ट्रैक करें एवं स्वीकृत प्रमाण पत्र डाउनलोड करें।
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ऑनलाइन आवेदन एवं ड्राफ्ट सेव</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>रियल-टाइम स्थिति ट्रैकिंग</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>सुरक्षित एवं गोपनीय</span>
                </div>
              </div>

              <div className="flex items-center text-emerald-700 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                आवेदन शुरू करें
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Birth Certificate Card */}
          <Link href="/birth-certificate" className="group">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 mb-6 group-hover:scale-105 transition-transform">
                <Baby className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                जन्म प्रमाण पत्र
              </h3>
              <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-3">
                Birth Certificate Application
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन करें। शीघ्र ही यह सेवा उपलब्ध होगी।
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>ऑनलाइन आवेदन (शीघ्र)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>त्वरित प्रमाणीकरण</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>डिजिटल रूप से सत्यापित</span>
                </div>
              </div>

              <div className="flex items-center text-blue-700 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                जल्द आ रहा है
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                <p className="font-semibold text-slate-800">आवेदन हेतु आवश्यक दस्तावेज:</p>
                <ul className="space-y-1 text-xs">
                  <li>• आवेदक का आधार कार्ड</li>
                  <li>• मृतक/शिशु का अस्पताल प्रमाण पत्र</li>
                  <li>• निवास पता प्रमाण</li>
                  <li>• पासपोर्ट साइज फोटो</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">सहायता हेतु संपर्क करें:</p>
                <ul className="space-y-1 text-xs">
                  <li>• नगर पालिका परिषद, झाबुआ</li>
                  <li>• जिला - झाबुआ, मध्य प्रदेश</li>
                  <li>• कार्यालय समय: सोमवार - शनिवार (10:30 - 17:30)</li>
                  <li>• ई-नगरपालिका पोर्टल</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} नगर पालिका परिषद झाबुआ (म.प्र.) | डिजिटल नागरिक सेवा पोर्टल
          </p>
        </div>
      </footer>
    </div>
  )
}
