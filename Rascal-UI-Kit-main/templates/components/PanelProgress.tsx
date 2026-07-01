import React from 'react';

interface PanelProgressProps {
  submitted: number;
  total: number;
  /** Override the width of the track. Default w-16. */
  trackClass?: string;
}

/**
 * Mini horizontal progress bar + `submitted / total` count.
 * Tone follows completion: ≥80% emerald, ≥40% amber, else stone.
 */
const PanelProgress: React.FC<PanelProgressProps> = ({ submitted, total, trackClass }) => {
  const pct = total === 0 ? 0 : Math.round((submitted / total) * 100);
  const tone = pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-stone-400';
  return (
    <div className="flex items-center gap-2" title={`${submitted}/${total}`}>
      <div className={`${trackClass ?? 'w-16'} h-1.5 bg-stone-200 rounded-full overflow-hidden`}>
        <div className={`h-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-stone-600 w-8 text-right">{submitted}/{total}</span>
    </div>
  );
};

export default PanelProgress;
