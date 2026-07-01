# Brand Colors — Per-property palettes

> 🏛 **OFFICIAL STANDARD** — three brands, three palettes. Apps inherit the palette of the property they belong to. Mixing palettes across brands is a violation.

Rascal Republic is the **corporate / group ops** brand — navy + stone, calm-and-functional. Rinjani Bay and Samara Lombok are **boutique exclusive villa** properties — each carries its own natural-luxe palette inspired by the landscape (jungle/teal for Rinjani, sunset/ocean for Samara). Tooling apps for these properties still follow `PRINCIPLES.md` (Calm by Default + the four principles), but the accent palette honors the property's brand identity rather than the corporate navy.

---

## 1. Why three palettes, not one

| Brand              | Identity                                              | Used for                                                |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------- |
| **Rascal Republic** | Corporate. Functional. Quiet navy + stone.            | Internal ops tools: OKR Tracker, EPR, Leadership Portal, Account Portal. |
| **Rinjani Bay**     | Boutique villa. Magical, soulful, wild. Jungle + ocean. | Any Rinjani Bay app or guest-facing surface.            |
| **Samara Lombok**   | Boutique villa. Elevated tropical luxury. Sunset + ocean.| Any Samara Lombok app or guest-facing surface.          |

The **four principles still apply universally** — calm baseline, signal-over-decoration, function-before-form, loud-only-when-necessary. What changes per brand is **which colors carry the "loud" signal** and **which accent appears in the LoadingSpinner ring, link tone, and primary CTA emphasis**.

---

## 2. Rascal Republic (corporate)

> Live reference: [`okr.rascalrepublic.com`](https://okr.rascalrepublic.com). This is the visual DNA every Rascal app inherits.

| Token         | Hex       | Role                                                   |
| ------------- | --------- | ------------------------------------------------------ |
| `rr-primary`  | `#011132` | Dark navy — sidebar, login gradient anchor, brand H1.   |
| `rr-accent`   | `#3b82f6` | Blue — info state, attribution badges, **LoadingSpinner ring**. |
| `rr-success`  | `#10b981` | Emerald — completion, "yes commit" signal.             |
| `rr-warning`  | `#f59e0b` | Amber — at-risk, ≤7d countdown.                        |
| `rr-error`    | `#ef4444` | Red — invalid token, ≤3d, validation errors.           |

**Vibe:** Quiet, scannable, low-cognitive-load. The user is a busy operator — get out of the way.

**Boot LoadingSpinner ring:** blue `border-blue-200` track + `border-t-blue-600` active arc on `from-blue-50 via-white to-purple-50` gradient.

**Apps:** OKR Tracker, Rascal EPR, Leadership Portal, Account Portal, and every future Rascal group internal tool.

---

## 3. Rinjani Bay (boutique villa)

> Live reference: [`rinjanibay.com`](https://rinjanibay.com). Tagline: *"Where Nature Meets Nurture · Magical, soulful and wild."*

| Token              | Hex       | Role                                                       |
| ------------------ | --------- | ---------------------------------------------------------- |
| `rinjani-primary`  | `#007D80` | Deep jungle teal — sidebar, auth gradient anchor, brand H1. |
| `rinjani-accent`   | `#0E8A8A` | Turquoise — links, accents, **LoadingSpinner ring**.        |
| `rinjani-sand`     | `#E8DCC4` | Warm sand — secondary surfaces, hero overlays.             |
| `rinjani-leaf`     | `#5B7F50` | Tropical foliage green — eco-success states.               |
| `rinjani-success`  | `#10b981` | Emerald — "yes commit" CTA (kept from corporate kit so CTA semantic stays universal). |
| `rinjani-warning`  | `#f59e0b` | Amber — same as corporate (universal warning tone).        |
| `rinjani-error`    | `#ef4444` | Red — same as corporate (universal error tone).            |

**Vibe:** Barefoot luxury. Jungle-edge calm. Mt. Rinjani in the background, turquoise bay below. The interface still calm-by-default — the loudness comes from the brand's natural color, not from saturated UI states.

**Surface palette:**
- Body bg: `#FAF7F2` (warm cream off-white — *not* the cool corporate `bg-stone-50`).
- Card bg: `#FFFFFF` (pure white).
- Card border: `#E5DBC8` (faint warm hairline, NOT stone-200).
- Body text: `#1A2826` (deep teal-tinted near-black).
- Secondary text: `#5C6A68` (muted teal-grey).
- Muted text: `#8FA09D`.

**Boot LoadingSpinner ring:** `border-[#9FD4D4]` track + `border-t-[#0E8A8A]` active arc on a `from-[#E8F4F4] via-[#FAF7F2] to-[#E8DCC4]/40` gradient. The ring color = turquoise, not blue.

**Brand-gradient (auth screen + boot anchor):** `linear-gradient(135deg, #007D80 0%, #0E8A8A 100%)`.

**Logo variant rules** (same as the universal rule):
- `rinjanibay-navy.svg` → light surfaces (cream body, white cards, LoadingSpinner).
- `rinjanibay-white.svg` → on jungle-teal gradient (sidebar, login).
- `rinjanibay.png` → emails.

**Apps:** Any Rinjani Bay-branded surface — guest booking, concierge dashboard, internal ops, magic-link forms for Rinjani staff.

---

## 4. Samara Lombok (boutique villa)

> Live reference: [`samaralombok.com`](https://samaralombok.com). Tagline: *"An Elevated Hospitality Experience in South Lombok."*

| Token              | Hex       | Role                                                        |
| ------------------ | --------- | ----------------------------------------------------------- |
| `samara-primary`   | `#324720` | Deep forest green — sidebar, auth gradient anchor, brand H1. |
| `samara-accent`    | `#D4A648` | Sunset gold — links, accents, **LoadingSpinner ring**.       |
| `samara-sky`       | `#CFD4DB` | Pre-dawn sky — soft surface dividers, hero overlays.         |
| `samara-sand`      | `#F2E9DA` | South-Lombok sand — secondary surfaces.                      |
| `samara-success`   | `#10b981` | Emerald — "yes commit" CTA (universal).                      |
| `samara-warning`   | `#f59e0b` | Amber — universal.                                           |
| `samara-error`     | `#ef4444` | Red — universal.                                             |

**Vibe:** Elevated tropical luxury — sun-warmed sand, golden hour, dramatic ocean elevation. Calm-by-default still applies; the brand expresses itself through *warmth* (sunset gold) not loudness.

**Surface palette:**
- Body bg: `#FCFAF5` (cream-tinted off-white, warmer than corporate stone-50).
- Card bg: `#FFFFFF`.
- Card border: `#EDE5D2` (warm hairline).
- Body text: `#1F1B16` (warm near-black, slight bronze undertone).
- Secondary text: `#6B6259` (muted warm grey).
- Muted text: `#A89F92`.

**Boot LoadingSpinner ring:** `border-[#EBD9A8]` track + `border-t-[#D4A648]` active arc on a `from-[#F8EFD9] via-[#FCFAF5] to-[#CFD4DB]/30` gradient. The ring color = sunset gold, not blue.

**Brand-gradient (auth screen + boot anchor):** `linear-gradient(135deg, #324720 0%, #D4A648 100%)` — forest-to-sunset, the signature Samara mood. Use sparingly (auth + occasional hero).

**Logo variant rules** (same as universal):
- `samaralombok-navy.svg` → light cream surfaces, LoadingSpinner.
- `samaralombok-white.svg` → on the ocean-sunset gradient (sidebar, login).
- `samaralombok.png` → emails.

**Apps:** Any Samara Lombok-branded surface — guest booking, villa concierge dashboard, internal ops for Samara staff.

---

## 5. Boutique-villa-specific rules (Rinjani + Samara)

These rules **apply to Rinjani Bay and Samara Lombok only** — they reflect the boutique-exclusive-villa positioning. Rascal Republic ops apps continue under the corporate rules in DESIGN_SYSTEM.md.

1. **Warmer neutral.** Boutique surfaces use a cream-tinted off-white (`#FAF7F2` / `#FCFAF5`), not the cool `bg-stone-50`. The corporate stone is for tech tools; the villa palette is for hospitality.
2. **Brand accent in the LoadingSpinner ring.** Rascal apps use a blue ring; villa apps use the property's signature accent (Rinjani turquoise / Samara sunset gold). The ring is the most-seen brand touchpoint of a session.
3. **Brand-gradient is bi-tonal, not navy-to-navy.** Corporate Rascal uses `#011132 → #022050` (navy darkening). Villa brands use **brand-primary → brand-accent** (Rinjani: deep teal → turquoise; Samara: deep ocean → sunset gold). The gradient itself carries the brand mood.
4. **Quiet hospitality copy.** No corporate "Dashboard / Submitted / Approved" jargon. Use guest-friendly verbs ("Open booking", "Send arrival note", "Mark stay completed"). See `VOICE_AND_TONE.md` for the corporate baseline — villa apps soften it further.
5. **Imagery > illustration.** Villa surfaces often pair with full-bleed property photography. Hero photos must be **muted** (no oversaturation) so the calm-by-default principle holds. Photos are signal (place, mood) — not decoration.
6. **Submit/CTA still emerald.** Universal "yes commit" remains `bg-emerald-700` even on villa surfaces — the semantic universality is more valuable than per-brand consistency on this one button. The villa accent shows up in ring, links, eyebrow, and the brand gradient.

---

## 6. Picking the right palette in code

If you're building for one property only, hard-code the palette:

```ts
// src/lib/brand.ts (Rinjani Bay app)
export const palette = {
  primary: '#007D80',
  accent:  '#0E8A8A',
  sand:    '#E8DCC4',
  bg:      '#FAF7F2',
  text:    '#1A2826',
} as const;
```

If your app is multi-tenant (one deploy → multiple properties), use the brand-picker pattern from `SKILL.md → Pattern C`:

```ts
import { brandLogo, brandLabel, brandPalette } from '@rascal-ui-kit/lib/brand';
// brandPalette[brand].primary  → hex
// brandPalette[brand].accent   → hex
// brandPalette[brand].bg       → hex
```

---

## 7. Cross-brand consistency (what stays the same)

To keep the kit coherent across all three palettes:

- **Layout grid + radii + spacing** — identical across brands (radii: md/lg/xl/2xl/full; spacing: same scale).
- **Type scale** — identical pixel sizes; only the body font *family* is universal (Aptos → Inter → Segoe UI).
- **Status semantic colors** — emerald (success), amber (warning), red (error), blue (info) — universal. Don't recolor warnings to "fit the brand".
- **Material Symbols Rounded** — universal icon font. No brand-specific icon styles.
- **Emoji allowlist** — universal nine glyphs. No new emoji per brand.
- **Loading pattern** — branded `LoadingSpinner` template universal; only the **ring color + logo** vary per brand.
- **Voice & tone** — universal rules in `VOICE_AND_TONE.md`. Villa apps may soften copy further but never violate the anti-patterns ("Oops!" / marketing fluff / etc).

**What varies per brand:**

- Primary/accent hex tokens.
- Neutral warmth (cool stone for Rascal vs. warm cream for villa).
- LoadingSpinner ring + bg-gradient.
- Brand-gradient endpoints (auth + occasional hero).
- Logo asset (already documented in `assets/logo/README.md`).

---

## 8. Anti-patterns specific to villa brands

- ❌ Using `bg-stone-50` body on a Rinjani / Samara app — **fix:** use the brand's cream off-white (`#FAF7F2` / `#FCFAF5`).
- ❌ Blue LoadingSpinner ring on a villa app — **fix:** use the brand accent (turquoise for Rinjani, gold for Samara).
- ❌ Saturated stock-photo collages on hero sections — **fix:** muted, single-frame villa imagery; the photo is the signal, not decoration.
- ❌ Per-brand emerald drift (e.g., teal "submit" on Rinjani because "it matches better") — **fix:** keep emerald universal for `yes-commit`; brand expression goes in ring/accent/gradient, not in the submit button.
- ❌ Brand-gradient on in-app buttons (villa or corporate) — **fix:** gradient is for auth + occasional hero only. In-app CTAs are flat `bg-stone-900` / `bg-emerald-700`.
- ❌ Mixing two villa palettes on one screen (e.g., Samara gold ring on Rinjani teal body) — **fix:** the app belongs to exactly one property; never mix.
