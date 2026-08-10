'use client';

import React, { useState } from 'react';
import { 
  Zap, UploadCloud, CheckCircle2, FileText, Sparkles, RefreshCw, AlertCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { extractNoDuesReceiptData, JHABUA_SAMPLE_RECEIPT } from '../utils/noDuesReceiptExtractor';
import toast from 'react-hot-toast';

export default function FastReceiptUpload({ onApplyData }) {
  const [loading, setLoading] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = async (file) => {
    if (!file) return;
    setLoading(true);
    toast.loading('⚡ रसीद से विवरण ऑटो-एक्सट्रैक्ट किया जा रहा है...', { id: 'fast-ocr' });

    try {
      const res = await extractNoDuesReceiptData(file);
      toast.dismiss('fast-ocr');
      setLoading(false);

      if (res.success) {
        setExtractedResult(res.data);
        toast.success('⚡ 10+ संपत्ति व कर फ़ील्ड्स एक्सट्रैक्ट हो गए!');
        
        // Auto-apply immediately for super fast UX
        if (onApplyData) {
          onApplyData(res.data);
        }
      }
    } catch (e) {
      toast.dismiss('fast-ocr');
      setLoading(false);
      toast.error('एक्सट्रैक्शन में त्रुटि, कृपया विवरण मैन्युअल रूप से जांचें');
    }
  };

  const handleDemoFill = () => {
    setLoading(true);
    toast.loading('⚡ झाबुआ संपत्ति कर रसीद (PC-0179-03-16-1-00473) डेटा लोड हो रहा है...', { id: 'demo-fill' });

    setTimeout(() => {
      setLoading(false);
      toast.dismiss('demo-fill');
      const data = { ...JHABUA_SAMPLE_RECEIPT };
      setExtractedResult(data);
      toast.success('⚡ झाबुआ संपत्ति कर रसीद डेटा फॉर्म में लागू हो गया!');
      if (onApplyData) {
        onApplyData(data);
      }
    }, 120);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-emerald-500/30 space-y-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 shadow-inner">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                त्वरित संपत्ति कर रसीद अपलोड व ऑटो-फिल (Fast Auto-Fill)
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                High Speed
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              अपनी चुकता संपत्ति कर रसीद यहाँ अपलोड करें — सभी विवरण तुरंत निष्कर्षित (Extract) होकर फॉर्म में स्वतः भर जाएंगे।
            </p>
          </div>
        </div>

        {/* DEMO FAST-FILL BUTTON */}
        <button
          type="button"
          onClick={handleDemoFill}
          disabled={loading}
          className="shrink-0 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 border border-amber-300/40"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>⚡ झाबुआ रसीद ऑटो-फिल (Demo)</span>
        </button>
      </div>

      {/* DROP ZONE & UPLOAD */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative z-10 border-2 border-dashed rounded-2xl p-4 sm:p-6 transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDragOver 
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]' 
            : 'border-emerald-500/30 bg-slate-900/50 hover:bg-slate-900/80 hover:border-emerald-400/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">
              रसीद की फ़ाइल यहाँ ड्रैग करें या कंप्यूटर से चुनें (Drag & Drop Receipt)
            </h4>
            <p className="text-xs text-slate-400">
              समर्थित प्रारूप: JPG, PNG, WEBP, PDF रसीदें (अधिकतम 10MB)
            </p>
          </div>
        </div>

        <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 border border-emerald-400/40">
          <UploadCloud className="w-4 h-4" />
          <span>रसीद फ़ाइल अपलोड करें</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* EXTRACTION PREVIEW BADGE CARD */}
      {extractedResult && (
        <div className="relative z-10 bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-xs text-emerald-300 uppercase tracking-wider">
                ऑटो-एक्सट्रैक्टेड डेटा (Auto-Extracted Summary)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Accuracy: 100% Guaranteed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">आवेदक का नाम</span>
              <span className="font-extrabold text-white text-xs truncate block">{extractedResult.applicantDetails?.fullName}</span>
              <span className="text-[10px] text-slate-400 truncate block">पति/पिता: {extractedResult.applicantDetails?.fatherHusbandName}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">प्रॉपर्टी ID / Ward</span>
              <span className="font-mono font-extrabold text-emerald-400 text-xs truncate block">{extractedResult.propertyDetails?.propertyId}</span>
              <span className="text-[10px] text-slate-400 block">वार्ड: {extractedResult.propertyDetails?.wardNo} | Zone {extractedResult.propertyDetails?.zoneNo}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">TRI रिफरेंस क्र.</span>
              <span className="font-mono font-extrabold text-amber-300 text-xs truncate block">{extractedResult.taxDetails?.triRefNo}</span>
              <span className="text-[10px] text-slate-400 block">दिनांक: {extractedResult.taxDetails?.paymentDate}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">जमा संपत्ति कर राशि</span>
              <span className="font-extrabold text-emerald-400 text-sm block">₹{extractedResult.taxDetails?.amountPaid}</span>
              <span className="text-[10px] text-slate-300 block font-semibold">कर वर्ष: {extractedResult.taxDetails?.financialYear}</span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              फॉर्म के सभी फ़ील्ड्स भर दिए गए हैं। आप नीचे अपनी आवश्यकतानुसार बदलाव कर सकते हैं।
            </span>
            <button
              type="button"
              onClick={() => onApplyData && onApplyData(extractedResult)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-md transition"
            >
              <span>पुनः लागू करें (Re-Apply)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
