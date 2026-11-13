'use client';

import React from 'react';
import { PhoneCall, ClockIcon, MapPin, EnvelopeIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import styles from '@/styles/uiRedesign.module.css';

/**
 * HelplineCard Component
 * Persistent official contact card providing citizen assistance, office hours, and tap-to-call.
 */
export default function HelplineCard({
  title = "नगर पालिका नागरिक हेल्पलाइन एवं सहायता केंद्र",
  showAddress = true
}) {
  return (
    <div className={styles.helplineCard} role="region" aria-label="हेल्पलाइन एवं संपर्क विवरण">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={styles.helplineCardTitle}>
            <Building2 className="w-5 h-5 text-emerald-800" aria-hidden="true" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
            आवेदन में किसी भी समस्या या पूछताछ हेतु कार्य दिवसों में प्रातः 10:30 से सायं 05:30 बजे के मध्य संपर्क करें।
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" aria-hidden="true" />
              <span>सोमवार - शुक्रवार (10:30 AM - 05:30 PM)</span>
            </span>

            {showAddress && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>कार्यालय नगर पालिका परिषद, झाबुआ (म.प्र.) - 457661</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="tel:9713175838"
            className={styles.helplinePhoneBtn}
            aria-label="हेल्पलाइन पर कॉल करें: 9713175838"
          >
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>कॉल करें: 9713175838</span>
          </a>
        </div>
      </div>
    </div>
  );
}
