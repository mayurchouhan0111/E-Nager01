'use client'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import DocumentChecklist from '@/components/DocumentChecklist'
import { FileText, Baby, Droplet, ArrowRight, Shield, Clock, CheckCircle2, AlertTriangle, ShieldAlert, ListChecks } from 'lucide-react'

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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-teal-200 border border-white/15 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              मध्य प्रदेश शासन - नगर पालिका परिषद झाबुआ
            </span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
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

        </div>

        {/* Official Document Checklist Section */}
        <div className="mt-12 sm:mt-16 max-w-6xl mx-auto">
          <DocumentChecklist defaultCategory="all" />
        </div>

        {/* Info Section */}
        <div className="mt-8 sm:mt-12 max-w-6xl mx-auto">
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
