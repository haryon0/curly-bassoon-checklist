import React from 'react';

export type Phase = 'prep' | 'self' | 'panel' | 'manager' | 'calibration' | 'done';

const PHASE_META: Record<Phase, { label: string; cls: string }> = {
  prep:        { label: 'Prep',        cls: 'bg-stone-100  text-stone-700  ring-stone-200' },
  self:        { label: 'Self-Review', cls: 'bg-blue-50    text-blue-700   ring-blue-200' },
  panel:       { label: 'Reviewers',   cls: 'bg-purple-50  text-purple-700 ring-purple-200' },
  manager:     { label: 'Manager',     cls: 'bg-amber-50   text-amber-700  ring-amber-200' },
  calibration: { label: 'Calibration', cls: 'bg-indigo-50  text-indigo-700 ring-indigo-200' },
  done:        { label: 'Done',        cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

/**
 * Helper: map a 10-state EPR workflow status to one of the 5 visible phases.
 * Drop this into wherever you import status from your app's types.
 */
export function phaseFromStatus(s: string): Phase {
  switch (s) {
    case 'prep_window':       return 'prep';
    case 'self_pending':
    case 'self_submitted':    return 'self';
    case '360_pending':
    case '360_collected':     return 'panel';
    case 'manager_pending':
    case 'manager_submitted': return 'manager';
    case 'calibration':       return 'calibration';
    case 'approved':
    case 'signed_off':        return 'done';
    default:                  return 'prep';
  }
}

const PhaseChip: React.FC<{ phase: Phase }> = ({ phase }) => {
  const m = PHASE_META[phase];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset ${m.cls}`}>
      {m.label}
    </span>
  );
};

export default PhaseChip;
