'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ServiceHeader from '@/components/ServiceHeader';
import { 
  Presentation, ChevronLeft, ChevronRight, Play, Pause, Maximize2, 
  FileText, Baby, Droplets, ShieldCheck, CheckCircle2, AlertCircle, 
  Clock, RefreshCw, Printer, ShieldAlert, Sparkles, Building2, Layers, Download
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'झाबुआ नगर पालिका ई-सेवा पोर्टल — एस.ओ.पी. प्रस्तुतीकरण',
    subtitle: 'Executive SOP & Platform Architecture Overview',
    category: 'OVERVIEW',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: Building2,
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-widest inline-block">
              मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              नागरिकों को जन्म प्रमाण पत्र, मृत्यु प्रमाण पत्र एवं जल (नल) कनेक्शन की 100% ऑनलाइन, पारदर्शी एवं समयबद्ध सेवाएं प्रदान करने हेतु निर्मित एकीकृत डिजिटल इंटेलिजेंस प्लेटफॉर्म।
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <img src="/mp-logo.png" alt="" className="w-80 h-80 object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">मृत्यु प्रमाण पत्र सेवा</h3>
            <p className="text-xs text-slate-500 leading-relaxed">घर/अस्पताल मृत्यु पंजीकरण, पंचनामा एवं मुक्तिधाम रसीद सत्यापन के साथ 7 दिनों में प्रमाण पत्र जारी।</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">जन्म प्रमाण पत्र सेवा</h3>
            <p className="text-xs text-slate-500 leading-relaxed">नवजात शिशु पंजीकरण, आँगनवाड़ी सील पत्र एवं माता-पिता आधार लिंक के साथ त्वरित डिजिटल जारीकरण।</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">जल (नल) कनेक्शन सेवा</h3>
            <p className="text-xs text-slate-500 leading-relaxed">साइट प्लान नक्शा, प्लम्बर लाइसेंस एवं ₹4250 शुल्क चालान सत्यापन उपरांत CMO स्वीकृत परमिट।</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'नागरिक अधिकार पत्र एवं सेवा समयावधि (SLA Rules)',
    subtitle: 'Service Level Agreements & Mandated Resolution Timelines',
    category: 'CITIZEN CHARTER',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Clock,
    content: (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            शासकीय सेवा समयावधि (Guaranteed Timelines as per MP Lok Seva Guarantee Act)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-3 border-r border-slate-200">क्र.</th>
                  <th className="p-3 border-r border-slate-200">सेवा का नाम (Service Name)</th>
                  <th className="p-3 border-r border-slate-200">प्रकार (Category)</th>
                  <th className="p-3 border-r border-slate-200">स्वीकृति समयावधि (SLA)</th>
                  <th className="p-3">उत्तरदायी अधिकारी (Nodal Officer)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold border-r border-slate-200 text-center">1</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">मृत्यु प्रमाण पत्र (Death Cert)</td>
                  <td className="p-3 border-r border-slate-200">अस्पताल मृत्यु / घर पर मृत्यु</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-emerald-800">7 कार्य दिवस (Days)</td>
                  <td className="p-3">जन्म-मृत्यु रजिस्ट्रार अधिकारी</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold border-r border-slate-200 text-center">2</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">जन्म प्रमाण पत्र (Birth Cert)</td>
                  <td className="p-3 border-r border-slate-200">अस्पताल प्रसव / घर पर प्रसव</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-emerald-800">7 कार्य दिवस (Days)</td>
                  <td className="p-3">जन्म-मृत्यु रजिस्ट्रार अधिकारी</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold border-r border-slate-200 text-center">3</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">नवीन जल कनेक्शन (Water Conn)</td>
                  <td className="p-3 border-r border-slate-200">घरेलू / व्यावसायिक कनेक्शन</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-blue-800">15 कार्य दिवस (Days)</td>
                  <td className="p-3">जल प्रदाय शाखा / CMO झाबुआ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-950 space-y-2 text-xs">
          <div className="font-bold flex items-center gap-2 text-amber-900 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>अनिवार्य नियम (Key Verification Rules):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2 font-medium">
            <li>अंग्रेजी में नाम की स्पेलिंग <strong>CAPITAL LETTERS</strong> में होना अनिवार्य है (सूचना पट्ट निर्देश 5 एवं 6)।</li>
            <li>ऑनलाइन आवेदन उपरांत <strong>भौतिक पावती पत्र (Submission Letter)</strong> का प्रिंट निकालकर मूल दस्तावेजों के साथ नगर पालिका कार्यालय में जमा करना अनिवार्य है।</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'नागरिक आवेदन एस.ओ.पी. (Citizen Application Workflow)',
    subtitle: 'Standard Operating Procedure for Online Applicants',
    category: 'CITIZEN WORKFLOW',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    icon: FileText,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="font-extrabold text-slate-900 text-sm">फॉर्म प्रविष्टि (Form Filing)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              त्रुटि होने पर स्वचालित नेविगेशन (Auto Navigation to missed fields) एवं रियल-टाइम इनलाइन अलर्ट के साथ फॉर्म भरें।
            </p>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="font-extrabold text-slate-900 text-sm">दस्तावेज अपलोड (Doc Vault)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              आधार कार्ड, समग्र आईडी, मुक्तिधाम रसीद/अस्पताल स्लिप का डिजिटल दस्तावेज अपलोड करें।
            </p>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="font-extrabold text-slate-900 text-sm">पावती पत्र प्रिंट (Print Letter)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              भौतिक पावती पत्र (1 Page Submission Receipt) प्रिंट करें एवं नगर पालिका कार्यालय में भौतिक सत्यापन कराएं।
            </p>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h4 className="font-extrabold text-slate-900 text-sm">लाइव ट्रैक (Live Tracking)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              आवेदन क्रमांक (App No) दर्ज कर स्थिति (Submitted ➔ Under Review ➔ Approved) ट्रैक करें।
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 text-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold text-emerald-400">💡 स्मार्ट फीचर (Smart Auto-Nav):</span>
            <p className="text-slate-300">यदि फॉर्म भरते समय कोई फील्ड छूट जाता है, तो बटन दबाते ही स्क्रीन स्वतः उस फील्ड पर स्क्रॉल हो जाती है और लाल बॉक्स में त्रुटि दिखाती है।</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'अधिकारी सत्यापन एस.ओ.पी. (Officer Audit Workflow)',
    subtitle: 'Standard Operating Procedure for Administrative Officers',
    category: 'ADMIN WORKFLOW',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: ShieldAlert,
    content: (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-700" />
            अधिकारी प्रशासन पोर्टल (`/admin`) सत्यापन चरण
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">1. भूमिका आधारित लॉगिन</span>
              <p className="text-slate-600">जन्म-मृत्यु रजिस्ट्रार अधिकारी एवं जल प्रदाय विभाग अधिकारी पृथक-पृथक क्रेडेंशियल से लॉगिन करते हैं।</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">2. भौतिक दस्तावेज जांच</span>
              <p className="text-slate-600">नागरिक द्वारा प्रस्तुत मूल पावती एवं संलग्न फोटोकॉपी का मिलान ऑनलाइन पोर्टल डेटा से किया जाता है।</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">3. स्थिति परिवर्तन एवं डिजिटल सील</span>
              <p className="text-slate-600">अधिकारी द्वारा स्वीकृत करने पर डिजिटल प्रमाण पत्र पर आधिकारिक नगर पालिका सील एवं QR कोड स्वतः अंकित हो जाता है।</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-950 text-white rounded-2xl p-5 text-xs space-y-2">
          <span className="font-bold text-emerald-400">🛡️ अधिकारी टिप्पणी (Officer Remarks System):</span>
          <p className="text-slate-300">यदि किसी दस्तावेज में कमी पाई जाती है, तो अधिकारी स्थिति को **Correction Requested (सुधार की आवश्यकता)** में बदल कर स्पष्ट टिप्पणी (Remark) लिख सकते हैं, जो नागरिक के मोबाइल ट्रैक पैनल पर तुरंत प्रदर्शित होती है।</p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'सुधार चक्र एवं ओवरराइट प्रोटोकॉल (Resubmission Protocol)',
    subtitle: 'Automated Record Overwrite & Alert Mechanism for Corrected Files',
    category: 'RESUBMISSION ENGINE',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: RefreshCw,
    content: (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              आवेदन सुधार एवं पुनः प्रस्तुतीकरण चक्र (Resubmission Engine)
            </h3>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Zero Duplication Loop
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-amber-950 text-sm">❌ पुरानी व्यवस्था की समस्या (The Issue)</h4>
              <p className="text-slate-700 leading-relaxed">
                पहले जब नागरिक सुधार के बाद पुनः प्रस्तुत करता था, तो प्रणाली नया डुप्लिकेट आवेदन बना देती थी जिससे पुराना एवं नया आवेदन भ्रम पैदा करता था।
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-emerald-950 text-sm">✅ समाधान: फायरस्टोर ओवरराइट मर्ज (The Solution)</h4>
              <p className="text-slate-700 leading-relaxed">
                अब प्रणाली `applicationNo` द्वारा मूल रिकॉर्ड खोजती है और उसी रिकॉर्ड को अद्यतन करती है। अधिकारी पैनल में तत्काल **`🔄 सुधारित आवेदन पुनः प्राप्त (Resubmitted)`** का अलर्ट दिखता है।
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 text-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-bold text-emerald-400">🔔 ऑटो नोटिफिकेशन इंजन:</span>
            <p className="text-slate-300">सुधारित आवेदन जमा होते ही अधिकारियों एवं नागरिकों को लाइव अलर्ट नोटिफिकेशन प्रसारित हो जाता है।</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: 'सुरक्षा, DPDP प्राइवेसी एवं क्यूआर सत्यापन (Security & Validation)',
    subtitle: 'DPDP Act 2023 Compliance & Cryptographic QR Verification',
    category: 'SECURITY & VERIFICATION',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">DPDP Act 2023 प्राइवेसी</h3>
            <p className="text-xs text-slate-500 leading-relaxed">डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम के तहत नागरिक सहमति अनिवार्य। डेटा एन्क्रिप्टेड स्टोरेज में सुरक्षित।</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">क्यूआर कोड सत्यापन</h3>
            <p className="text-xs text-slate-500 leading-relaxed">प्रत्येक प्रमाण पत्र एवं जल परमिट पर एन्क्रिप्टेड QR कोड अंकित होता है जिसे किसी भी स्मार्टफोन से स्कैन कर सत्यापित किया जा सकता है।</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">CSS Paged Media PDF</h3>
            <p className="text-xs text-slate-500 leading-relaxed">शासकीय वॉटरमार्क एवं दोहराए जाने वाले टेबल हेडर के साथ मिनिमम पेजेस PDF प्रिंट इंजन।</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-xs space-y-3">
          <h4 className="font-bold text-slate-900 text-sm border-b pb-2">सत्यापन सुरक्षा सारांश (Verification Security Summary)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div><span className="text-slate-400 block">डाटाबेस:</span><span className="font-bold">Firebase Cloud Firestore</span></div>
            <div><span className="text-slate-400 block">प्रमाण पत्र सील:</span><span className="font-bold">Digital Nagar Palika Seal</span></div>
            <div><span className="text-slate-400 block">QR सत्यापन URL:</span><span className="font-bold font-mono text-[10px]">jhabua-nagarpalika-aapke-dwar.netlify.app</span></div>
            <div><span className="text-slate-400 block">पीडीएफ प्रिंट:</span><span className="font-bold">CSS Paged Media `@page`</span></div>
          </div>
        </div>
      </div>
    )
  }
];

export default function PresentationPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentSlide = SLIDES[currentSlideIndex];

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
  };

  // Keyboard Navigation Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto Play Slides
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        handleNext();
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentSlideIndex]);

  const SlideIcon = currentSlide.icon;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <ServiceHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col space-y-4">
        
        {/* Presentation Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                प्लेटफ़ॉर्म एस.ओ.पी. एवं आर्किटेक्चर प्रेजेंटेशन (Platform SOP Presentation)
              </h1>
              <p className="text-xs text-slate-500 font-medium">नगर पालिका परिषद झाबुआ — ई-सेवा डिजिटल गवर्नेंस प्रस्तुतीकरण</p>
            </div>
          </div>

          {/* Presentation Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPlaying ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'रोकें (Pause)' : 'स्वचालित चलाएं (Auto Play)'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm text-xs font-bold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> प्रिंट प्रेजेंटेशन
            </button>
          </div>
        </div>

        {/* Main Slide Presentation Stage */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between space-y-6 min-h-[520px] relative overflow-hidden">
          
          {/* Slide Top Metadata Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${currentSlide.badgeColor}`}>
                {currentSlide.category}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                SLIDE {currentSlideIndex + 1} OF {SLIDES.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <SlideIcon className="w-5 h-5 text-emerald-700" />
            </div>
          </div>

          {/* Slide Content Main Container */}
          <div className="flex-1 space-y-4 animate-fade-in py-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {currentSlide.title}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {currentSlide.subtitle}
              </p>
            </div>

            <div className="pt-2">
              {currentSlide.content}
            </div>
          </div>

          {/* Slide Footer Navigation Control Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap no-print">
            
            {/* Thumbnail dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlideIndex === idx ? 'w-8 bg-emerald-700' : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Slide ${idx + 1}: ${slide.title}`}
                />
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="btn btn-secondary btn-sm font-bold flex items-center gap-1 text-slate-800"
              >
                <ChevronLeft className="w-4 h-4" /> पिछला (Prev)
              </button>

              <button
                onClick={handleNext}
                className="btn btn-primary btn-sm font-bold flex items-center gap-1"
              >
                अगला (Next) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
