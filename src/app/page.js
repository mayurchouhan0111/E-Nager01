'use client'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import { FileText, Baby, ArrowRight, Shield, Clock, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "झाबुआ में ऑनलाइन मृत्यु प्रमाण पत्र कैसे बनाएं? (How to apply for death certificate in Jhabua online?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "नगर पालिका परिषद झाबुआ के ई-नगर पोर्टल पर जाएं। मृत्यु प्रमाण पत्र सेवा चुनें, ऑनलाइन फॉर्म भरें, आवश्यक दस्तावेज अपलोड करें और जमा करें। Visit the e-Nagar portal of Nagar Palika Parishad Jhabua. Select Death Certificate service, fill the form, upload documents, and submit."
                }
              },
              {
                "@type": "Question",
                "name": "मृत्यु प्रमाण पत्र हेतु कौन से दस्तावेज आवश्यक हैं? (What documents are required for death certificate?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "आवश्यक दस्तावेज: आवेदक का आधार कार्ड, अस्पताल/डॉक्टर द्वारा जारी मृत्यु प्रमाण पत्र, निवास पता प्रमाण, और पासपोर्ट साइज फोटो। Required documents: Aadhaar card, hospital/doctor issued death certificate, address proof, and passport size photo."
                }
              },
              {
                "@type": "Question",
                "name": "प्रमाण पत्र की स्थिति कैसे ट्रैक करें? (How to track death certificate status?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ई-नगर पोर्टल पर ट्रैक टैब में अपनी आवेदन संख्या दर्ज करें। रियल-टाइम स्थिति और टाइमलाइन दिखाई देगी। Go to the Track tab on the e-Nagar portal, enter your application number to see real-time status."
                }
              },
              {
                "@type": "Question",
                "name": "ई-नगर पोर्टल पर मृत्यु प्रमाण पत्र कितने दिनों में बनता है? (How many days to get death certificate?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "सामान्यतः 7-15 कार्य दिवसों में प्रमाण पत्र जारी हो जाता है। Generally, the certificate is issued within 7-15 working days."
                }
              },
              {
                "@type": "Question",
                "name": "क्या जन्म प्रमाण पत्र के लिए भी ऑनलाइन आवेदन हो सकता है? (Can birth certificate also be applied online?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "हाँ, जन्म प्रमाण पत्र सेवा शीघ्र ही ई-नगर पोर्टल पर उपलब्ध होगी। Yes, birth certificate service will be available soon on the e-Nagar portal."
                }
              }
            ]
          })
        }}
      />
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
              स्थिति ट्रैक करें एवं स्वीकृत प्रमाण पत्र डाउनलोड करें।
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="/death-certificate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-all hover:shadow-lg hover:shadow-emerald-900/20">
                मृत्यु प्रमाण पत्र आवेदन करें
                <span className="text-emerald-600">→</span>
              </a>
              <a href="/birth-certificate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm">
                जन्म प्रमाण पत्र (शीघ्र)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">हमारी सेवाएँ</h2>
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
                  मृत्यु प्रमाण पत्र
                </h3>
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-3">
                  Death Certificate
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  मृत्यु प्रमाण पत्र के लिए ऑनलाइन आवेदन करें। आवेदन की स्थिति ट्रैक करें एवं स्वीकृत प्रमाण पत्र डाउनलोड करें।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>ऑनलाइन आवेदन एवं ड्राफ्ट सेव</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>रियल-टाइम स्थिति ट्रैकिंग</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>सुरक्षित एवं गोपनीय</span>
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
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  शीघ्र आ रहा है
                </span>
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <Baby className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  जन्म प्रमाण पत्र
                </h3>
                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-3">
                  Birth Certificate
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन करें। शीघ्र ही यह सेवा उपलब्ध होगी।
                </p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>ऑनलाइन आवेदन (शीघ्र)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>त्वरित प्रमाणीकरण</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>डिजिटल रूप से सत्यापित</span>
                  </div>
                </div>

                <div className="flex items-center text-blue-700 font-bold text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                  जल्द आ रहा है
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
                  <li>• मृतक/शिशु का अस्पताल प्रमाण पत्र (Hospital Certificate)</li>
                  <li>• निवास पता प्रमाण (Address Proof)</li>
                  <li>• पासपोर्ट साइज फोटो (Passport Size Photo)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">सहायता हेतु संपर्क करें (Contact for Help):</p>
                <ul className="space-y-1 text-xs">
                  <li>• नगर पालिका परिषद, झाबुआ (Nagar Palika Parishad, Jhabua)</li>
                  <li>• जिला - झाबुआ, मध्य प्रदेश (District - Jhabua, MP)</li>
                  <li>• कार्यालय समय: सोमवार - शनिवार (Office: Mon - Sat, 10:30 - 17:30)</li>
                  <li>• ई-नगरपालिका पोर्टल (e-Nagar Palika Portal)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-10 sm:mt-14 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-lg">❓</span> अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: 'झाबुआ में ऑनलाइन मृत्यु प्रमाण पत्र कैसे बनाएं? (How to apply for death certificate in Jhabua online?)',
                  a: 'नगर पालिका परिषद झाबुआ के ई-नगर पोर्टल (e-nagar01.netlify.app) पर जाएं। "मृत्यु प्रमाण पत्र" सेवा चुनें, ऑनलाइन फॉर्म भरें, आवश्यक दस्तावेज अपलोड करें और जमा करें। आवेदन संख्या द्वारा स्थिति ट्रैक करें। Visit the e-Nagar portal, select Death Certificate service, fill the online form, upload required documents, and submit. Track status using your application number.'
                },
                {
                  q: 'मृत्यु प्रमाण पत्र हेतु कौन से दस्तावेज आवश्यक हैं? (What documents are required for death certificate?)',
                  a: 'आवश्यक दस्तावेज: आवेदक का आधार कार्ड, अस्पताल/डॉक्टर द्वारा जारी मृत्यु प्रमाण पत्र, निवास पता प्रमाण, और पासपोर्ट साइज फोटो। Required documents: Aadhaar card, hospital/doctor issued death certificate, address proof, and passport size photo.'
                },
                {
                  q: 'प्रमाण पत्र की स्थिति कैसे ट्रैक करें? (How to track death certificate status?)',
                  a: 'ई-नगर पोर्टल पर "ट्रैक करें" टैब में अपनी आवेदन संख्या (DC-2026-XXXXX) दर्ज करें। आपको रियल-टाइम स्थिति और टाइमलाइन दिखाई देगी। Go to the "Track" tab on the e-Nagar portal, enter your application number. You will see real-time status and timeline.'
                },
                {
                  q: 'ई-नगर पोर्टल पर मृत्यु प्रमाण पत्र कितने दिनों में बनता है? (How many days does it take to get death certificate on e-Nagar?)',
                  a: 'सामान्यतः आवेदन जमा करने के 7-15 कार्य दिवसों में प्रमाण पत्र जारी हो जाता है। स्थिति ऑनलाइन ट्रैक की जा सकती है। Generally, the certificate is issued within 7-15 working days after application submission. Status can be tracked online.'
                },
                {
                  q: 'क्या जन्म प्रमाण पत्र के लिए भी ऑनलाइन आवेदन हो सकता है? (Can birth certificate also be applied online?)',
                  a: 'हाँ, जन्म प्रमाण पत्र सेवा शीघ्र ही ई-नगर पोर्टल पर उपलब्ध होगी। वर्तमान में मृत्यु प्रमाण पत्र के लिए ऑनलाइन आवेदन उपलब्ध है। Yes, birth certificate service will be available soon on the e-Nagar portal. Currently, online application is available for death certificates.'
                },
              ].map((faq, i) => (
                <details key={i} className="group border border-slate-200 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-bold text-slate-800 select-none">
                    <span>{faq.q}</span>
                    <span className="text-emerald-600 group-open:rotate-45 transition-transform text-lg shrink-0">+</span>
                  </summary>
                  <div className="px-5 py-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                    {faq.a}
                  </div>
                </details>
              ))}
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
