# Dashboard Patterns

> 🏛 **OFFICIAL STANDARD** — reusable layout patterns extracted from production work across **OKR Tracker** and **Rascal EPR**.

Each pattern documents: when to use, the algorithm, and the visual recipe. New dashboard surfaces in any Rascal app **MUST** consult this catalog before inventing a new layout — if your need matches a pattern below, use it. If it doesn't, propose a new pattern via PR.

---

## 1. Smart-dashboard gate

> Hide derived/summary sections until the source data is complete. Show a placeholder card with an action instead.

### When to use

- Final-summary surfaces where partial data would mislead (e.g., monthly recap, after-cycle review)
- Surfaces shared between a dashboard and a scheduled email — should appear in dashboard only when the email *would* be sent

### Algorithm

```ts
const allLeadersSubmitted = (() => {
  if (leaders.length === 0) return false;
  const submittedIds = new Set<string>();
  for (const r of currentMonthReports) {
    const id = r.userId || r.leaderId;
    if (id) submittedIds.add(id);
  }
  return submittedIds.size >= leaders.length;
})();
```

Apply the gate to **every** section that's part of the summary so they all appear/disappear together:

```tsx
{/* Section 1 */}
{(() => {
  if (!allLeadersSubmitted) return null;
  // ... render
})()}

{/* Section 2 */}
{(() => {
  if (!allLeadersSubmitted) return null;
  // ... render
})()}

{/* Placeholder card — visible when gate is closed */}
{(() => {
  if (allLeadersSubmitted) return null;
  return <SmartGateCard ... />;
})()}
```

### Placeholder card recipe

```tsx
<div className="bg-stone-50 border border-stone-200 rounded-xl p-6 md:p-7">
  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
    <div>
      <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
        Summary · {month} {year}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 tracking-tight">
        Final summary appears here once all leaders submit
      </h3>
    </div>
    <div className="text-sm text-stone-600 shrink-0">
      <span className="text-stone-900 font-semibold tabular-nums">{submitted}</span>
      <span className="text-stone-400"> / </span>
      <span className="tabular-nums">{total}</span>
      <span className="ml-1 text-stone-500">leaders reported</span>
    </div>
  </div>

  <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden mb-3">
    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
  </div>

  <p className="text-sm text-stone-600 leading-relaxed mb-4">
    Waiting on Russell, Maya, Perry.
  </p>

  <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md">
    Send reminder to 3 pending →
  </button>
</div>
```

Template: [templates/patterns/SmartGateCard.tsx](../templates/patterns/SmartGateCard.tsx)

---

## 2. Email-dashboard sync

> When the same number renders in two places, it must come from the same source. Document the invariant explicitly.

### The problem

A dashboard shows "Q2 momentum: 2 KRs closed in April" and the recap email shows "Q2 momentum: 3 KRs closed in April". Leaders see both → they don't trust either.

### The pattern: shared algorithm + cross-reference comments

1. **Extract the formatter** to a shared module (`services/momentumBullet.ts`).
2. **Compute inputs** with email-identical rules (case-sensitive status, identical inactive list). Done in `services/objectiveSnapshotService.ts → MomentumMetrics`.
3. **Reference comments** in both files reminding future maintainers:

```ts
// services/momentumBullet.ts
/**
 * CRITICAL: the algorithm below MUST stay bit-for-bit identical to the
 * email's inline logic (search "momentumBullet" in recapEmailTemplate.ts).
 */
```

```ts
// functions/src/utils/recapEmailTemplate.ts
// SYNCED-WITH-DASHBOARD: this decision tree is duplicated in
// services/momentumBullet.ts. Change here must mirror there same commit.
```

### Algorithm — momentum bullet decision tree

```ts
function momentumBullet({ quarterAchieved, monthlyAchieved, quarterShort, monthName }) {
  if (quarterAchieved === 0) {
    return `${quarterShort} ramping up — no closures yet this quarter.`;
  } else if (monthlyAchieved === 0) {
    return `${quarterShort} holds at ${quarterAchieved} KRs closed (no new wins in ${monthName}).`;
  } else if (quarterAchieved === monthlyAchieved) {
    return `${quarterShort} momentum: ${quarterAchieved} KRs closed in ${monthName}.`;
  } else {
    return `${quarterShort} momentum: ${quarterAchieved} KRs closed this quarter (+${monthlyAchieved} in ${monthName}).`;
  }
}
```

---

## 3. Notion DB-style list

> Quiet, scannable list with hairline rows. No card chrome per row, no badges per row, no per-row buttons — just typography + ratios.

### When to use

- Executive surfaces with 5-30 rows
- Tables where every row has the same shape (no special "highlighted" row)
- When the user will scan, not click — minimize visual interrupts

### Visual recipe

```
HEADER COL 1                                              HEADER COL 2
─────────────────────────────────────────────────────────────────
Row content                                                Meta
Row content (bold if complete)                             Meta
Row content                                                Meta
```

### React recipe

```tsx
<div className="bg-white rounded-xl border border-stone-200 p-6 md:p-7">
  <div className="mb-6">
    <div className="text-xs uppercase tracking-wider text-stone-500 mb-1.5 font-medium">
      Objectives
    </div>
    <h3 className="text-lg font-semibold text-stone-900 tracking-tight">
      How we're moving as an organization
    </h3>
    <p className="text-sm text-stone-500 mt-1.5">Snapshot of April 2026</p>
  </div>

  <div className="grid grid-cols-[1fr_180px] gap-6 px-1 pb-2.5 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-100">
    <div>Objective</div>
    <div>Lead</div>
  </div>

  {rows.map(r => (
    <div key={r.id} className="border-b border-stone-100">
      <button className="w-full text-left py-3.5 px-1 hover:bg-stone-50/60 grid grid-cols-[1fr_180px] gap-6 items-baseline">
        <span className={`text-base leading-snug font-semibold ${r.isComplete ? 'text-emerald-700' : 'text-stone-900'}`}>
          {r.title}
        </span>
        <span className="text-sm text-stone-600 truncate">{r.leadLabel}</span>
      </button>
    </div>
  ))}
</div>
```

Template: [templates/patterns/NotionDbList.tsx](../templates/patterns/NotionDbList.tsx)

---

## 4. Collapsible "View details" section

> Sections that contain detail-on-demand info should default to **closed** with an explicit "View details ⌄" affordance.

### When to use

- Sections that aren't the primary read but executives may want to drill into
- Long tables that crowd the dashboard

### Recipe

```tsx
const [open, setOpen] = useState(false);

<div className="bg-white rounded-xl border border-stone-200 p-6 md:p-7">
  <button
    onClick={() => setOpen(v => !v)}
    className="w-full flex items-center justify-between gap-4"
  >
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
      <span className="text-stone-600">Achievement Summary</span>
      <span className="text-stone-300 normal-case">·</span>
      <span className="text-stone-500 normal-case tracking-normal font-normal">April Q2 2026</span>
    </div>
    <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 shrink-0">
      {open ? 'Hide details' : 'View details'}
      <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </span>
  </button>

  {open && (
    <div className="mt-5">
      {/* ... table or content ... */}
    </div>
  )}
</div>
```

Template: [templates/patterns/CollapsibleCard.tsx](../templates/patterns/CollapsibleCard.tsx)

---

## 5. Inline header with eyebrow + meta

> Replace stacked header (eyebrow line / title line / meta line) with a single inline horizontal flow when content is brief.

### Recipe

```tsx
<div className="mb-5 flex items-center gap-2 flex-wrap text-xs uppercase tracking-wider font-semibold">
  <span className="inline-flex items-center gap-1.5 text-emerald-700">
    <TrophyIcon className="w-4 h-4" strokeWidth={2} />
    <span>Achievements this period</span>
  </span>
  <span className="text-stone-300 normal-case">·</span>
  <span className="text-stone-600 normal-case tracking-normal">
    <span className="text-stone-900 font-semibold tabular-nums">2</span> closed
  </span>
  <span className="text-stone-300 normal-case">·</span>
  <span className="text-stone-600 normal-case tracking-normal font-normal">April 2026</span>
</div>
```

Uses `flex items-center gap-2 flex-wrap` so it wraps gracefully on mobile. Each segment's `normal-case` + `tracking-normal` overrides the parent's uppercase + tracking-wider.

---

## 6. Phase chip (EPR Manager Dashboard)

> 5-state collapsed view of a 10-state workflow status. Used on team-member rows to give at-a-glance phase context.

### Visual

```
PHASE_CHIP: [   Self-Review   ]   blue tone, ring outline
PHASE_CHIP: [   Reviewers     ]   purple tone
PHASE_CHIP: [   Manager       ]   amber tone
PHASE_CHIP: [   Calibration   ]   indigo tone
PHASE_CHIP: [   Done          ]   emerald tone
```

### Mapping function

```ts
function phaseFromStatus(s: ReviewWorkflowStatus): Phase {
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
  }
}
```

Template: [templates/components/PhaseChip.tsx](../templates/components/PhaseChip.tsx)

---

## 7. Panel progress bar + ratio (EPR)

> Mini horizontal progress bar with `submitted / total` count. Used for reviewer-panel progress on team-member rows.

### Recipe

```tsx
const pct = total === 0 ? 0 : Math.round((submitted / total) * 100);
const tone = pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-stone-400';

<div className="flex items-center gap-2" title={`${submitted}/${total} reviewers submitted`}>
  <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
    <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
  </div>
  <span className="text-[11px] tabular-nums text-stone-600 w-8 text-right">{submitted}/{total}</span>
</div>
```

Template: [templates/components/PanelProgress.tsx](../templates/components/PanelProgress.tsx)

---

## 8. Avatar (initials, EPR)

> Cheap, accessible avatar for team-member rows. No image dependency, no Avatar lib.

```tsx
const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

<div className="shrink-0 w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[11px] font-semibold text-stone-600">
  {initials || '·'}
</div>
```

Template: [templates/components/Avatar.tsx](../templates/components/Avatar.tsx)

---

## 9. Countdown pill

> 3-tier urgency pill — used in dashboard greeting to surface deadline pressure.

```tsx
<div className={`text-[11px] px-2.5 py-1 rounded-full ring-1 ring-inset ${
  daysLeft <= 3  ? 'bg-red-50    text-red-700    ring-red-200'    :
  daysLeft <= 7  ? 'bg-amber-50  text-amber-700  ring-amber-200'  :
                   'bg-stone-50  text-stone-600  ring-stone-200'
}`}>
  {daysLeft > 0
    ? `Cycle locks in ${daysLeft}d`
    : daysLeft === 0 ? 'Locks today'
    : `Locked ${Math.abs(daysLeft)}d ago`}
</div>
```

---

## 10. Cycle stepper — fluid, no overflow (EPR)

> 6-step PDF-aligned stepper. Earlier version used fixed `min-w-[64px]` per step which overflowed narrow containers.

### Key rule

**Each step `shrink-0`, connector lines `flex-1`.** Let the wrapper drive size.

### Recipe

```tsx
{STEPS.map((s, i) => {
  const done = i < safeIdx || (i === safeIdx && isComplete);
  const active = i === safeIdx && !isComplete;
  const dotColor = done ? 'bg-emerald-500 text-white'
                 : active ? 'bg-stone-900 text-white ring-4 ring-stone-200'
                 : 'bg-stone-200 text-stone-500';
  const lineColor = i < safeIdx ? 'bg-emerald-500' : 'bg-stone-200';
  return (
    <React.Fragment key={s.key}>
      <div className="flex flex-col items-center text-center shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${dotColor}`}>
          {done ? '✓' : i + 1}
        </div>
        <div className={`text-[10px] mt-1.5 leading-tight ${active ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
          {s.label}
        </div>
      </div>
      {i < STEPS.length - 1 && (
        <div className={`flex-1 h-0.5 ${lineColor} mt-3.5 mx-1`} />
      )}
    </React.Fragment>
  );
})}
```

Template: [templates/components/CycleStepper.tsx](../templates/components/CycleStepper.tsx)

---

## 11. Section anatomy

Every dashboard section follows the same skeleton:

```
[Greeting + eyebrow + countdown pill]      ← max-w-{4|5|6}xl mx-auto p-6
[Optional spotlight card]                  ← "Your own review" / "Cycle locks"
[Stat grid — 2 / 4 cols]                   ← StatCard × 4
[Primary action list]                      ← To-do / Quick actions / Funnel
[Secondary list / table]                   ← Team / At-risk / Recent activity
```

Patterns 1–4 are interchangeable building blocks within this skeleton. Match the section's information weight to the appropriate pattern:

| Section purpose                     | Pattern                              |
| ----------------------------------- | ------------------------------------ |
| Final-summary surface, exec scan    | Notion DB-style list (#3)            |
| Conditional summary                  | Smart-dashboard gate (#1)            |
| Drill-in detail (optional)          | Collapsible card (#4)                |
| Single insight + meta                | Inline header (#5)                   |
| Per-status row decoration (EPR)     | Phase chip (#6) + Avatar (#8)        |
| Progress within row                 | Panel progress (#7) / Stepper (#10)  |

---

## 12. Voice & copy

- **Humanise step labels.** "Set up · Choose reviewers · Sent ✓" — not "Step 1: Cycle metadata".
- **Action verbs in CTAs.** "Open →", "Continue Self-Review →", "Submit review ✓" — not "Click here", "Go".
- **Time deltas in plain English.** "Cycle locks in 3d" — not "Cycle ends 2026-05-15".
- **Anonymity is loud.** Surface attribution in the form footer and in every recap email.
- **No marketing fluff.** Internal tool — short, factual, second person.
