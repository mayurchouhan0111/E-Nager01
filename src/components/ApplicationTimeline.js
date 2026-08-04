'use client';
import React from 'react';
import { m, LazyMotion, domAnimation } from 'motion/react';

export default function ApplicationTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs italic font-medium">
        कोई गतिविधि उपलब्ध नहीं है (No timeline activity recorded)
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Approved':
      case 'Certificate Generated':
      case 'Completed':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'border-emerald-500 bg-emerald-500 shadow-emerald-200',
        };
      case 'Rejected':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200',
          dot: 'border-red-500 bg-red-500 shadow-red-200',
        };
      case 'Correction Requested':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'border-amber-500 bg-amber-500 shadow-amber-200',
        };
      case 'Under Review':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'border-blue-500 bg-blue-500 shadow-blue-200',
        };
      case 'Submitted':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'border-emerald-700 bg-emerald-700 shadow-emerald-200',
        };
      case 'Draft':
      default:
        return {
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'border-slate-400 bg-slate-400 shadow-slate-200',
        };
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative pl-7 py-2">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-300 via-slate-200 to-slate-200" />

        <div className="space-y-1">
          {timeline.map((item, index) => {
            const config = getStatusConfig(item.status);
            const isLast = index === timeline.length - 1;

            return (
              <m.div
                key={item.id || index}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="relative group"
              >
                {/* Timeline dot */}
                <div className={`absolute -left-7 top-4 w-3 h-3 rounded-full border-2 shadow-sm ${config.dot} transition-all duration-300 group-hover:scale-125`} />

                {/* Content card */}
                <div className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                  isLast ? 'border-slate-300 ring-1 ring-slate-100' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.badge}`}>
                      {item.action || item.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-medium">
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
                      <span className="text-slate-400 ml-1">({item.role})</span>
                    )}
                  </div>

                  {item.remarks && (
                    <div className="mt-3 text-xs bg-amber-50/80 rounded-xl p-3 border border-amber-100 text-amber-900">
                      <span className="font-bold block mb-0.5 text-amber-700">💬 अधिकारी टिप्पणी</span>
                      <p className="leading-relaxed">{item.remarks}</p>
                    </div>
                  )}
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
}
