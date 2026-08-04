'use client';
import React from 'react';

export default function ApplicationTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 text-xs italic font-medium">
        कोई गतिविधि उपलब्ध नहीं है (No timeline activity recorded)
      </div>
    );
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
      case 'Certificate Generated':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Correction Requested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Submitted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Draft':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 font-sans">
      {timeline.map((item, index) => (
        <div key={item.id || index} className="relative group">
          <div className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white transition-colors ${
            item.status === 'Approved' || item.status === 'Completed' ? 'border-emerald-500 bg-emerald-500' :
            item.status === 'Rejected' ? 'border-red-500 bg-red-500' :
            item.status === 'Correction Requested' ? 'border-amber-500 bg-amber-500' :
            'border-emerald-700 bg-emerald-700'
          }`} />

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeStyle(item.status)}`}>
                {item.action || item.status}
              </span>
              <span className="text-[11px] text-slate-400 font-mono font-semibold">
                {item.timestamp ? new Date(item.timestamp).toLocaleString('hi-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                }) : 'N/A'}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-700 mb-1">
              द्वारा निष्पादित (Performed by): <span className="text-slate-900 font-bold">{item.performedBy || 'System'}</span> {item.role ? `(${item.role})` : ''}
            </div>

            {item.remarks && (
              <div className="mt-2 text-xs bg-white rounded-xl p-3 border border-slate-200 text-slate-800 shadow-2xs">
                <span className="text-amber-800 font-bold block mb-0.5">💬 अधिकारी टिप्पणी (Officer Remark):</span>
                {item.remarks}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
