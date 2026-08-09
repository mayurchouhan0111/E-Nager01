'use client';
import React from 'react';
import { Check, Clock, AlertTriangle, XCircle, FileCheck, Circle } from 'lucide-react';

export default function ApplicationTimeline({ timeline = [], currentStatus = '' }) {
  // Normalize and ensure all timeline stages are fully rendered
  const processTimeline = () => {
    let items = Array.isArray(timeline) ? [...timeline] : [];
    
    // Fallback if timeline array is empty
    if (items.length === 0 && currentStatus) {
      items.push({
        id: 'step_sub',
        status: 'Submitted',
        action: 'APPLICATION SUBMITTED',
        performedBy: 'नागरिक (Citizen)',
        timestamp: new Date().toISOString(),
        remarks: 'आवेदन सफलतापूर्वक प्रस्तुत किया गया'
      });
    }

    // Ensure latest currentStatus step exists if officer updated status
    if (currentStatus && currentStatus !== 'Submitted' && currentStatus !== 'Draft') {
      const hasLatest = items.some(t => t.status === currentStatus || t.action?.includes(currentStatus.toUpperCase()));
      if (!hasLatest) {
        items.push({
          id: `step_${currentStatus.toLowerCase()}`,
          status: currentStatus,
          action: `STATUS CHANGED TO ${currentStatus.toUpperCase()}`,
          performedBy: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Officer)',
          role: 'Officer',
          timestamp: new Date().toISOString(),
          remarks: currentStatus === 'Approved' ? 'सभी दस्तावेज सत्यापित। स्वीकृत।' : `स्थिति अद्यतन: ${currentStatus}`
        });
      }
    }

    return items;
  };

  const displayTimeline = processTimeline();

  if (displayTimeline.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs italic font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        कोई गतिविधि उपलब्ध नहीं है (No timeline activity recorded)
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Approved':
      case 'Sanctioned':
      case 'Certificate Generated':
      case 'Completed':
        return {
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotBg: 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100',
          lineBg: 'bg-emerald-500',
          icon: <Check className="w-2.5 h-2.5 stroke-[3]" />
        };
      case 'Rejected':
        return {
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          dotBg: 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100',
          lineBg: 'bg-rose-500',
          icon: <XCircle className="w-2.5 h-2.5 stroke-[3]" />
        };
      case 'Correction Requested':
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          dotBg: 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100',
          lineBg: 'bg-amber-400',
          icon: <AlertTriangle className="w-2.5 h-2.5 stroke-[3]" />
        };
      case 'Under Review':
        return {
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          dotBg: 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 animate-pulse',
          lineBg: 'bg-blue-400',
          icon: <Clock className="w-2.5 h-2.5 stroke-[3]" />
        };
      case 'Submitted':
      default:
        return {
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dotBg: 'bg-emerald-700 border-emerald-700 text-white ring-4 ring-emerald-100',
          lineBg: 'bg-emerald-400',
          icon: <FileCheck className="w-2.5 h-2.5 stroke-[3]" />
        };
    }
  };

  return (
    <div className="relative pl-8 sm:pl-10 py-2">
      {/* Pixel-Perfect Dotted Line through Node Centers (Exact Center at 13px mobile / 15px desktop) */}
      <div className="absolute left-[13px] sm:left-[15px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-emerald-400/80" />

      <div className="space-y-4">
        {displayTimeline.map((item, index) => {
          const config = getStatusConfig(item.status);
          const isLast = index === displayTimeline.length - 1;

          return (
            <div key={item.id || index} className="relative group">
              {/* Perfectly Centered Stage Node Dot (16px x 16px) */}
              <div 
                className={`absolute -left-[27px] sm:-left-[33px] top-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-md z-10 transition-transform duration-300 group-hover:scale-125 ${config.dotBg}`}
              >
                {config.icon}
              </div>

              {/* Stage Activity Card */}
              <div className={`bg-white border rounded-2xl p-3.5 sm:p-4 shadow-xs transition-all duration-200 ${
                isLast ? 'border-emerald-300/80 ring-1 ring-emerald-100 bg-emerald-50/10' : 'border-slate-200/80'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${config.badge}`}>
                    {item.action || item.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString('hi-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }) : '—'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mb-1">
                  <span className="text-slate-400">द्वारा निष्पादित:</span>{' '}
                  <span className="font-bold text-slate-800">{item.performedBy || 'सिस्टम'}</span>
                  {item.role && (
                    <span className="text-slate-500 ml-1">({item.role})</span>
                  )}
                </div>

                {item.remarks && (
                  <div className="mt-2.5 text-xs bg-amber-50/90 rounded-xl p-3 border border-amber-200/80 text-amber-900 shadow-2xs">
                    <span className="font-bold flex items-center gap-1 mb-0.5 text-amber-800">
                      💬 अधिकारी टिप्पणी (Officer Remarks)
                    </span>
                    <p className="leading-relaxed font-medium">{item.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
