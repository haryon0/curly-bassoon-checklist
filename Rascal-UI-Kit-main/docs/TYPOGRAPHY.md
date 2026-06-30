# Typography

> 🏛 **OFFICIAL STANDARD** — single font stack across all Rascal apps. Use this stack verbatim in `index.css` / `tailwind.config.*` / email templates.

---

## The font stack

```css
font-family:
  'Aptos', 'Aptos Display',
  'Inter', 'Inter Variable',
  'Segoe UI Variable', 'Segoe UI',
  system-ui, -apple-system, BlinkMacSystemFont,
  'Helvetica Neue', Helvetica, Arial,
  sans-serif;
```

### Why this order

| Priority | Font                          | Available where                                 | Why first?                                          |
| -------- | ----------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| 1        | **Aptos** / Aptos Display     | Windows 11 + Microsoft 365                       | Brand-aligned with the Microsoft ecosystem most leaders work in; clean, modern, neutral. |
| 2        | **Inter** / Inter Variable     | Open-source, bundled in EPR; web-loadable        | Closest open-source twin of Aptos — same geometric sans, free, well-hinted at small sizes. |
| 3        | **Segoe UI Variable** / Segoe UI | Windows fallback; Microsoft email clients        | Already used in recap email templates — keeps email + app visually coherent. |
| 4        | `system-ui` / `-apple-system` / `BlinkMacSystemFont` | macOS, iOS, Linux       | Native fallback on non-Microsoft platforms.          |
| 5        | Arial / Helvetica / sans-serif | Universal                                       | Last-resort fallback — won't be reached in practice. |

### Why "similar to Aptos"

Aptos is a humanist sans-serif by Steve Matteson. It carries Microsoft 365's identity, is genuinely well-designed for screens at small sizes, and is what most leaders in Microsoft-shop organisations see daily. Choosing fonts in the same family (geometric, neutral, slightly humanist) keeps cross-app and cross-medium typography quiet — exactly the **Calm by Default** principle ([PRINCIPLES.md](PRINCIPLES.md)).

Inter is the open-source path to the same look. Apps loading Aptos lazily fall through to Inter without visual jolt; apps that haven't loaded any web font fall through to Segoe UI (the in-OS fallback that most closely resembles both).

---

## Type scale (Tailwind)

Use these classes directly — they map to the kit's standard scale.

| Role                       | Tailwind class                                                  | Pixel size  |
| -------------------------- | --------------------------------------------------------------- | ----------- |
| Eyebrow (label)            | `text-xs uppercase tracking-wider text-stone-500 font-semibold` | 12px        |
| Eyebrow (tiny)             | `text-[10px] uppercase tracking-wider text-stone-500`             | 10px        |
| Hint / caption             | `text-[11px] text-stone-500`                                      | 11px        |
| Body                       | `text-sm text-stone-600`                                          | 14px        |
| Body emphasised            | `text-sm font-medium text-stone-900`                              | 14px        |
| Link                       | `text-sm text-blue-600 hover:underline`                           | 14px        |
| H3 sub-section             | `text-base font-semibold text-stone-900`                          | 16px        |
| H2 section                 | `text-lg font-semibold text-stone-900 tracking-tight`             | 18px        |
| H1 page                    | `text-2xl font-semibold text-stone-900 tracking-tight`            | 24px        |
| Display number (stat card) | `text-3xl font-semibold tabular-nums`                             | 30px        |

### Numerics

Always use `tabular-nums` (Tailwind utility) on:
- Stat card values
- Ratios in tables (`2/5`, `1/1`)
- Percentages
- Counts in columns where rows compare vertically

Aptos and Inter both ship tabular figure variants — the `tabular-nums` utility flips on `font-variant-numeric: tabular-nums` so digits align across rows without visual jitter.

### Feature settings (Inter / Aptos)

When the active font is Inter or Aptos, enable these OpenType features for higher visual quality at small sizes:

```css
body {
  font-feature-settings: 'cv11', 'ss01', 'ss03';
  /* cv11 — alternative single-story a   (closer to Aptos)
   * ss01 — open digits (better at small sizes)
   * ss03 — alternative round-dotted letters
   */
}
```

These are silently ignored by fonts that don't ship them — safe to apply globally.

---

## Application across surfaces

| Surface                          | Font stack                                                | Notes                                  |
| -------------------------------- | --------------------------------------------------------- | -------------------------------------- |
| In-app body (OKR Tracker, EPR)   | Standard stack (above)                                    | Set in each app's `index.css`           |
| Email templates                  | `'Segoe UI', system-ui, -apple-system, sans-serif`         | Email clients strip web fonts — start from Segoe UI which most email clients have |
| Login / auth screens             | Standard stack                                            |                                        |
| Material Symbols icon glyphs      | `'Material Symbols Rounded'` — **excluded** from inheritance | See exclusion below                    |

### Icon font exclusion

Material Symbols Rounded ships its own font; if the Tailwind body font cascades into icon spans, glyphs render as `?`. Exclude in `index.css`:

```css
*:not(.material-symbols-rounded):not(.material-symbols-outlined):not(.material-symbols-sharp) {
  font-family:
    'Aptos', 'Aptos Display',
    'Inter', 'Inter Variable',
    'Segoe UI Variable', 'Segoe UI',
    system-ui, -apple-system, BlinkMacSystemFont,
    'Helvetica Neue', Helvetica, Arial, sans-serif;
}
```

---

## Loading the fonts

### Inter (recommended self-hosted)

```ts
// vite.config.ts or any entry
import '@fontsource-variable/inter';
```

Or via `<link>` in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```

### Aptos

Aptos is **not on Google Fonts**. Licensed via Microsoft for Microsoft 365 / Windows 11 users — it'll resolve locally for those users automatically. Don't try to host it; fall through to Inter for non-Microsoft users.

### Segoe UI

OS-bundled on Windows; no loading needed.

---

## Anti-patterns

- ❌ Mixing fonts within a surface (e.g. one card uses Inter, the next uses system default — happens when one component sets `font-family` inline).
- ❌ Loading a web font without `font-display: swap` — causes flash of invisible text.
- ❌ Using a different font for emails — break the brand-coherent feel. Use Segoe UI in emails, Aptos/Inter in app.
- ❌ Using `text-xl` for stat values — they need `tabular-nums`, use `text-3xl font-semibold tabular-nums` for columns of numbers.
- ❌ Hand-rolled font-weight numbers (`font-[510]`) — use Tailwind's `font-normal` / `font-medium` / `font-semibold` so the kit can swap fonts later without breaking weights.
