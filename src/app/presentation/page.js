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
    title: 'Jhabua Nagar Palika e-Sewa Portal — SOP Presentation',
    subtitle: 'Executive SOP & Digital Platform Architecture (Hinglish)',
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
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Water Connection Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              New Home/Commercial tap connection, Property Tax receipt aur Plumber technical verification ke sath 15 working days me Sanction Permit milta hai.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Death Certificate — Standard Operating Procedure (SOP)',
    subtitle: 'Registration of Births & Deaths Act 1969 & Amended Rules 2023',
    category: 'SOP — DEATH CERTIFICATE',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: FileText,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold block text-sm mb-1">🏛️ Govt SLA Rules & Timelines:</span>
          Death event ke 21 days ke andar free registration hota hai. Hard copy submission aur physical verification ki range minimum 1 day se maximum 3 days tak hai.
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Step-by-Step SOP Workflow (Hinglish):</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">Step 1: Online Application Submission</span>
              <p className="text-slate-600">Google Sign-in karke deceased details, death date, place aur statistical information fill karein.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">Step 2: Document Upload</span>
              <p className="text-slate-600">Deceased Aadhaar, Applicant Aadhaar, Panchnama/Hospital summary aur Shamshan receipt attach karein.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">Step 3: Hard Copy Submission (1 to 3 Days)</span>
              <p className="text-slate-600">Application Letter print karke Nagar Palika Jhabua office me 1-3 days ke andar submit karein.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">Step 4: Officer Approval & Certificate Download</span>
              <p className="text-slate-600">Registrar approve karke signed Form-6 Certificate upload karte hain jo portal se download ho jata hai.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Birth Certificate — Standard Operating Procedure (SOP)',
    subtitle: 'Form-5 Official Govt Format & Digital Verification',
    category: 'SOP — BIRTH CERTIFICATE',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Baby,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
          <span className="font-bold block text-sm mb-1">👶 Birth Registration Guidelines:</span>
          Hospital ya Home birth event ke 21 days ke andar online apply karein. Parents Aadhaar aur Discharge Card zaroori hai.
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Birth Certificate SOP Workflow (Hinglish):</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">Step 1: Google Login & Child Details</span>
              <p className="text-slate-600">Citizen apne Google account se login karke child name, date of birth aur gender enter karte hain.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">Step 2: Parents Aadhaar & Address</span>
              <p className="text-slate-600">Mother aur Father ka 12-digit Aadhaar number fill karke present & permanent address select karein.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">Step 3: Hard Copy Verification (1 to 3 Days)</span>
              <p className="text-slate-600">Generated Submission Letter ki hard copy Nagar Palika Jhabua me 1 se 3 days ke andar submit karein.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">Step 4: Form-5 Signed Certificate</span>
              <p className="text-slate-600">Officer approve hone par barcode & QR code wala official Birth Certificate download kar sakte hain.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Water Connection — Standard Operating Procedure (SOP)',
    subtitle: 'Urban Water Supply Rules & Technical Approval Process',
    category: 'SOP — WATER CONNECTION',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: Droplets,
    content: (
      <div className="space-y-6 font-sans">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 leading-relaxed">
          <span className="font-bold block text-sm mb-1">💧 Water Connection Rules & SLA:</span>
          Home/Commercial tap connection ke liye Property Tax receipt required hai. Overall service SLA limit maximum 15 days hai.
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Water Connection Approval Stages (Hinglish):</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">Step 1: Property & Building Details</span>
              <p className="text-slate-600">House No, Ward No, Property Plot Area aur connection size (1/2 inch ya 3/4 inch) select karein.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">Step 2: Plumber & Tax Receipts</span>
              <p className="text-slate-600">Licensed Plumber details aur latest Property Tax payment receipt attach karein.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">Step 3: Site Inspection & Hard Copy (1-3 Days)</span>
              <p className="text-slate-600">Water Dept engineer site inspection karte hain aur hard copy submission receipt 1-3 days me li jati hai.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-teal-800 block">Step 4: Sanction Permit Issue</span>
              <p className="text-slate-600">Water Supply Admin approve karke official Sanction Order & Connection Permit issue karte hain.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'Guaranteed SLA Service Timelines Table',
    subtitle: 'Citizen Service Guarantee Act Specified Timelines Table',
    category: 'SLA TIMELINES',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: Clock,
    content: (
      <div className="space-y-6 font-sans">
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Hard Copy Submission Range</th>
                <th className="p-3">Officer Inspection Limit</th>
                <th className="p-3">Final Service SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white font-medium">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Death Certificate</td>
                <td className="p-3 text-emerald-700 font-bold">1 to 3 Days Range (Min 1 - Max 3 Days)</td>
                <td className="p-3 text-slate-600">2 Working Days</td>
                <td className="p-3 text-blue-900 font-extrabold">7 Working Days</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Birth Certificate</td>
                <td className="p-3 text-emerald-700 font-bold">1 to 3 Days Range (Min 1 - Max 3 Days)</td>
                <td className="p-3 text-slate-600">2 Working Days</td>
                <td className="p-3 text-blue-900 font-extrabold">7 Working Days</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Water Connection</td>
                <td className="p-3 text-emerald-700 font-bold">1 to 3 Days Range (Min 1 - Max 3 Days)</td>
                <td className="p-3 text-slate-600">5 Working Days</td>
                <td className="p-3 text-teal-900 font-extrabold">15 Working Days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Transparency & Fast Resolution:</span>
            Sabhi applications ki live status citizen apne phone par track kar sakte hain. Delay hone par Super Admin alert auto-trigger hota hai.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: 'Security, Role-Based Access & Maintenance Mode',
    subtitle: 'DPDP Data Protection Act 2023 & Emergency Super Admin Controls',
    category: 'SECURITY & GOVERNANCE',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Emergency Maintenance Toggle</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Security update ya routine check ke time Super Admin 1-click me website ko Maintenance Mode par roll out kar sakte hain jisse data risk zero ho jata hai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Department Credentials Management</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Registrar aur Water Admin ke username & password sirf Super Admin update kar sakte hain jisse unauthorized access stop rehti hai.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-emerald-400">100% Digital Audit Trail & Safety</h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-400/30">DPDP Act 2023 Compliant</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Har officer activity (approval, rejection, remark aur certificate upload) complete timeline aur digital audit log ke sath secure rehti hai.
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
                Jhabua e-Nagar Palika SOP Presentation (Hinglish)
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Slide {currentSlide + 1} / {SLIDES.length} — {slide.category}
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
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Slides'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 hover:to-teal-500"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 पूरी SOP प्रेज़ेंटेशन डाउनलोड करें (Download SOP PDF)</span>
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
              <ChevronLeft className="w-4 h-4" /> Previous Slide
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
              Next Slide <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}
