# Animations

> 🏛 **OFFICIAL STANDARD** for loading states, transitions, and micro-interactions across Rascal apps.

Default principle: **subtle, fast, purposeful** — animations exist to communicate state change, not to entertain.

The canonical full-screen loader is the [`LoadingSpinner` component](../templates/components/LoadingSpinner.tsx). Inline / non-blocking variations live in [`assets/animations/animation_others/`](../assets/animations/animation_others/).

---

## 1. Loading states

### When to use which

| Loading situation                              | Animation                       |
| ---------------------------------------------- | ------------------------------- |
| App boot / auth boundary / full-screen suspense | **Branded LoadingSpinner**      |
| Initial page load, full-screen blocker          | Spinner SVG (40 px)             |
| Inline button loading state                    | Dots (16 px height)             |
| Background fetch / non-blocking refresh        | Top progress bar                |
| Content placeholder (known shape)              | Skeleton (no SVG)               |
| Pulse to draw attention to fresh data          | Pulse circle                    |

### Branded LoadingSpinner (production pattern)

The canonical full-screen loader for app boot + auth. Two-layer composition: brand logo pulsing at center + spinning ring orbiting around it. Keeps brand present, reads as "we're working", far less generic than a lone spinner.

> **Visual DNA reference:** [`okr.rascalrepublic.com`](https://okr.rascalrepublic.com) (live) · [`assets/animations/canonical-loading-preview.svg`](../assets/animations/canonical-loading-preview.svg) (static SVG, self-animating). Three-brand side-by-side: [`assets/animations/brand-loading-comparison.svg`](../assets/animations/brand-loading-comparison.svg).

Template: [templates/components/LoadingSpinner.tsx](../templates/components/LoadingSpinner.tsx) · Source: EPR-Service/src/components/LoadingSpinner.tsx.

#### Brand-bound variants (preferred — less boilerplate)

For each property the kit ships a pre-bound variant: logo + ring color + bg gradient are already wired. Just pass `appName`:

```tsx
// Rascal Republic corporate apps (OKR Tracker, EPR, Leadership Portal, Account Portal)
import RascalLoadingSpinner from '@rascal-ui-kit/templates/components/RascalLoadingSpinner';
<RascalLoadingSpinner appName="OKR Tracker" />

// Rinjani Bay boutique villa
import RinjaniLoadingSpinner from '@rascal-ui-kit/templates/components/RinjaniLoadingSpinner';
<RinjaniLoadingSpinner appName="Rinjani Concierge" />

// Samara Lombok boutique villa
import SamaraLoadingSpinner from '@rascal-ui-kit/templates/components/SamaraLoadingSpinner';
<SamaraLoadingSpinner appName="Samara Booking" />
```

Each variant uses the brand's signature accent for the ring (Rascal blue, Rinjani turquoise `#0E8A8A`, Samara sunset gold `#D4A648`) and the brand's tonal background gradient. See [BRAND_COLORS.md](BRAND_COLORS.md) for full per-brand palette tokens and rationale.

#### Base component (when you need custom ring/bg)

```tsx
import LoadingSpinner from '@rascal-ui-kit/templates/components/LoadingSpinner';
import logoUrl from '@rascal-ui-kit/assets/logo/rascalrepublic/rascalrepublic-navy.svg';

<LoadingSpinner
  appName="OKR Tracker"
  logoSrc={logoUrl}
  ringTrack="border-blue-200"
  ringActive="border-t-blue-600"
  bgClassName="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
/>
```

Recipe (Tailwind only, no SVG file needed) — Rascal corporate default:

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
  <div className="text-center space-y-6">
    <div className="relative">
      <div className="w-20 h-20 flex items-center justify-center mx-auto">
        <img src={logoSrc} alt="Logo" className="w-full h-full object-contain animate-pulse" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Loading {appName}</h2>
      <p className="text-sm text-stone-600">Please wait…</p>
    </div>
  </div>
</div>
```

Villa variants swap the ring + bg gradient only — the logo, layout, animation timing, and type are universal across all three.

#### Adoption status

| App           | Status                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| EPR-Service   | ✓ In production (`src/components/LoadingSpinner.tsx`)                   |
| OKR Tracker   | Not yet adopted — 10+ inline `animate-spin` usages, mostly small CSS rings. Migrate to this template when touching those surfaces. |

### Spinner SVG (default)

[assets/animations/animation_others/loading-spinner.svg](../assets/animations/animation_others/loading-spinner.svg) · Self-animating SVG, no JS needed.

```html
<img src="./assets/animations/animation_others/loading-spinner.svg" alt="Loading" width="40" height="40" />
```

### Dots (inline button)

[assets/animations/animation_others/loading-dots.svg](../assets/animations/animation_others/loading-dots.svg)

```tsx
{submitting ? (
  <img src="./assets/animations/animation_others/loading-dots.svg" alt="" width={60} height={16} />
) : (
  'Submit review →'
)}
```

### Bar (top of page)

[assets/animations/animation_others/loading-bar.svg](../assets/animations/animation_others/loading-bar.svg) · 200×4 px sweep.

```tsx
{loadingNewMonth && (
  <div className="absolute top-0 left-0 right-0">
    <img src="./assets/animations/animation_others/loading-bar.svg" className="w-full" alt="" />
  </div>
)}
```

### Pulse (attention)

[assets/animations/animation_others/loading-pulse.svg](../assets/animations/animation_others/loading-pulse.svg)

Use sparingly — only on first-load or after a state change that needs attention.

---

## 2. Transitions (Tailwind)

### Standard durations

| Class            | Duration | Use                                              |
| ---------------- | -------- | ------------------------------------------------ |
| `duration-75`    | 75ms     | Snap interactions (toggle, instant feedback)     |
| `duration-150`   | 150ms    | Hover state changes (default)                    |
| `duration-200`   | 200ms    | Card hover, button press                          |
| `duration-300`   | 300ms    | Modal open, sidebar slide                        |
| `duration-500`   | 500ms    | Page transition (rare)                            |

### Default classes

- Hover color/bg shift: `transition-colors` (150 ms ease default)
- Transform (rotate/translate/scale): `transition-transform`
- Width (progress bar fill): `transition-all` + custom duration

### Examples

**Chevron rotate on collapse toggle:**

```tsx
<ChevronDownIcon
  className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
/>
```

**Hover lift on row:**

```tsx
<button className="hover:bg-stone-50/60 transition-colors">…</button>
```

**Progress bar fill:**

```tsx
<div className="h-full bg-stone-900 transition-all" style={{ width: `${pct}%` }} />
```

---

## 3. Sticky / scroll behaviors

### Smooth scroll to anchor

When triggering an in-page jump (e.g., "View detail →" on Achievement Summary expands a row further down):

```tsx
setExpandedReport(reportId);
setTimeout(() => {
  document.getElementById('submission-status-anchor')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}, 0);
```

### Sticky bottom action bar (mobile, EPR magic-link form)

```tsx
<div className="sticky bottom-0 bg-white border-t border-stone-200 p-4 -mx-4">
  <div className="flex gap-2">
    <Button variant="secondary" onClick={prev}>← Back</Button>
    <Button variant="submit" onClick={next}>Next →</Button>
  </div>
</div>
```

### Focus reset on section change (screen-reader cue)

```tsx
const sectionTitleRef = useRef<HTMLHeadingElement>(null);

useEffect(() => {
  sectionTitleRef.current?.focus({ preventScroll: true });
}, [currentValueIdx]);

<h2 ref={sectionTitleRef} tabIndex={-1}>{section.title}</h2>
```

---

## 4. Micro-interactions

### Auto-save indicator

Right side of progress strip, fades in when save completes:

```tsx
<span className="ml-2 text-emerald-700">· Auto-saved · close & resume anytime</span>
```

### Hover state for clickable card

```tsx
<button className="hover:bg-stone-50/60 transition-colors">…</button>
```

For EPR's team row (light hover):

```tsx
<button className="w-full text-left py-3.5 px-1 hover:bg-stone-50/60 transition-colors">…</button>
```

### Status badge pulse (live data only)

Indicate "live" data with a small pulsing dot:

```tsx
<span className="inline-flex items-center gap-1.5">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
  </span>
  Live
</span>
```

Tailwind built-in `animate-ping` (no SVG needed).

---

## 5. Modal / overlay transitions

### Fade in overlay

```tsx
<div className="fixed inset-0 bg-black/50 z-50 transition-opacity">
  <div className="bg-white rounded-2xl shadow-2xl max-w-md animate-in fade-in zoom-in-95 duration-200">
    ...
  </div>
</div>
```

Use `tailwindcss-animate` plugin classes (`animate-in fade-in zoom-in-95`). For older Tailwind versions without the plugin, build inline keyframes.

### Bottom sheet (mobile, EPR section picker)

```tsx
<div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-50
                animate-in slide-in-from-bottom duration-300">
  ...
</div>
```

---

## 6. Anti-patterns

- ❌ Animating layout properties (width, height, top, left) — causes layout thrash. Use `transform: translate()` and `transform: scale()` instead.
- ❌ Duration > 500 ms for interactive feedback — feels sluggish.
- ❌ Animating purely decorative SVG when CSS keyframes would do.
- ❌ Auto-animating on every render — only animate state changes, not initial mount (unless explicitly intended).
- ❌ Spinner shown for < 300 ms operations — adds perceived lag. Use optimistic UI instead.
- ❌ Bouncing / shake animation on errors — alarming and doesn't help recovery. Use color + text instead.

---

## 7. Accessibility

- All transition utilities respect `prefers-reduced-motion`. Tailwind 4 auto-applies `motion-reduce:transition-none`.
- For custom SVG animations (the ones in `assets/animations/`), users with `prefers-reduced-motion: reduce` will still see the animation since SVG SMIL doesn't auto-disable. If this matters, gate with JS:

```tsx
const reduceMotion = useReducedMotion();
{reduceMotion
  ? <span>Loading…</span>
  : <img src="./loading-spinner.svg" alt="Loading" />
}
```

- Loading text alternatives: every `<img>` of a loading animation has `alt="Loading"` so screen readers announce the state.
