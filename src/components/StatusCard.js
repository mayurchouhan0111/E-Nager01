'use client';

import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, XCircleIcon, PencilIcon, ShieldCheck, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import styles from '@/styles/uiRedesign.module.css';

/**
 * StatusCard Component
 * Displays application status with icon + explicit text badge.
 * Conforms to WCAG 1.4.1 (Never rely on color alone) with official Gov colors.
 */
export default function StatusCard({
  status = 'Draft',
  applicationNo = null,
  title = null,
  description = null,
  date = null,
  officerRemarks = null,
  actions = null
}) {
  const normalized = (status || '').toLowerCase();

  let cardStyle = styles.statusCardNeutral;
  let Icon = Clock;
  let statusBadgeLabel = status;
  let badgeColor = 'bg-slate-200 text-slate-800 border-slate-300';

  if (
    normalized.includes('approved') ||
    normalized.includes('sanctioned') ||
    normalized.includes('completed') ||
    normalized.includes('certificate generated')
  ) {
    cardStyle = styles.statusCardSuccess;
    Icon = CheckCircle2;
    statusBadgeLabel = 'स्वीकृत (Approved)';
    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  } else if (
    normalized.includes('correction') ||
    normalized.includes('सुधार') ||
    normalized.includes('review') ||
    normalized.includes('जाँच')
  ) {
    cardStyle = styles.statusCardWarning;
    Icon = AlertTriangle;
    statusBadgeLabel = normalized.includes('correction') ? 'सुधार आवश्यक (Correction Requested)' : 'प्रक्रियाधीन (Under Review)';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  } else if (normalized.includes('reject') || normalized.includes('अस्वीकृत')) {
    cardStyle = styles.statusCardError;
    Icon = XCircle;
    statusBadgeLabel = 'अस्वीकृत (Rejected)';
    badgeColor = 'bg-red-100 text-red-900 border-red-300';
  } else if (normalized.includes('draft') || normalized.includes('प्रारूप')) {
    cardStyle = styles.statusCardNeutral;
    Icon = FileEdit;
    statusBadgeLabel = 'ड्राफ्ट (Draft Saved)';
    badgeColor = 'bg-slate-200 text-slate-800 border-slate-300';
  } else {
    // Submitted / Received
    cardStyle = styles.statusCardNeutral;
    Icon = Clock;
    statusBadgeLabel = 'जमा हुआ (Submitted)';
    badgeColor = 'bg-sky-100 text-sky-900 border-sky-300';
  }

  return (
    <div className={cardStyle} role="region" aria-label={`आवेदन स्थिति: ${statusBadgeLabel}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/80 shadow-2xs shrink-0">
            <Icon className="w-5 h-5 text-current" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {applicationNo && (
                <span className="font-mono font-bold text-xs bg-white/90 px-2 py-0.5 rounded border border-current/20">
                  {applicationNo}
                </span>
              )}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                {statusBadgeLabel}
              </span>
            </div>
            {title && (
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                {title}
              </h4>
            )}
          </div>
        </div>

        {date && (
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            दिनांक: {date}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {officerRemarks && (
        <div className="mt-2.5 p-2 rounded-lg bg-white/70 border border-current/20 text-xs">
          <div className="font-bold flex items-center gap-1.5 text-slate-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>अधिकारी की टिप्पणी (Officer Remark):</span>
          </div>
          <p className="mt-0.5 text-slate-700 font-medium pl-5">
            {officerRemarks}
          </p>
        </div>
      )}

      {actions && (
        <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
