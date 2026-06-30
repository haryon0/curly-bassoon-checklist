/**
 * Executive Dashboard — minimal scaffold showing how the kit's components
 * compose into a real screen. Drop into any Rascal app, wire up the data
 * sources, restyle as needed.
 *
 * Stack: React 19 + Tailwind 4 (Vite plugin). No state libraries required.
 */
import React, { useMemo, useState } from 'react';
import { FlagIcon, TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';

import StatCard from '../templates/components/StatCard';
import SmartGateCard from '../templates/patterns/SmartGateCard';
import CollapsibleCard from '../templates/patterns/CollapsibleCard';

// Replace with your actual data hooks.
interface Leader { id: string; name: string; email?: string; }
interface Report { id: string; leaderId: string; month: string; year: number; }
interface MomentumMetrics {
  achievedThisMonth: number;
  achievedThisQuarter: number;
  openThisQuarter: number;
  krCountByLeader: Map<string, { achieved: number; total: number }>;
}

interface ExecutiveDashboardProps {
  selectedMonth: string;  // e.g. "April"
  selectedYear: number;   // e.g. 2026
  leaders: Leader[];
  currentMonthReports: Report[];
  metrics: MomentumMetrics | null;
  /** Action when user clicks "Send reminder" — typically opens a modal. */
  onOpenReminder: (recipients: Array<{ leaderId: string; name: string; email: string }>) => void;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  selectedMonth, selectedYear, leaders, currentMonthReports, metrics, onOpenReminder,
}) => {
  // Smart-gate condition.
  const submittedIds = useMemo(() => {
    const s = new Set<string>();
    for (const r of currentMonthReports) s.add(r.leaderId);
    return s;
  }, [currentMonthReports]);
  const allSubmitted = leaders.length > 0 && submittedIds.size >= leaders.length;
  const pendingLeaders = leaders.filter(l => !submittedIds.has(l.id));

  // Quarter inference.
  const monthIdx = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(selectedMonth);
  const q = monthIdx < 3 ? 1 : monthIdx < 6 ? 2 : monthIdx < 9 ? 3 : 4;
  const quarterLabel = `Q${q} ${selectedYear}`;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Greeting */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-stone-500">Executive Overview</div>
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Hi 👋</h1>
        <p className="text-sm text-stone-600 mt-1">{selectedMonth} {selectedYear} · {quarterLabel}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Leaders" value={leaders.length} sub="active reporters" tone="neutral" />
        <StatCard
          label="Submitted"
          value={`${submittedIds.size} / ${leaders.length}`}
          sub={allSubmitted ? 'all reported' : `${pendingLeaders.length} pending`}
          tone={allSubmitted ? 'ok' : 'warn'}
        />
        <StatCard label="KRs closed (qtr)" value={metrics?.achievedThisQuarter ?? 0} sub={`${selectedMonth} progress`} tone="info" />
        <StatCard label="KRs in motion" value={metrics?.openThisQuarter ?? 0} sub="open this quarter" />
      </div>

      {/* Smart gate: either placeholder OR full summary sections */}
      {!allSubmitted ? (
        <SmartGateCard
          periodLabel={`${selectedMonth} ${selectedYear}`}
          headline="Final summary appears here once all leaders submit"
          submitted={submittedIds.size}
          total={leaders.length}
          pendingNames={pendingLeaders.map(l => l.name)}
          actionLabel={`Send reminder to ${pendingLeaders.filter(l => l.email).length} pending →`}
          actionEnabled={pendingLeaders.some(l => l.email)}
          onAction={() => {
            const recipients = pendingLeaders
              .filter(l => l.email)
              .map(l => ({ leaderId: l.id, name: l.name, email: l.email! }));
            onOpenReminder(recipients);
          }}
        />
      ) : (
        <>
          {/* As at end of {month} bullets */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-7">
            <p className="text-base text-stone-800 mb-3 leading-relaxed">
              As at the end of <span className="font-medium">{selectedMonth}</span>:
            </p>
            <ul className="space-y-2 pl-6">
              <li className="text-base text-stone-800 list-disc marker:text-emerald-700">
                <strong className="font-semibold text-emerald-700">{quarterLabel.split(' ')[0]} momentum:</strong>{' '}
                <strong className="font-semibold text-emerald-700">{metrics?.achievedThisMonth ?? 0} Key Results</strong>{' '}
                closed in {selectedMonth}.
              </li>
              <li className="text-base text-stone-800 list-disc marker:text-emerald-700">
                <strong className="font-semibold text-emerald-700">{metrics?.openThisQuarter ?? 0} Key Results</strong>{' '}
                remain in motion for {quarterLabel}, all on plan.
              </li>
            </ul>
          </div>

          {/* Achievements card — flat 3-col table */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-7">
            <div className="mb-5 flex items-center gap-2 flex-wrap text-xs uppercase tracking-wider font-semibold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <TrophyIcon className="w-4 h-4" strokeWidth={2} />
                <span>Achievements this period</span>
              </span>
              <span className="text-stone-300 normal-case">·</span>
              <span className="text-stone-600 normal-case tracking-normal">
                <span className="text-stone-900 font-semibold tabular-nums">{metrics?.achievedThisMonth ?? 0}</span> closed
              </span>
              <span className="text-stone-300 normal-case">·</span>
              <span className="text-stone-600 normal-case tracking-normal font-normal">{selectedMonth} {selectedYear}</span>
            </div>
            {/* ... table body ... */}
          </div>

          {/* Achievement Summary — collapsible */}
          <CollapsibleCard
            eyebrow="Achievement Summary"
            meta={`${selectedMonth} ${quarterLabel}`}
            meta2={`${leaders.length} leaders`}
          >
            {/* ... per-leader KR/KPI table body ... */}
          </CollapsibleCard>
        </>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
