'use client'
import ServiceHeader from '@/components/ServiceHeader'
import { Baby, ArrowLeft, Clock, Shield, CheckCircle2, Mail, Phone, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function BirthCertificatePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <ServiceHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          होम पेज वापस जाएं (Back to Home)
        </Link>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Baby className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-blue-200 border border-white/20 uppercase tracking-wider">
                  प्रारंभिक चरण / Under Development
                </span>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              जन्म प्रमाण पत्र ऑनलाइन आवेदन
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Birth Certificate Online Application — Coming Soon
            </p>
            <p className="text-blue-200 text-xs max-w-2xl leading-relaxed">
              जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन प्रणाली शीघ्र ही उपलब्ध होगी। 
              कृपया अपडेट के लिए इस पेज को देखते रहें।
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-lg">✨</span> आगामी सुविधाएँ (Upcoming Features)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">ऑनलाइन आवेदन</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                घर बैठे जन्म प्रमाण पत्र के लिए ऑनलाइन आवेदन करें। कोई कतार नहीं, कोई परेशानी नहीं।
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">त्वरित प्रक्रिया</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                आवेदन की त्वरित प्रोसेसिंग और रियल-टाइम स्थिति ट्रैकिंग।
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">सुरक्षित डेटा</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                आपका डेटा पूर्णतः सुरक्षित और गोपनीय रहेगा। सरकारी मानकों के अनुसार।
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">📄</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">डिजिटल प्रमाण पत्र</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                स्वीकृत प्रमाण पत्र को डिजिटल रूप में डाउनलोड करें।
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">🔔</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">सूचना सेवा</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                SMS/ईमेल के माध्यम से आवेदन की स्थिति की जानकारी।
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">📱</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">मोबाइल फ्रेंडली</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                मोबाइल फोन से भी आसानी से आवेदन करें।
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-lg">📞</span> संपर्क करें (Contact Us)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">नगर पालिका परिषद झाबुआ</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    जिला - झाबुआ, मध्य प्रदेश<br />
                    पिन कोड - 457661
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">कार्यालय समय</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    सोमवार से शनिवार<br />
                    10:30 AM - 5:30 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">फोन संपर्क</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    कार्यालय: 07392-XXXXXX<br />
                    हेल्पलाइन: 1800-XXX-XXXX (Toll Free)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ईमेल संपर्क</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    support@nagarpalikajhabua.gov.in<br />
                    info@nagarpalikajhabua.gov.in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

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
