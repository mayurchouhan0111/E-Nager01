'use client'

import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle, ArrowLeft, Scale, Building2 } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      <ServiceHeader />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-300 border border-white/15">
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            सूचना प्रौद्योगिकी अधिनियम, 2000 एवं मध्य प्रदेश नगर पालिका अधिनियम
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            सेवा की शर्तें एवं वैधानिक घोषणा (Terms of Service)
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed">
            नगर पालिका परिषद झाबुआ (म.प्र.) द्वारा संचालित नागरिक ई-सेवा पोर्टल के उपयोग हेतु कानूनी नियम, नागरिक जिम्मेदारियां एवं आधिकारिक शर्तें।
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">

        {/* Legal Alert Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-3 text-amber-950">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-extrabold">
              अनिवार्य वैधानिक चेतावनी (Mandatory Legal Warning)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            पोर्टल पर प्रस्तुत की जाने वाली समस्त प्रविष्टियां शासकीय रिकॉर्ड हेतु आधिकारिक दस्तावेज मानी जाएंगी। यदि किसी आवेदक द्वारा कूटचरित (फर्जी), असत्य या भ्रामक दस्तावेज / जानकारी दर्ज की जाती है, तो भारतीय न्याय संहिता (BNS) एवं सूचना प्रौद्योगिकी अधिनियम (IT Act, 2000) के तहत दंडात्मक कानूनी कार्रवाई की जाएगी।
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-800 text-xs sm:text-sm leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-teal-700 flex items-center justify-center text-xs font-extrabold">1</span>
              पोर्टल की आधिकारिक स्थिति एवं दायरा (Scope of Portal)
            </h3>
            <p className="text-slate-600">
              यह डिजिटल पोर्टल <strong>नगर पालिका परिषद झाबुआ (म.प्र.)</strong> द्वारा नागरिकों को जन्म प्रमाण पत्र, मृत्यु प्रमाण पत्र एवं जल (नल) कनेक्शन हेतु ऑनलाइन आवेदन पत्र प्रस्तुत करने की सुविधा हेतु उपलब्ध कराया गया है।
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-teal-700 flex items-center justify-center text-xs font-extrabold">2</span>
              भौतिक सत्यापन एवं पावती पत्र जमा करना (Physical Verification Mandatory)
            </h3>
            <p className="text-slate-600">
              ऑनलाइन आवेदन पत्र सफलतापूर्वक जमा करने के पश्चात आवेदक को निम्नलिखित शर्तों का पालन करना अनिवार्य होगा:
            </p>
            <ul className="space-y-2 text-slate-700 font-medium">
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>जनरेटेड <strong>पावती पत्र (Printed Application Letter)</strong> का प्रिंट निकालें।</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>समस्त मूल दस्तावेजों (आधार कार्ड, अस्पताल डिस्चार्ज/मृत्यु पर्ची, संपत्ति रसीद) की स्व-प्रमाणित प्रतियों के साथ <strong>नगर पालिका कार्यालय झाबुआ</strong> में जमा करें।</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>प्रमाण पत्र अथवा स्वीकृति केवल सक्षम रजिस्ट्रार / मुख्य नगर पालिका अधिकारी के अंतिम भौतिक सत्यापन के उपरांत ही निर्गत होगी।</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-teal-700 flex items-center justify-center text-xs font-extrabold">3</span>
              सरकारी शुल्क एवं रसीद नीति (Government Fees & Charges)
            </h3>
            <p className="text-slate-600">
              जन्म एवं मृत्यु प्रमाण पत्र प्रथम प्रति (निर्धारित समयावधि में) शासन के नियमानुसार निःशुल्क अथवा निर्धारित शासकीय शुल्क पर दी जाती है। जल कनेक्शन हेतु निर्धारित विकास एवं कनेक्शन शुल्क नगर पालिका कैश काउंटर अथवा अधिकृत पेमेंट गेटवे के माध्यम से देय होगा।
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-teal-700 flex items-center justify-center text-xs font-extrabold">4</span>
              अस्वीकरण एवं सीमाएं (Limitation of Liability)
            </h3>
            <p className="text-slate-600">
              नगर पालिका परिषद झाबुआ पोर्टल के अनधिकृत उपयोग, सर्वर मंदी या नागरिक द्वारा दर्ज की गई गलत प्रविष्टियों के कारण होने वाले किसी भी विलंब हेतु उत्तरदायी नहीं होगी।
            </p>
          </section>

        </div>

        {/* Back Link */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold text-teal-700 hover:text-teal-800">
            <ArrowLeft className="w-4 h-4" /> मुख्य पृष्ठ पर वापस जाएं (Back to Home)
          </Link>
          <Link href="/privacy-policy" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-slate-900">
            गोपनीयता नीति (Privacy Policy) →
          </Link>
        </div>

      </div>
    </div>
  )
}
