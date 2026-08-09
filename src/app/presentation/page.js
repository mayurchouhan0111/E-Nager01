'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ServiceHeader from '@/components/ServiceHeader';
import { 
  Presentation, ChevronLeft, ChevronRight, Play, Pause, 
  FileText, Baby, Droplets, ShieldCheck, CheckCircle2, AlertCircle, 
  Clock, RefreshCw, Printer, ShieldAlert, Sparkles, Building2, Download
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'झाबुआ नगर पालिका ई-सेवा पोर्टल — एसओपी प्रेज़ेंटेशन',
    subtitle: 'मानक संचालन प्रक्रिया (SOP) एवं डिजिटल प्लेटफॉर्म वास्तुकला',
    category: 'ओवरव्यू (OVERVIEW)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: Building2,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3.5 py-1 rounded-full border border-emerald-400/30 uppercase tracking-widest inline-block">
              मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              झाबुआ के नागरिकों के लिए जन्म प्रमाण पत्र, मृत्यु प्रमाण पत्र एवं जल कनेक्शन की 100% ऑनलाइन, पारदर्शी एवं तीव्र सेवाओं हेतु यह एकीकृत डिजिटल प्लेटफॉर्म तैयार किया गया है।
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <img src="/mp-logo.png" alt="" className="w-80 h-80 object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">मृत्यु प्रमाण पत्र सेवा</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              गृह अथवा अस्पताल मृत्यु पंजीकरण, पंचनामा एवं मुक्तिधाम रसीद सत्यापन के साथ 7 कार्य दिवसों में प्रमाण पत्र जारी किया जाता है।
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">जन्म प्रमाण पत्र सेवा</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              नवजात शिशु पंजीकरण, आंगनवाड़ी/एएनएम रिपोर्ट एवं माता-पिता आधार सत्यापन के साथ 7 कार्य दिवसों में डिजिटल प्रमाण पत्र प्राप्त होता है।
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">जल कनेक्शन सेवा</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              नया घरेलू/वाणिज्यिक नल कनेक्शन, संपत्ति कर रसीद एवं प्लंबर तकनीकी जांच के साथ 15 कार्य दिवसों में स्वीकृति पत्र प्रदान किया जाता है।
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'मृत्यु प्रमाण पत्र — मानक संचालन प्रक्रिया (Death Certificate SOP)',
    subtitle: 'जन्म एवं मृत्यु पंजीकरण अधिनियम 1969 एवं संशोधित नियम 2023',
    category: 'SOP — DEATH CERTIFICATE',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: FileText,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold block text-sm mb-1">🏛️ शासकीय नियम एवं समयावधि (SLA Rules):</span>
          मृत्यु घटना के 21 दिनों के भीतर नि:शुल्क पंजीकरण किया जाता है। भौतिक पावती पत्र जमा करने की सीमा न्यूनतम 1 से अधिकतम 3 दिन है।
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">चरणबद्ध आवेदन एवं सत्यापन प्रक्रिया (Step-by-Step SOP):</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">चरण 1: ऑनलाइन आवेदन प्रविष्टि</span>
              <p className="text-slate-600">गूगल साइन-इन के साथ मृतक विवरण, मृत्यु तिथि, स्थान एवं सांख्यिकी जानकारी दर्ज करें।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">चरण 2: आवश्यक दस्तावेज अपलोड</span>
              <p className="text-slate-600">मृतक आधार, आवेदक आधार, पंचनामा/अस्पताल डिस्चार्ज समरी एवं श्मशान/कब्रिस्तान रसीद संलग्न करें।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">चरण 3: भौतिक प्रति जमा (1 से 3 दिन)</span>
              <p className="text-slate-600">पोर्टल से पावती पत्र प्रिंट करके नगर पालिका झाबुआ कार्यालय में 1-3 दिनों के भीतर जमा करें।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">चरण 4: अधिकारी जांच एवं प्रमाण पत्र निर्गमन</span>
              <p className="text-slate-600">रजिस्ट्रार द्वारा ऑनलाइन स्वीकृति के उपरांत आधिकारिक प्रपत्र-6 हस्ताक्षरित प्रमाण पत्र पोर्टल पर अपलोड किया जाता है।</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'जन्म प्रमाण पत्र — मानक संचालन प्रक्रिया (Birth Certificate SOP)',
    subtitle: 'प्रपत्र-5 (Form-5) शासकीय प्रारूप एवं डिजिटल सत्यापन प्रक्रिया',
    category: 'SOP — BIRTH CERTIFICATE',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Baby,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
          <span className="font-bold block text-sm mb-1">👶 शिशु पंजीकरण दिशा-निर्देश:</span>
          अस्पताल अथवा गृह जन्म की सूचना 21 दिनों में ऑनलाइन दर्ज करें। माता-पिता का आधार कार्ड एवं डिस्चार्ज कार्ड आवश्यक है।
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">जन्म प्रमाण पत्र एसओपी प्रक्रिया:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">1. गूगल लॉगिन व शिशु विवरण</span>
              <p className="text-slate-600">नागरिक अपने गूगल अकाउंट से लॉगिन करके शिशु का नाम, जन्म तिथि एवं लिंग दर्ज करते हैं।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">2. माता-पिता आधार एवं पता सत्यापन</span>
              <p className="text-slate-600">माता व पिता का 12-अंकों का आधार नंबर दर्ज कर वर्तमान व स्थायी पते का चयन करें।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">3. भौतिक पावती जमा (1 से 3 दिन)</span>
              <p className="text-slate-600">आवेदन पत्र की प्रति झाबुआ नगर पालिका लोक सेवा केंद्र में 1 से 3 कार्य दिवस में प्रस्तुत करें।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">4. प्रपत्र-5 हस्ताक्षरित प्रमाण पत्र</span>
              <p className="text-slate-600">अधिकारी द्वारा अनुमोदित होने पर बारकोड एवं क्यूआर कोड युक्त शासकीय जन्म प्रमाण पत्र डाउनलोड करें।</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'जल प्रदाय कनेक्शन — मानक संचालन प्रक्रिया (Water Connection SOP)',
    subtitle: 'नगरीय जल प्रदाय नियम एवं तकनीकी स्वीकृति प्रक्रिया',
    category: 'SOP — WATER CONNECTION',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: Droplets,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 leading-relaxed">
          <span className="font-bold block text-sm mb-1">💧 जल कनेक्शन नियम एवं समय-सीमा:</span>
          घरेलू/वाणिज्यिक नल कनेक्शन हेतु संपत्ति कर रसीद अनिवार्य है। कुल सेवा सीमा अधिकतम 15 कार्य दिवस है।
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">जल प्रदाय स्वीकृति चरण:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">चरण 1: संपत्ति एवं भवन विवरण प्रविष्टि</span>
              <p className="text-slate-600">भवन क्रमांक, वार्ड नंबर, मकान का क्षेत्रफल एवं कनेक्शन साइज (1/2 इंच या 3/4 इंच) चुनें।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">चरण 2: प्लंबर एवं संपत्ति कर दस्तावेज</span>
              <p className="text-slate-600">अधिकृत प्लंबर का नाम, लाइसेंस नंबर एवं अद्यतन संपत्ति कर रसीद अपलोड करें।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">चरण 3: स्थल निरीक्षण एवं पावती जमा (1-3 दिन)</span>
              <p className="text-slate-600">जल विभाग इंजीनियर द्वारा स्थल निरीक्षण किया जाता है तथा पावती पत्र की हार्ड कॉपी जमा की जाती है।</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">चरण 4: स्वीकृति आदेश एवं नल कनेक्शन</span>
              <p className="text-slate-600">सुपर एडमिन/जल प्रदाय अधिकारी द्वारा स्वीकृत आदेश एवं कनेक्शन परमिट जारी किया जाता है।</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'शासकीय सेवा गारंटी समय-सीमा (Service Level Agreement SLA)',
    subtitle: 'नागरिक सेवा गारंटी अधिनियम के अंतर्गत निर्धारित समयावधि तालिका',
    category: 'SLA TIMELINES',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: Clock,
    content: (
      <div className="space-y-6 font-sans">
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">सेवा का नाम (Service Name)</th>
                <th className="p-3">भौतिक पावती जमा (Hard Copy Limit)</th>
                <th className="p-3">अधिकारी जांच (Inspection Limit)</th>
                <th className="p-3">अंतिम सेवा समय-सीमा (Final SLA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white font-medium">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">मृत्यु प्रमाण पत्र (Death Certificate)</td>
                <td className="p-3 text-emerald-700 font-bold">1 से 3 दिन (Range 1-3 Days)</td>
                <td className="p-3 text-slate-600">2 कार्य दिवस</td>
                <td className="p-3 text-blue-900 font-extrabold">7 कार्य दिवस (7 Days)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">जन्म प्रमाण पत्र (Birth Certificate)</td>
                <td className="p-3 text-emerald-700 font-bold">1 से 3 दिन (Range 1-3 Days)</td>
                <td className="p-3 text-slate-600">2 कार्य दिवस</td>
                <td className="p-3 text-blue-900 font-extrabold">7 कार्य दिवस (7 Days)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">जल प्रदाय कनेक्शन (Water Connection)</td>
                <td className="p-3 text-emerald-700 font-bold">1 से 3 दिन (Range 1-3 Days)</td>
                <td className="p-3 text-slate-600">5 कार्य दिवस</td>
                <td className="p-3 text-teal-900 font-extrabold">15 कार्य दिवस (15 Days)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">पारदर्शिता एवं त्वरित निवारण:</span>
            सभी आवेदनों की स्थिति नागरिक अपने मोबाइल पर लाइव ट्रैक कर सकते हैं। समय-सीमा से अधिक विलंब होने पर सुपर एडमिन ऑटो-अलर्ट जारी होता है।
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: 'सुरक्षा, रोल-बेस्ड एक्सेस एवं ऑडिट सुरक्षा (Security & Compliance)',
    subtitle: 'DPDP डेटा सुरक्षा अधिनियम 2023 एवं सुपर एडमिन आपातकालीन नियंत्रण',
    category: 'SECURITY & GOVERNANCE',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>आपातकालीन मेंटेनेंस / रूटीन चेक</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              सुरक्षा अपडेट अथवा तकनीकी जांच के समय सुपर एडमिन 1-क्लिक में पोर्टल को मेंटेनेंस मोड पर डाल सकते हैं, जिससे डेटा रिस्क शून्य हो जाता है।
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>विभागीय क्रेडेंशियल्स नियंत्रण</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              रजिस्ट्रार एवं जल प्रदाय प्रशासक के यूजरनेम व पासवर्ड केवल सुपर एडमिन द्वारा अपडेट किए जा सकते हैं, जिससे अनाधिकृत पहुंच पूर्णतः प्रतिबंधित रहती है।
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-emerald-400">100% डिजिटल सुरक्षा एवं ऑडिट ट्रेल</h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-400/30">DPDP Act 2023 Compliant</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            प्रत्येक अधिकारी की गतिविधि (स्वीकृति, निरस्तीकरण एवं टिप्पणी) का संपूर्ण टाइमलाइन और डिजिटल ऑडिट लॉग सुरक्षित रखा जाता है।
          </p>
        </div>
      </div>
    )
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <ServiceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6">
        
        {/* TOP TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                झाबुआ ई-नगर पालिका SOP प्रेज़ेंटेशन
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                स्लाइड {currentSlide + 1} / {SLIDES.length} — {slide.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`btn btn-sm text-xs font-bold flex items-center gap-1.5 ${
                isPlaying ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'ऑटो प्ले रोकें' : 'ऑटो स्लाइड चालू करें'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 hover:to-teal-500"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 पूरी SOP प्रेज़ेंटेशन डाउनलोड करें (PDF)</span>
            </button>
          </div>
        </div>

        {/* MAIN SLIDE CONTAINER */}
        <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[500px]">
          
          {/* SLIDE HEADER */}
          <div className="space-y-3 relative z-10 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${slide.badgeColor}`}>
                {slide.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white flex items-center gap-3">
              <IconComponent className="w-7 h-7 text-emerald-400 shrink-0" />
              <span>{slide.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {slide.subtitle}
            </p>
          </div>

          {/* SLIDE CONTENT */}
          <div className="my-6 relative z-10 flex-1">
            {slide.content}
          </div>

          {/* SLIDE NAVIGATION CONTROLS */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between relative z-10">
            <button
              onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1))}
              className="btn btn-secondary btn-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-bold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> पिछली स्लाइड
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-2">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    currentSlide === idx ? 'w-8 bg-emerald-400' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
              className="btn btn-primary btn-sm bg-emerald-600 hover:bg-emerald-500 text-white border-none text-xs font-bold flex items-center gap-1"
            >
              अगली स्लाइड <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}
