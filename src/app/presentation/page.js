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
    title: 'Jhabua Nagar Palika e-Sewa Portal — SOP Presentation Overview',
    subtitle: 'Executive SOP & Platform Architecture Overview (Hinglish)',
    category: 'OVERVIEW',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: Building2,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3.5 py-1 rounded-full border border-emerald-400/30 uppercase tracking-widest inline-block">
              Madhya Pradesh Govt — Urban Development & Housing Department
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
              Karyalay Nagar Palika Parishad Jhabua (M.P.)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Jhabua nagarikon ke liye Birth Certificate, Death Certificate aur Water Connection ki 100% online, transparent aur fast services ke liye ye Integrated Digital Intelligence Platform taiyar kiya gaya hai.
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
            <h3 className="font-extrabold text-slate-900 text-sm">Death Certificate Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Home ya Hospital death registration, Panchnama aur Muktidham receipt verification ke sath 7 working days me Certificate issue kiya jata hai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Birth Certificate Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Newborn baby registration, Anganwadi/ANM report aur Mother-Father Aadhaar verification ke sath 7 working days me Digital Certificate milta hai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Water Connection Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Property Details, Site Plan map, Plumber license aur ₹4,250 Connection Fee receipt verification ke baad CMO approval permit milta hai.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Nagarik Adhikar Patra & Timelines (MP Lok Seva Guarantee Act)',
    subtitle: 'Service Level Agreements (SLA) & Hard Copy Verification Timelines',
    category: 'SLA TIMELINES',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Clock,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Government Guaranteed Timelines Table (SLA & Hard Copy Verification)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-3 border-r border-slate-200 text-center">S.No.</th>
                  <th className="p-3 border-r border-slate-200">Service Name (Seva Ka Naam)</th>
                  <th className="p-3 border-r border-slate-200">Category / Process</th>
                  <th className="p-3 border-r border-slate-200">Hard Copy Submission & Verification Range</th>
                  <th className="p-3 border-r border-slate-200">Final SLA Approval Timeline</th>
                  <th className="p-3">Nodal Officer (Jawabdar Adhikari)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold border-r border-slate-200 text-center">1</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">Death Certificate (Mrityu Praman Patra)</td>
                  <td className="p-3 border-r border-slate-200">Hospital Death / Home Death</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-amber-800 bg-amber-50/60">Min 1 Day — Max 3 Days (1 se 3 Din)</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-emerald-800">7 Working Days (Karya Divas)</td>
                  <td className="p-3">Birth-Death Registrar Officer</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold border-r border-slate-200 text-center">2</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">Birth Certificate (Janma Praman Patra)</td>
                  <td className="p-3 border-r border-slate-200">Hospital Delivery / Home Delivery</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-amber-800 bg-amber-50/60">Min 1 Day — Max 3 Days (1 se 3 Din)</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-emerald-800">7 Working Days (Karya Divas)</td>
                  <td className="p-3">Birth-Death Registrar Officer</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold border-r border-slate-200 text-center">3</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">Water Connection (Nal Connection)</td>
                  <td className="p-3 border-r border-slate-200">Domestic / Commercial Connection</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-amber-800 bg-amber-50/60">Min 1 Day — Max 3 Days (1 se 3 Din)</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-blue-800">15 Working Days (Karya Divas)</td>
                  <td className="p-3">Water Supply Branch / CMO Jhabua</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-950 space-y-2 text-xs">
          <div className="font-bold flex items-center gap-2 text-amber-900 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Mandatory Verification Rules (Anivarya Niyam):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2 font-medium">
            <li>English me Deceased aur Child ka naam <strong>CAPITAL LETTERS</strong> me hona compulsory hai (Notice Board Rule 5 & 6).</li>
            <li>Online application fill karne ke baad <strong>Hard Copy Submission Letter (Pavti Patra)</strong> ka print nikal kar <strong>Minimum 1 day se Maximum 3 days ke andar</strong> Nagar Palika office me original documents ke sath submit karna hoga.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Nagarik Application Workflow (Citizen SOP Step-by-Step)',
    subtitle: 'Standard Operating Procedure for Online Applicants',
    category: 'CITIZEN WORKFLOW',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    icon: FileText,
    content: (
      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="font-extrabold text-slate-900 text-sm">Online Form Entry</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Smart Auto-Navigation aur Google Sign-In with real-time error alert ke sath form fill karein.
            </p>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="font-extrabold text-slate-900 text-sm">Document Upload Vault</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aadhaar card, Samagra ID, Muktidham receipt ya Hospital slip digital vault me upload karein.
            </p>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="font-extrabold text-slate-900 text-sm">Hard Copy Submission</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              1-Page Pavti Letter print karke <strong>1 to 3 days range me</strong> Nagar Palika me physical verification karayein.
            </p>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-2xl p-5 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h4 className="font-extrabold text-slate-900 text-sm">Live Mobile Tracking</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Application No se live status (Submitted ➔ Under Review ➔ Approved) track karein aur digital Certificate download karein.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 text-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold text-emerald-400">💡 Google Auth & Individual Tracking:</span>
            <p className="text-slate-300">Har nagarik apna personal form secure Google Sign-In se track kar sakta hai. Isse duplicate forms, shared cache issue aur privacy risk 100% resolve hota hai.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Adhikari Verification SOP (Officer Audit & Approval Workflow)',
    subtitle: 'Standard Operating Procedure for Administrative Officers',
    category: 'ADMIN WORKFLOW',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: ShieldAlert,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-700" />
            Officer Admin Portal (`/admin`) Verification Steps
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">1. Role-Based Login</span>
              <p className="text-slate-600">Birth-Death Registrar Officer aur Water Supply Officer apne dedicated credentials se `/admin` portal par login karte hain.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">2. Hard Copy & Vault Audit</span>
              <p className="text-slate-600">Nagarik dwara submit ki gayi 1 to 3 days hard copy ka online Firestore document vault data se matching kiya jata hai.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">3. Digital Seal & QR Release</span>
              <p className="text-slate-600">Adhikari dwara Approve karne par official Nagar Palika Digital Seal aur QR code certificate par automatic embed ho jata hai.</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-950 text-white rounded-2xl p-5 text-xs space-y-2">
          <span className="font-bold text-emerald-400">🛡️ Officer Remarks & Correction Protocol:</span>
          <p className="text-slate-300">Dastavez me koi kami hone par Adhikari status ko **Correction Requested** me badal kar exact remark likhte hain, jo nagarik ke tracking dashboard par instant show hota hai.</p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'Resubmission & Firestore Overwrite Protocol',
    subtitle: 'Zero Duplication Engine for Corrected Applications',
    category: 'RESUBMISSION ENGINE',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: RefreshCw,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              Resubmission & Automated Overwrite Engine
            </h3>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Zero Duplication Loop
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-amber-950 text-sm">❌ Purani System Ki Problem</h4>
              <p className="text-slate-700 leading-relaxed">
                Pehle jab nagarik correction ke baad form submit karta tha, to naya duplicate record ban jata tha jisse Adhikari confuse ho jate the.
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-extrabold text-emerald-950 text-sm">✅ Perfect Solution: Firestore Overwrite</h4>
              <p className="text-slate-700 leading-relaxed">
                Ab system `applicationNo` se original record ko locate karta hai aur same record ko update karta hai. Officer panel par instant **`🔄 Resubmitted`** alert notification milta hai.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 text-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-bold text-emerald-400">🔔 Live Notification Engine:</span>
            <p className="text-slate-300">Resubmitted form submit hote hi real-time push alert Adhikari aur Nagarik dono ko transmit ho jata hai.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: 'Security, DPDP Act Compliance & QR Verification',
    subtitle: 'DPDP Act 2023 Rules & Cryptographic Digital Verification',
    category: 'SECURITY & VERIFICATION',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">DPDP Act 2023 Privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Digital Personal Data Protection Act ke andar nagarik consent compulsory. Data Firebase encrypted cloud vault me secure hai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">QR Code Live Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Har Certificate aur Water permit par encrypted QR code stamped hota hai jise kisi bhi smartphone camera se scan karke verify kiya ja sakta hai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">CSS Paged Media Print Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              State Emblem watermark, repeated table headers aur minimal pages layout ke sath official PDF export engine.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-xs space-y-3">
          <h4 className="font-bold text-slate-900 text-sm border-b pb-2">Platform Technical Specs Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div><span className="text-slate-400 block">Database Vault:</span><span className="font-bold">Firebase Cloud Firestore</span></div>
            <div><span className="text-slate-400 block">Digital Seal:</span><span className="font-bold">Nagar Palika Official Seal</span></div>
            <div><span className="text-slate-400 block">QR Verification Domain:</span><span className="font-bold font-mono text-[10px]">jhabua-nagarpalika-aapke-dwar.netlify.app</span></div>
            <div><span className="text-slate-400 block">PDF Deck Printer:</span><span className="font-bold">CSS Paged Media `@page`</span></div>
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

  const handleDownloadFullSOP = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <ServiceHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col space-y-4">
        
        {/* Presentation Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Platform SOP & Architecture Presentation (Hinglish Deck)
              </h1>
              <p className="text-xs text-slate-500 font-medium">Nagar Palika Parishad Jhabua — Official e-Nagar Governance Presentation</p>
            </div>
          </div>

          {/* Presentation Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPlaying ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            {/* 1-Click Complete SOP PDF Download Button */}
            <button
              onClick={handleDownloadFullSOP}
              className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 पूरी SOP डाउनलोड / प्रिंट करें (Download Complete SOP PDF)</span>
            </button>
          </div>
        </div>

        {/* Screen Interactive Single Slide Display View */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between space-y-6 min-h-[520px] relative overflow-hidden no-print">
          
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
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <button
                onClick={handleNext}
                className="btn btn-primary btn-sm font-bold flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* ── PRINT ONLY ALL-SLIDES FULL SOP DECK CONTAINER ────────────────── */}
        <div className="hidden print:block space-y-8 font-sans">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)
            </h1>
            <p className="text-sm font-bold text-slate-700">
              संपूर्ण प्लेटफ़ॉर्म एस.ओ.पी. एवं गवर्नेंस प्रेज़ेंटेशन (Complete SOP Presentation Deck)
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              MP Lok Seva Guarantee Act & DPDP Act 2023 Compliant Platform
            </p>
          </div>

          {SLIDES.map((slide, idx) => {
            const Icon = slide.icon;
            return (
              <div key={slide.id} className="page-break-after border border-slate-300 rounded-2xl p-6 bg-white space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded">
                      SLIDE {idx + 1} / {SLIDES.length}
                    </span>
                    <span className="text-xs font-bold text-slate-600 uppercase">{slide.category}</span>
                  </div>
                  <Icon className="w-5 h-5 text-emerald-800" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">{slide.title}</h2>
                  <p className="text-xs text-slate-500 font-medium">{slide.subtitle}</p>
                </div>

                <div className="pt-2">
                  {slide.content}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
