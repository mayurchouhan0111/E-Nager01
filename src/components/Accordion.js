'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '@/styles/uiRedesign.module.css';

/**
 * Accordion Component for Progressive Disclosure
 * Accessible, keyboard navigable, calm government styling.
 */
export default function Accordion({
  id = 'gov-accordion',
  title,
  subtitle = null,
  defaultOpen = false,
  badge = null,
  children
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.accordionCard} ${isOpen ? styles.accordionCardOpen : ''}`}>
      <button
        type="button"
        id={`${id}-header`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={() => setIsOpen(prev => !prev)}
        className={styles.accordionHeaderBtn}
      >
        <div className="flex items-center gap-2.5 flex-1 pr-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{title}</span>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-800' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-header`}
        hidden={!isOpen}
        className={styles.accordionBody}
      >
        {children}
      </div>
    </div>
  );
}
