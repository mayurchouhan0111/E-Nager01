'use client'

import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import { Shield, Lock, Eye, FileText, CheckCircle2, UserCheck, HelpCircle, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      <ServiceHeader />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            भारत का डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act, 2023)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            डेटा प्राइवेसी एवं गोपनीयता नीति (Data Privacy Policy)
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed">
            नगर पालिका परिषद झाबुआ (म.प्र.) द्वारा नागरिकों के व्यक्तिगत डेटा की सुरक्षा, गोपनीयता तथा डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act, 2023) के अनुपालन हेतु आधिकारिक नीति नीतिपत्र।
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Compliance Highlight Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              📜
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                डेटा फिड्यूशरी (Data Fiduciary) घोषणा पत्र
              </h2>
              <p className="text-xs text-emerald-800 font-semibold">
                नगर पालिका परिषद, झाबुआ (मध्य प्रदेश) - अधिकारिक e-Nagar Portal
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
            डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 (Digital Personal Data Protection Act, 2023 - DPDP Act) के तहत <strong>नगर पालिका परिषद झाबुआ</strong> एक प्राधिकृत डेटा फिड्यूशरी (Data Fiduciary) है। हम नागरिक अधिकारों का सम्मान करते हैं तथा आपके द्वारा प्रदान किए गए व्यक्तिगत डेटा (Aadhaar, फ़ोन नंबर, नाम, पता, पारिवारिक विवरण) की पूर्ण सुरक्षा सुनिश्चित करते हैं।
          </p>
        </div>

        {/* Detailed Policy Sections */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-800 text-xs sm:text-sm leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">1</span>
              एकत्रित की जाने वाली व्यक्तिगत जानकारी (Personal Data Collected)
            </h3>
            <p className="text-slate-600">
              नगर पालिका नागरिक सेवाओं (जन्म प्रमाण पत्र, मृत्यु प्रमाण पत्र, जल कनेक्शन) के सुचारू निष्पादन हेतु निम्नलिखित डेटा एकत्र किया जाता है:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-slate-700 font-medium">
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>पहचान विवरण:</strong> आवेदक का नाम, पिता/पति का नाम, जन्म तिथि, आधार नंबर।</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>संपर्क जानकारी:</strong> मोबाइल नंबर, ई-मेल पता, पत्राचार का स्थायी पता।</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>सेवा-विशिष्ट डेटा:</strong> अस्पताल पर्ची, संपत्ति कर रसीद, नोटरी शपथ पत्र, वार्ड क्र.।</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>तकनीकी लॉग:</strong> IP एड्रेस, ब्राउज़र प्रकार, आवेदन जमा करने की समय तिथि।</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">2</span>
              डेटा संग्रहण का उद्देश्य (Purpose of Data Collection)
            </h3>
            <p className="text-slate-600">
              DPDP अधिनियम 2023 की धारा 4 के अनुसार, नागरिक डेटा केवल निम्नलिखित निर्दिष्ट वैध शासकीय प्रयोजनों हेतु संसाधित किया जाता है:
            </p>
            <div className="space-y-2">
              <p>• जन्म एवं मृत्यु रजिस्ट्रीकरण अधिनियम, 1969 के तहत वैधानिक प्रमाण पत्र निर्गमन हेतु।</p>
              <p>• नगर पालिका झाबुआ द्वारा जल प्रदाय (नल कनेक्शन) स्वीकृति एवं संपत्ति रिकॉर्ड अद्यतनीकरण हेतु।</p>
              <p>• नागरिक को SMS / e-mail के माध्यम से आवेदन की स्थिति की सूचना प्रेषित करने हेतु।</p>
              <p>• शासकीय लेखा परीक्षा (Audit) तथा धोखाधड़ी निवारण हेतु सुरक्षा लॉग बनाए रखने हेतु।</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">3</span>
              नागरिक (Data Principal) के अधिकार (Citizen Rights under DPDP Act)
            </h3>
            <p className="text-slate-600 mb-3">
              डिजिटल व्यक्तिगत डेटा संरक्षण कानून के अंतर्गत नागरिकों को निम्नलिखित अधिकार प्राप्त हैं:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <p className="font-extrabold text-emerald-950">1. एक्सेस का अधिकार (Right to Access)</p>
                <p className="text-slate-600 text-xs">नागरिक अपने द्वारा सबमिट किए गए डेटा एवं उसकी स्थिति को कभी भी ट्रैक कर सकते हैं।</p>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <p className="font-extrabold text-emerald-950">2. सुधार का अधिकार (Right to Correction)</p>
                <p className="text-slate-600 text-xs">त्रुटिपूर्ण जानकारी पाए जाने पर नागरिक ऑनलाइन संशोधन अनुरोध प्रेषित कर सकते हैं।</p>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <p className="font-extrabold text-emerald-950">3. सहमति वापसी (Consent Withdrawal)</p>
                <p className="text-slate-600 text-xs">नागरिक नोडल अधिकारी को सूचित कर सहमति वापस ले सकते हैं (अधिनियम के वैधानिक अपवादों के अधीन)।</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">4</span>
              सुरक्षा उपाय एवं एन्क्रिप्शन (Cyber Security Safeguards - CERT-In Guidelines)
            </h3>
            <p className="text-slate-600">
              भारतीय कंप्यूटर आपातकालीन प्रतिक्रिया टीम (CERT-In) के सुरक्षा मानकों के अनुसार पोर्टल पर निम्नलिखित तकनीकी सुरक्षा उपाय लागू हैं:
            </p>
            <ul className="space-y-1 text-slate-700">
              <li>• SSL / HTTPS एन्क्रिप्शन द्वारा डेटा ट्रांसमिशन सुरक्षा।</li>
              <li>• डेटाबेस स्तर पर Role-Based Access Control (RBAC) ताकि केवल अधिकृत रजिस्ट्रार अधिकारी ही डेटा देख सकें।</li>
              <li>• संवेदनशील दस्तावेजों की अनधिकृत पहुंच से सुरक्षा।</li>
            </ul>
          </section>

          {/* Section 5 - Grievance Redressal */}
          <section className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">5</span>
              शिकायत निवारण एवं डेटा संरक्षण अधिकारी (Data Protection Officer)
            </h3>
            <p className="text-slate-600">
              DPDP Act 2023 की धारा 8(10) के अंतर्गत डेटा गोपनीयता अथवा शिकायत निवारण हेतु आप हमारे नोडल अधिकारी से संपर्क कर सकते हैं:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <p className="font-extrabold text-slate-900">मुख्य नगर पालिका अधिकारी एवं नोडल डेटा संरक्षण अधिकारी (Chief Executive Officer & DPO)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>नगर पालिका परिषद कार्यालय, झाबुआ (म.प्र.) - 457661</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>हेल्पलाइन: +91-7392-243201</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ई-मेल: cmomjhabua@mp.gov.in</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Back Link */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-700 hover:text-emerald-800">
            <ArrowLeft className="w-4 h-4" /> मुख्य पृष्ठ पर वापस जाएं (Back to Home)
          </Link>
          <Link href="/grievance" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-slate-900">
            शिकायत निवारण पोर्टल (Grievance Portal) →
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} नगर पालिका परिषद झाबुआ (म.प्र.) | सर्वाधिकार सुरक्षित | DPDP Act 2023 Compliant
        </div>
      </footer>
    </div>
  )
}
