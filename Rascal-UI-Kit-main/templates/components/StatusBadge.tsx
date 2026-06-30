import React from 'react';

const TONE: Record<string, string> = {
  prep_window:       'bg-stone-100 text-stone-600',
  self_pending:      'bg-blue-50 text-blue-700',
  self_submitted:    'bg-blue-100 text-blue-800',
  '360_pending':     'bg-purple-50 text-purple-700',
  '360_collected':   'bg-purple-100 text-purple-800',
  manager_pending:   'bg-amber-50 text-amber-700',
  manager_submitted: 'bg-amber-100 text-amber-800',
  calibration:       'bg-indigo-50 text-indigo-700',
  approved:          'bg-emerald-50 text-emerald-700',
  signed_off:        'bg-emerald-100 text-emerald-800',
};

const LABELS: Record<string, string> = {
  prep_window:       'Prep Window',
  self_pending:      'Self-review Pending',
  self_submitted:    'Self-review Submitted',
  '360_pending':     '360° Pending',
  '360_collected':   '360° Collected',
  manager_pending:   'Manager Review Pending',
  manager_submitted: 'Manager Review Submitted',
  calibration:       'Calibration',
  approved:          'Approved',
  signed_off:        'Signed Off',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${TONE[status] ?? 'bg-stone-100 text-stone-600'}`}>
    {LABELS[status] ?? status}
  </span>
);

export default StatusBadge;
