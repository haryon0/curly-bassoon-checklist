import React, { useState } from 'react';

interface CollapsibleCardProps {
  /** Eyebrow string, e.g. "Achievement Summary". */
  eyebrow: string;
  /** Optional meta segment after the eyebrow separator dot. */
  meta?: React.ReactNode;
  /** Optional secondary meta after a second separator. */
  meta2?: React.ReactNode;
  /** Default open state. Defaults to false. */
  defaultOpen?: boolean;
  /** Toggle action label. Defaults to "View details" / "Hide details". */
  labels?: { open: string; closed: string };
  children: React.ReactNode;
}

/**
 * Collapsible section card. Default closed for a quieter exec dashboard.
 * Header is clickable across its full width with an explicit
 * "View details ⌄" affordance on the right.
 */
const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  eyebrow,
  meta,
  meta2,
  defaultOpen = false,
  labels = { open: 'Hide details', closed: 'View details' },
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-7">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 flex-wrap text-xs uppercase tracking-wider font-semibold">
          <span className="text-stone-600">{eyebrow}</span>
          {meta && (
            <>
              <span className="text-stone-300 normal-case">·</span>
              <span className="text-stone-500 normal-case tracking-normal font-normal">{meta}</span>
            </>
          )}
          {meta2 && (
            <>
              <span className="text-stone-300 normal-case">·</span>
              <span className="text-stone-500 normal-case tracking-normal font-normal">{meta2}</span>
            </>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 shrink-0">
          {open ? labels.open : labels.closed}
          <ChevronDown rotated={open} />
        </span>
      </button>

      {open && <div className="mt-5">{children}</div>}
    </div>
  );
};

const ChevronDown: React.FC<{ rotated: boolean }> = ({ rotated }) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform ${rotated ? 'rotate-180' : ''}`}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default CollapsibleCard;
