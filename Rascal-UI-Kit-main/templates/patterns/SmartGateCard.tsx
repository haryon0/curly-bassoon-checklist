import React from 'react';

interface SmartGateCardProps {
  /** Period label, e.g. "April 2026". */
  periodLabel: string;
  /** Eyebrow word, e.g. "Summary". */
  eyebrow?: string;
  /** Headline shown when gate is closed. */
  headline: string;
  /** Count of items completed. */
  submitted: number;
  /** Total items expected. */
  total: number;
  /** Names of pending items to surface inline. */
  pendingNames: string[];
  /** Action button label. */
  actionLabel: string;
  /** Action callback. */
  onAction: () => void;
  /** Whether the action button should render (e.g., hide if no pending have email). */
  actionEnabled?: boolean;
}

/**
 * Smart-dashboard gate placeholder. Renders when the upstream summary
 * surface (momentum bullets + achievements card etc.) is not yet ready
 * because its source data is incomplete (e.g., not all leaders have
 * submitted their report). Communicates state + offers one-click action.
 *
 * Pair with the gate-condition check in the parent — when the condition
 * passes, this card unmounts and the real summary sections render.
 */
const SmartGateCard: React.FC<SmartGateCardProps> = ({
  periodLabel,
  eyebrow = 'Summary',
  headline,
  submitted,
  total,
  pendingNames,
  actionLabel,
  onAction,
  actionEnabled = true,
}) => {
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const previewNames = pendingNames.slice(0, 3);
  const overflow = pendingNames.length - previewNames.length;
  const previewLine = previewNames.length > 0
    ? `Waiting on ${previewNames.join(', ')}${overflow > 0 ? `, +${overflow} more` : ''}.`
    : '';

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
            {eyebrow} · {periodLabel}
          </div>
          <h3 className="text-lg font-semibold text-stone-900 tracking-tight">{headline}</h3>
        </div>
        <div className="text-sm text-stone-600 shrink-0">
          <span className="text-stone-900 font-semibold tabular-nums">{submitted}</span>
          <span className="text-stone-400"> / </span>
          <span className="tabular-nums">{total}</span>
          <span className="ml-1 text-stone-500">reported</span>
        </div>
      </div>

      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      {previewLine && (
        <p className="text-sm text-stone-600 leading-relaxed mb-4">{previewLine}</p>
      )}

      {actionEnabled && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default SmartGateCard;
