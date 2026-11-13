'use client';

import React from 'react';
import { Check } from '@heroicons/react/24/outline';
import styles from '@/styles/uiRedesign.module.css';

/**
 * Stepper Component for Multi-Step Citizen Forms
 * Conforms to WCAG AA with ARIA progressbar and bilingual Hindi/English step labels.
 */
export default function Stepper({
  steps = [],
  currentStep = 1,
  onStepClick = null
}) {
  const totalSteps = steps.length;
  const progressPercent = Math.round(((currentStep) / totalSteps) * 100);

  return (
    <nav
      aria-label="फॉर्म चरण प्रगति (Form Step Progress)"
      className={styles.stepperWrapper}
    >
      {/* ARIA Progressbar */}
      <div className={styles.stepperHeader}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">आवेदन प्रगति (Progress):</span>
          <span className={styles.stepperStepBadge}>
            चरण {currentStep} / {totalSteps}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-800">
          {progressPercent}% पूर्ण
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="फॉर्म चरण प्रगति (Form Step Progress)"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuetext={`चरण ${currentStep} कुल ${totalSteps} में से: ${steps[currentStep - 1]?.label || ''}`}
        className={styles.stepperProgressTrack}
      >
        <div
          className={styles.stepperProgressBar}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <ol className={styles.stepperStepsList}>
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let itemClass = styles.stepperStepItem;
          let dotClass = styles.stepperDot;

          if (isCompleted) {
            itemClass += ` ${styles.stepperStepItemCompleted}`;
            dotClass += ` ${styles.stepperDotCompleted}`;
          } else if (isActive) {
            itemClass += ` ${styles.stepperStepItemActive}`;
            dotClass += ` ${styles.stepperDotActive}`;
          }

          return (
            <li
              key={idx}
              className={itemClass}
              aria-current={isActive ? 'step' : undefined}
            >
              <button
                type="button"
                disabled={!onStepClick || (!isCompleted && !isActive)}
                onClick={() => onStepClick && onStepClick(stepNumber)}
                className={`flex items-center gap-2 text-left bg-transparent border-0 p-0 ${
                  onStepClick && (isCompleted || isActive) ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
              >
                <span className={dotClass}>
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stepNumber}
                </span>
                <span className="truncate">{step.label || step}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
