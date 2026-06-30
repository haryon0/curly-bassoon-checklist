import React from 'react';

interface Column<T> {
  header: string;
  /** Width — pass a Tailwind arbitrary-value class fragment, e.g. "180px" or "1fr". */
  width: string;
  render: (row: T) => React.ReactNode;
}

interface NotionDbListProps<T> {
  eyebrow: string;
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  rows: T[];
  /** Optional row click — receives the row data. Omit to render rows as non-interactive. */
  onRowClick?: (row: T) => void;
  /** Optional row-key extractor. Defaults to index. */
  keyOf?: (row: T) => string;
  /** Optional footer text below the rows (muted). */
  footer?: React.ReactNode;
}

/**
 * Quiet, scannable list with hairline rows. No card chrome per row, no
 * badges per row, no per-row buttons — just typography + ratios. Use
 * when scanning beats clicking.
 *
 * Column widths use grid arbitrary tracks: `grid-cols-[1fr_180px]` etc.
 */
function NotionDbList<T>({ eyebrow, title, subtitle, columns, rows, onRowClick, keyOf, footer }: NotionDbListProps<T>) {
  const trackStr = columns.map(c => c.width).join('_');
  const gridClass = `grid grid-cols-[${trackStr}] gap-6`;
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-7">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-stone-500 mb-1.5 font-medium">{eyebrow}</div>
        <h3 className="text-lg font-semibold text-stone-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-stone-500 mt-1.5">{subtitle}</p>}
      </div>

      {/* Header row */}
      <div className={`${gridClass} px-1 pb-2.5 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-100`}>
        {columns.map((c, i) => (
          <div key={i}>{c.header}</div>
        ))}
      </div>

      {/* Body */}
      <div>
        {rows.map((r, idx) => {
          const k = keyOf ? keyOf(r) : String(idx);
          const Tag = onRowClick ? 'button' : 'div';
          return (
            <div key={k} className="border-b border-stone-100">
              <Tag
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={`w-full text-left py-3.5 px-1 ${onRowClick ? 'hover:bg-stone-50/60 transition-colors' : ''} ${gridClass} items-baseline`}
              >
                {columns.map((c, i) => (
                  <div key={i} className="min-w-0">{c.render(r)}</div>
                ))}
              </Tag>
            </div>
          );
        })}
      </div>

      {footer && <p className="text-sm text-stone-500 mt-6">{footer}</p>}
    </div>
  );
}

export default NotionDbList;
