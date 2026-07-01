import React from 'react';

type Step = { key: string; label: string; matches: string[] };

const STEPS: Step[] = [
  { key: 'prep',        label: 'Prep',         matches: ['prep_window'] },
  { key: 'self',        label: 'Self-Review',  matches: ['self_pending', 'self_submitted'] },
  { key: '360',         label: '360° Feedback',matches: ['360_pending', '360_collected'] },
  { key: 'manager',     label: 'Manager',      matches: ['manager_pending', 'manager_submitted'] },
  { key: 'calibration', label: 'Calibration',  matches: ['calibration'] },
  { key: 'done',        label: 'Sign-Off',     matches: ['approved', 'signed_off'] },
];

interface CycleStepperProps {
  status: string | null | undefined;
  /** Compact mode: smaller dots + labels. Default false. */
  compact?: boolean;
}

/**
 * 6-step PDF-aligned workflow stepper. Fluid — each step takes equal
 * share of the container, so it scales from full-width banners down to
 * narrow side rails without overflow.
 */
const CycleStepper: React.FC<CycleStepperProps> = ({ status, compact = false }) => {
  const activeIdx = STEPS.findIndex(s => status && s.matches.includes(status));
  const safeIdx = activeIdx < 0 ? 0 : activeIdx;
  const isComplete = status === 'signed_off';

  const dot = compact ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]';
  const label = compact ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className="flex items-start w-full">
      {STEPS.map((s, i) => {
        const done   = i < safeIdx || (i === safeIdx && isComplete);
        const active = i === safeIdx && !isComplete;
        const dotColor = done ? 'bg-emerald-500 text-white'
                       : active ? 'bg-stone-900 text-white ring-4 ring-stone-200'
                       : 'bg-stone-200 text-stone-500';
        const lineColor = i < safeIdx ? 'bg-emerald-500' : 'bg-stone-200';
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center text-center shrink-0">
              <div className={`${dot} rounded-full flex items-center justify-center font-semibold ${dotColor}`}>
                {done ? '✓' : i + 1}
              </div>
              <div className={`${label} mt-1.5 leading-tight ${active ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${lineColor} ${compact ? 'mt-2' : 'mt-3.5'} mx-1`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CycleStepper;
