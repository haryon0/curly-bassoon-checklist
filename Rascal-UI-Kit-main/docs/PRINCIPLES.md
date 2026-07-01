# Design Principles

> 🏛 **OFFICIAL STANDARD** — the philosophy behind every token, pattern, and component in this kit.

Rascal apps are **internal tools used daily by busy operators** — leaders scanning a dashboard at 7am, HR closing a review at end-of-quarter, finance dropping a number before a deadline. The UI's job is to **get out of the way**, not to demand attention.

If a design decision contradicts these principles, the principles win.

---

## North-Star: **Calm by Default**

> Quiet, low-friction, low-cognitive-load. The interface should fade into the background; the user's work should not.

Loud states (urgency, errors, success) exist — but they are **exceptions**, not the baseline. A user opening a Rascal app on a regular day should see a quiet, scannable surface that respects their attention.

---

## The Four Principles

### 1. Earn the pixel

Every element justifies its presence. If a chip, badge, divider, or icon can be removed without losing meaning, remove it.

- ✅ Hairline `border-stone-100` instead of card-per-row borders.
- ✅ A single chevron disclosure instead of "Click to expand" plus icon plus help text.
- ❌ Triple decoration: emoji + bold + colored chip for the same status.
- ❌ Drop shadows where a hairline border does the job.

**Test:** cover the element with your hand. Does the row still communicate?

### 2. Signal beats decoration

Color, weight, size, and position encode **meaning** — not mood or branding flourish. Tone choices map to semantic states (see [DESIGN_SYSTEM.md → Color tokens](DESIGN_SYSTEM.md#5-color-tokens-semantic)), not to "what looks nice today".

- ✅ Emerald = "yes, commit" (submit buttons, completion states, achieved KRs).
- ✅ Amber = "at-risk" (≤7d countdown, pending manager review).
- ✅ Stone = neutral (default, no special meaning attached).
- ❌ Random use of teal for a button because the page has too much stone.
- ❌ Different green shades on the same surface because they "feel different".

**Test:** can a user without context infer the state from the color alone?

### 3. Function before form

The UX answers a task. The aesthetic supports the answer — never leads it. When the two conflict, function wins.

- ✅ A bullet list reads faster than a card grid for 5–8 items → use the list.
- ✅ A flat table with hairline rows beats a card-per-row layout for scan-many use cases.
- ✅ Numbers in `tabular-nums` so columns align — even if proportional looks "prettier".
- ❌ Sacrificing readable column widths for visual symmetry.
- ❌ Adding a chart because the section "looks empty" — empty is fine if the data is empty.

**Test:** what is the one task this surface answers? Does every choice serve that task?

### 4. Loud only when necessary

The baseline is quiet. Urgency, error, and success states exist — but they **earn** their loudness because the rest of the surface is calm. Use loud states sparingly so they retain their signal.

- ✅ Red countdown pill only when ≤3 days remain.
- ✅ Pulsing emerald dot only on truly-live data (not refreshable-on-click).
- ✅ Bold green submission button only on the final-step submit, not on save-draft.
- ❌ Every status badge bright and saturated → none stand out anymore.
- ❌ Toast notifications for every successful save → users learn to dismiss without reading.

**Test:** if you made everything on this surface 30% less loud, would the critical state still pop?

---

## Practical consequences

These principles shape concrete decisions across the kit:

| Principle                | Concrete choice in this kit                                          |
| ------------------------ | -------------------------------------------------------------------- |
| Earn the pixel           | Single neutral (`stone-*`), not `gray-*` + `slate-*` + `zinc-*` mix  |
| Earn the pixel           | Hairline `border-stone-100` for row separators, not card borders     |
| Signal beats decoration  | 10 status colors mapped 1:1 to 10 workflow states (no aliasing)       |
| Signal beats decoration  | Emoji allowlist — 9 glyphs total, semantic only                       |
| Function before form     | Notion DB-style list as default for >5 rows                           |
| Function before form     | Smart-dashboard gate (hide misleading partial data, show placeholder) |
| Loud only when necessary | Brand navy reserved for sidebar + auth — `stone-900` for in-app CTAs |
| Loud only when necessary | Countdown pill tone shifts in 3-tier urgency, not flat red            |

---

## When in doubt

Default to **less**. Remove the chip. Drop the icon. Hide the section behind a "View details" toggle. Switch from a card to a row, from a row to a single line.

The user can ask for more. They can't unsee a noisy interface.
