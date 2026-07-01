# Design System — Rascal UI Kit

> 🏛 **OFFICIAL STANDARD** for all Rascal apps.
> React 19 + Tailwind 4 (Vite plugin) · Material Symbols Rounded for iconography.

This doc is the canonical token reference. **Apps MUST follow these tokens**; deviations require a documented exception in the app's code.

When a class string here conflicts with what's actually in a consuming app, **fix the app** — the doc tracks current Rascal-wide convention, the app's drift is the bug.

---

## 1. Brand foundation

### Brand colors

Defined via Tailwind 4 `@theme` in each app's `src/index.css`. Both `rr-*` and `brand-*` aliases resolve to the same hex.

| Token         | Hex       | Role                                                   |
| ------------- | --------- | ------------------------------------------------------ |
| `rr-primary`  | `#011132` | Dark navy — sidebar bg, login gradient anchor, brand H1 |
| `rr-accent`   | `#3b82f6` | Blue — info state, secondary links, attribution badges  |
| `rr-success`  | `#10b981` | Emerald — completion, "Verified link", auto-saved hint  |
| `rr-warning`  | `#f59e0b` | Amber — at-risk, pending manager, ≤7d countdown        |
| `rr-error`    | `#ef4444` | Red — invalid token, urgent ≤3d, validation errors     |

### Neutral scale

Tailwind `stone-*` is the only neutral. Do not mix in `gray-*`/`slate-*`/`zinc-*` (legacy code may use `gray-*` from pre-rebrand — migrate when touched).

| Use                         | Class               |
| --------------------------- | ------------------- |
| Page background             | `bg-stone-50` (`#f9fafb`) — also body bg |
| Card background             | `bg-white`          |
| Card border                 | `border-stone-200`  |
| Hairline divider            | `divide-stone-100` / `border-stone-100` |
| Body text                   | `text-stone-900`    |
| Secondary body              | `text-stone-600`    |
| Muted / hint                | `text-stone-500`    |
| Disabled                    | `text-stone-400`    |
| Pill bg (neutral)           | `bg-stone-100`      |

### Typography

- **Font stack** (global) — see [TYPOGRAPHY.md](TYPOGRAPHY.md) for full doc:
  ```
  'Aptos', 'Aptos Display', 'Inter', 'Inter Variable',
  'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system,
  BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif
  ```
- **Icon font** (excluded from inheritance): `material-symbols-rounded` (preferred), `material-symbols-outlined`, `material-symbols-sharp`
- **Numerics** in stat values: add `tabular-nums` so digits align across rows

### Radii & shadows

| Use                  | Class            |
| -------------------- | ---------------- |
| Card                 | `rounded-xl`     |
| Score / list item    | `rounded-lg`     |
| Button / chip        | `rounded-md`     |
| Pill / dot           | `rounded-full`   |
| Modal                | `rounded-2xl`    |
| Card lift            | `shadow-sm`      |
| Modal / dropdown     | `shadow-lg`      |
| Login card           | `shadow-2xl`     |

---

## 2. Layout

### Page widths

| Surface                       | Wrapper           |
| ----------------------------- | ----------------- |
| HR Dashboard                  | `max-w-6xl`       |
| Manager Dashboard             | `max-w-5xl`       |
| Magic-link Dispatcher / admin | `max-w-5xl`       |
| Employee Dashboard            | `max-w-4xl`       |
| Self-Review (login)           | `max-w-3xl`       |
| Magic-link reviewer (public)  | `max-w-3xl`       |
| Terminal-state card           | `max-w-md`–`max-w-xl` |
| Login form                    | `max-w-md`        |
| Executive Overview (OKR)      | `max-w-7xl`       |

### Page padding

- Dashboard / admin: `p-6` or `md:p-7` for larger cards
- Public reviewer form (no sidebar): `py-6 px-4`
- Section cards: inner `p-5` or `p-6`
- Dense rows: `p-3` or `py-3 px-0`

### Grids

- 4-up stat row: `grid grid-cols-2 md:grid-cols-4 gap-3`
- Form / split: `grid md:grid-cols-2 gap-5`
- Vertical stack: `space-y-5`
- Notion-DB table: `grid grid-cols-[1fr_180px]` (use arbitrary tracks for fluid columns)

---

## 3. Typography hierarchy

| Role           | Class                                                      |
| -------------- | ---------------------------------------------------------- |
| Eyebrow        | `text-xs uppercase tracking-wider text-stone-500 font-semibold` |
| Eyebrow (tiny) | `text-[10px] uppercase tracking-wider text-stone-500`        |
| H1 page title  | `text-2xl font-semibold text-stone-900 tracking-tight`     |
| H2 section     | `text-lg font-semibold text-stone-900 tracking-tight`      |
| H3 sub-section | `text-base font-semibold text-stone-900`                   |
| Display number | `text-3xl font-semibold tabular-nums` (color = tone)       |
| Body           | `text-sm text-stone-600`                                   |
| Hint           | `text-[11px] text-stone-500`                               |
| Link           | `text-sm text-blue-600 hover:underline`                    |

**Greeting pattern** (used on every dashboard):

```tsx
<div className="text-[11px] uppercase tracking-wider text-stone-500">Manager Dashboard</div>
<h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Hi, Putu 👋</h1>
<p className="text-sm text-stone-600 mt-1">Active cycle: <b>H1 2026</b></p>
```

---

## 4. Iconography

### Two-track system

1. **Material Symbols Rounded** — primary UI icons (sidebar, action buttons, header chrome). 18 px in sidebar, 22 px in dashboard quick-actions.
   ```tsx
   <span className="material-symbols-rounded text-blue-600" style={{ fontSize: 22 }}>send</span>
   ```
2. **Heroicons outline** — used in OKR Tracker (`@heroicons/react/24/outline`). Section eyebrow anchors: `FlagIcon`, `TrophyIcon`, `ChevronDownIcon`.
3. **Emoji** — domain / status signals where a Material icon would be over-engineered. Tight allowlist below.

### Emoji allowlist

| Glyph | Meaning              | Where used                                          |
| ----- | -------------------- | --------------------------------------------------- |
| `👋`  | Greeting             | Every dashboard H1                                  |
| `✓`   | Completion mark      | Cycle stepper dot, section tab, auto-save hint, stepper-done state |
| `✅`  | Approve action       | ApprovalPanel button label only                     |
| `⚠️`  | At-risk / warning    | At-risk panel header, warning workflow badges       |
| `📭`  | No active cycle      | Employee + HR empty state                           |
| `🔗`  | Magic-link invite    | Manager Dashboard to-do icon                        |
| `📝`  | Manager-review form  | Manager Dashboard to-do icon                        |
| `🎉`  | Submission success   | Self-review submitted card                          |
| `🎯`  | Objective marker     | Email recap subtitle / objective row                |

**Do not** introduce new emoji ad hoc. Either reuse from this set or add a Material Symbol / Heroicon.

---

## 5. Color tokens (semantic)

Tones are not paint chips — they encode meaning. Reuse the same tone in the same role across the app.

| Tone      | Meaning                                          | Card bg / border          | Value text          |
| --------- | ------------------------------------------------ | -------------------------- | ------------------- |
| `neutral` | Counts, generic data                             | `bg-white` / `border-stone-200` | `text-stone-900`    |
| `ok`      | Done, signed off, ≥80 % submission rate           | `bg-emerald-50` / `border-emerald-200` | `text-emerald-700` |
| `warn`    | At-risk, urgent to-do, ≤7d countdown             | `bg-amber-50` / `border-amber-200`     | `text-amber-700`   |
| `risk`    | Error, ≤3d countdown, validation failure         | `bg-red-50` / `border-red-200`         | `text-red-700`     |
| `info`    | New / pending review, attribution attributed     | `bg-blue-50` / `border-blue-200`       | `text-blue-700`    |

### Workflow status (EPR, 10 states)

Two intensities per phase: pending (50) vs collected/submitted (100). Anchor color carries phase identity.

| Status              | Background       | Text             |
| ------------------- | ---------------- | ---------------- |
| `prep_window`       | `bg-stone-100`   | `text-stone-600` |
| `self_pending`      | `bg-blue-50`     | `text-blue-700`  |
| `self_submitted`    | `bg-blue-100`    | `text-blue-800`  |
| `360_pending`       | `bg-purple-50`   | `text-purple-700`|
| `360_collected`     | `bg-purple-100`  | `text-purple-800`|
| `manager_pending`   | `bg-amber-50`    | `text-amber-700` |
| `manager_submitted` | `bg-amber-100`   | `text-amber-800` |
| `calibration`       | `bg-indigo-50`   | `text-indigo-700`|
| `approved`          | `bg-emerald-50`  | `text-emerald-700`|
| `signed_off`        | `bg-emerald-100` | `text-emerald-800`|

Badge shape: `inline-block px-2 py-0.5 rounded text-[11px] font-medium`.

### Phase chips (EPR Manager Dashboard, 5 phases)

Used on team rows to compress the 10-state space into a glanceable phase. `ring-1 ring-inset` outline keeps rows visually quiet.

| Phase         | Class block                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `prep`        | `bg-stone-100 text-stone-700 ring-stone-200`                                 |
| `self`        | `bg-blue-50 text-blue-700 ring-blue-200`                                     |
| `panel`       | `bg-purple-50 text-purple-700 ring-purple-200`                               |
| `manager`     | `bg-amber-50 text-amber-700 ring-amber-200`                                  |
| `calibration` | `bg-indigo-50 text-indigo-700 ring-indigo-200`                               |
| `done`        | `bg-emerald-50 text-emerald-700 ring-emerald-200`                            |

Shape: `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset`.

---

## 6. Buttons

| Variant            | Class                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Primary**        | `px-5 py-2 bg-stone-900 text-white text-sm font-medium rounded-md hover:bg-stone-800`        |
| **Secondary**      | `px-4 py-2 bg-white border border-stone-300 text-stone-800 rounded-md hover:border-stone-500`|
| **Success / submit** | `px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-md hover:bg-emerald-800`  |
| **Brand (auth)**   | Gradient `linear-gradient(135deg, #011132 0%, #022050 100%)` + `text-white font-bold rounded-lg shadow-lg` |
| **Soft pill**      | `inline-flex items-center text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded`|
| **Disabled**       | append `disabled:opacity-40` (or `disabled:opacity-50` for success)                          |

Primary uses **stone-900** (near-black) rather than brand-primary navy for in-app actions — keeps the page calm and reserves brand navy for the sidebar and auth screen.

## 7. Inputs

```tsx
<input
  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md
             focus:outline-none focus:ring-1 focus:ring-stone-500"
/>
```

Textarea — same classes, add `resize-y`. Select — same classes + `bg-white`. Login inputs use `rounded-lg` + `focus:ring-2 focus:ring-[#011132]` for a slightly heavier brand-led treatment.

---

## 8. Anti-patterns

- ❌ Inline brand navy `#011132` as button color in-app — reserves to sidebar/login only. Use `bg-stone-900` instead.
- ❌ New emoji not in the allowlist — pick a Material Symbol Rounded glyph, or reuse from the existing set.
- ❌ Negative margins on stepper connector lines (`mt-[-18px]` style) — keeps the visual aligned only in one specific size. Use fluid `flex-1` layout instead.
- ❌ Fixed-width inner stepper inside a smaller wrapper — content overflows. Use `flex-1` segments and let the wrapper drive the size.
- ❌ Mixing `gray-*` and `stone-*` neutrals on the same surface.
- ❌ Adding "Approve" / "Submit" buttons in non-emerald tone — emerald is the "yes, commit" signal.
- ❌ Showing the same number in email and dashboard with different algorithms — see [DASHBOARD_PATTERNS.md → Email-dashboard sync](DASHBOARD_PATTERNS.md).
