# Samara Lombok UI Redesign Specification

**Date:** June 30, 2026  
**Project:** Checklist Management System - PT. Lombok Torok Developments  
**Brand:** Samara Lombok (boutique villa property)  
**Scope:** Visual refresh of all 11 pages + Layout component using Rascal-UI-Kit Design System with Samara Lombok brand customization  
**Approach:** Systematic config-first redesign

---

## 1. Design System Architecture

**Single source of truth:** All visual decisions derive from `tailwind.config.js`. No hardcoded hex values in components.

**Three-layer structure:**
1. **Theme config** (`tailwind.config.js`) — Samara Lombok color palette, typography scale, custom utilities
2. **Component layer** (`src/index.css`) — Reusable styled component classes
3. **Page layer** — Apply component classes + Rascal-UI-Kit component imports

**Rationale:** Separating theme from components ensures consistency across all 11 pages and makes brand-level changes (e.g., accent color) update everywhere automatically.

---

## 2. Samara Lombok Color Palette & Token Mapping

### Primary brand colors

| Token | Hex | Role | Tailwind class |
|-------|-----|------|---|
| **Samara Primary** | `#324720` | Deep forest green — sidebar, login gradient anchor, brand H1 | `samara-primary` |
| **Samara Accent** | `#D4A648` | Sunset gold — links, highlights, LoadingSpinner ring | `samara-accent` |
| **Success** | `#10b981` | Emerald — "yes commit" CTAs, checkmarks (universal) | `emerald-700` |
| **Warning** | `#f59e0b` | Amber — at-risk, pending states (universal) | `amber-700` |
| **Error** | `#ef4444` | Red — validation errors, failures (universal) | `red-600` |

### Neutral scale (switch from `gray-*` to `stone-*`)

Per Rascal-UI-Kit standard, **only** use `stone-*` for neutrals. All `gray-*` references are replaced.

| Use | Hex | Tailwind class |
|-----|-----|---|
| Page background | `#FCFAF5` | Custom: warm cream (Samara-specific, not `stone-50`) |
| Card background | `#FFFFFF` | `white` |
| Card border | `#EDE5D2` | Custom: warm hairline |
| Body text | `#1F1B16` | Custom: warm near-black |
| Secondary text | `#6B6259` | Custom: muted warm grey |
| Muted/hint text | `#A89F92` | `stone-500` equivalent |
| Disabled text | — | `stone-400` |
| Dividers | `#EDE5D2` | Custom: warm hairline |

**Rationale:** Samara is a boutique villa brand (not corporate Rascal Republic). Warm cream surfaces and muted gold accents express luxury-through-warmth, not corporate functionality.

### Tailwind config additions

```javascript
theme: {
  extend: {
    colors: {
      'samara-primary': '#324720',
      'samara-accent': '#D4A648',
      'samara-bg': '#FCFAF5',
      'samara-text': '#1F1B16',
      'samara-text-secondary': '#6B6259',
      'samara-border': '#EDE5D2',
      // Keep stone scale (replace all gray refs with stone)
    },
    backgroundColor: {
      DEFAULT: '#FCFAF5', // Warm cream page bg, not cool stone-50
    },
  },
}
```

---

## 3. Typography & Component System

### Typography scale

| Role | Classes | Use |
|------|---------|-----|
| **Eyebrow** | `text-xs uppercase tracking-wider text-stone-500 font-semibold` | Section labels, admin headers |
| **H1 (page title)** | `text-2xl font-semibold text-stone-900 tracking-tight` | Dashboard "Hi, User 👋", main page headings |
| **H2 (section)** | `text-lg font-semibold text-stone-900 tracking-tight` | Card headers, section dividers |
| **H3 (sub-section)** | `text-base font-semibold text-stone-900` | Smaller headings, form section titles |
| **Body** | `text-sm text-stone-600` | Default body text, descriptions |
| **Body small** | `text-xs text-stone-500` | Secondary info, hints, helper text |
| **Display number** | `text-3xl font-semibold tabular-nums` (color = tone) | Stats, counts, KPIs |
| **Link** | `text-sm text-samara-accent hover:underline` | Links, navigation hints |

### Component classes (in `src/index.css`)

All component classes updated to use Samara palette and stone neutrals:

```css
.btn-primary
  bg-samara-primary text-white font-medium rounded-md
  hover:bg-opacity-90 active:bg-opacity-80
  /* Used in: active nav items, primary CTAs */

.btn-secondary
  bg-white border border-stone-300 text-stone-800 font-medium rounded-md
  hover:border-stone-400 hover:bg-stone-50
  /* Used in: cancel, secondary actions */

.btn-success
  bg-emerald-700 text-white font-medium rounded-md
  hover:bg-emerald-800 active:bg-emerald-900
  /* Used in: save, submit, "yes commit" actions (universal tone) */

.btn-danger
  bg-red-600 text-white font-medium rounded-md
  hover:bg-red-700 active:bg-red-800
  /* Used in: delete, destructive actions */

.card
  bg-white rounded-xl border border-stone-200 shadow-sm
  /* Radii/shadow unchanged; only border color updated */

.input
  w-full px-3 py-2 border border-stone-300 rounded-lg text-sm
  focus:outline-none focus:ring-1 focus:ring-samara-accent
  placeholder-stone-400 disabled:bg-stone-50 disabled:text-stone-500
  /* Focus ring is gold (samara-accent), not blue */

.label
  block text-sm font-medium text-stone-700 mb-1

.badge-completed
  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-emerald-100 text-emerald-700

.badge-processing
  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-amber-100 text-amber-700

.badge-failed
  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-red-100 text-red-700

.badge-draft
  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-stone-100 text-stone-600
```

### Radii & shadows (per Rascal standard — unchanged)

| Use | Class |
|-----|-------|
| Cards | `rounded-xl` |
| Buttons/chips | `rounded-md` |
| Pills/badges | `rounded-full` |
| Card lift | `shadow-sm` |
| Modal/dropdown | `shadow-lg` |

---

## 4. Rascal-UI-Kit Component Integration

### Components to implement

1. **LoadingSpinner** (custom Samara version)
   - **Ring color:** `#D4A648` (sunset gold, not blue)
   - **Background gradient:** `from-[#F8EFD9] via-[#FCFAF5] to-[#CFD4DB]/30`
   - **Logo:** `samaralombok-white.svg`
   - **Used in:** Auth screens (boot loading), async checklist operations
   - **File location:** Copy template from Rascal-UI-Kit `/templates/components/SamaraLoadingSpinner.tsx`, adapt to React app structure

2. **StatusBadge** (for checklist status)
   - **States:** Completed (emerald), Processing (amber), Failed (red), Draft (stone)
   - **Used in:** Dashboard checklist rows, History list, ChecklistDetail status indicator
   - **File location:** Create `src/components/StatusBadge.jsx` (adapt Rascal template)

3. **Avatar** (user profile pictures)
   - **Initials background:** `samara-primary` (#324720)
   - **Used in:** Sidebar user section, AdminUsers list
   - **File location:** Create `src/components/Avatar.jsx` (adapt Rascal template)

4. **PhaseChip** (optional — checklist workflow stages)
   - **Conditional:** Include if checklist app needs to visualize draft → in-progress → completed flow
   - **Used in:** Dashboard view, ChecklistDetail header (if workflow phases are relevant)

5. **StatCard** (dashboard KPI display)
   - **Display number color:** Semantic tone (emerald for completion %, amber for at-risk, red for errors, gold for highlights)
   - **Used in:** Dashboard stats section (if KPI dashboard is added)
   - **File location:** Adapt Rascal template or create custom `src/components/StatCard.jsx`

### Components to skip (not needed for this app)

- CycleStepper (no HR cycle tracking)
- SmartGateCard (no approval gates)
- CollapsibleCard (use standard card + toggle)
- NotionDbList (use custom table structure)

### Icon system

- **Material Symbols Rounded:** Add to `tailwind.config.js` fontFamily. Use 18px for sidebar nav, 20–22px for action buttons.
- **Emoji:** Keep where personality adds value (👋 in greeting, ✓ in checkmarks). No new emoji ad hoc.
- **Replace:** Replace current emoji nav icons (📊, ➕, 📋) with Material Symbols where applicable, or keep emoji if Samara brand prefers playful tone.

---

## 5. Page-by-Page Implementation Map

### Auth flow (high visual impact)

**Login.jsx**
- Background: `bg-[#FCFAF5]` (warm cream)
- Login card: Apply Samara brand gradient `linear-gradient(135deg, #324720 0%, #D4A648 100%)`
- Button: `.btn-primary` (samara-primary) with rounded-lg for slightly heavier brand treatment
- Input styling: `.input` with focus ring = samara-accent (gold)
- Icon: Material Symbols or emoji for visual warmth

**Register.jsx**
- Same gradient treatment as Login
- Form styling: `.input` + `.label` classes
- Submit button: `.btn-primary` (samara-primary)
- Secondary link: `text-samara-accent` (gold link)

**Success.jsx**
- Background: Warm cream
- Success icon: Emoji ✓ or Material Symbols `check_circle`
- Accent text: `text-samara-accent` (gold)
- CTA button: `.btn-primary` (samara-primary) → navigate to dashboard

**ChangePasswordRequired.jsx**
- Form styling: `.input` + `.label`
- Context: Warm amber background (`bg-amber-50`) or banner to signal "required action"
- Submit: `.btn-success` (emerald, universal "yes commit")

### Core layout (foundation)

**Layout.jsx**
- Page background: `bg-[#FCFAF5]` (warm cream, not cool gray)
- Sidebar bg: `bg-white`
- Sidebar border: `border-r border-stone-200` (warm hairline)
- Active nav item: `bg-samara-primary text-white` (highlight in forest green)
- Inactive nav item: `text-stone-600 hover:bg-stone-100`
- Logo box: `bg-samara-primary text-white` (deep green background)
- Logo text: "Checklist System" (keep clear, functional)
- User card: `bg-stone-100` (light stone, not gray-50)
- User avatar: Avatar component with samara-primary background
- Logout button: `text-red-600` (danger tone)
- Icons: Switch to Material Symbols Rounded 18px for sidebar nav items
- Main content area: `bg-[#FCFAF5]` page bg, standard `p-6` padding

**ProtectedRoute.jsx**
- No visual changes (logical wrapper)

### Dashboard & main flow

**Dashboard.jsx**
- H1 greeting: `text-2xl font-semibold text-stone-900 tracking-tight` + emoji 👋
- Subtitle: `text-sm text-stone-600` (active cycle, date range)
- Stat cards (if added): Use StatCard component or styled cards with samara-accent display numbers
- Checklist list:
  - Use `.card` for each row
  - Status column: StatusBadge component
  - Checklist name: `text-base font-medium text-stone-900`
  - Last updated: `text-xs text-stone-500`
  - Action buttons: `.btn-secondary` for view/edit
- Primary CTA ("New Checklist"): `.btn-primary` (samara-primary)
- Empty state (if no checklists): Friendly message + emoji + CTA

**ChecklistForm.jsx**
- Form layout: `max-w-2xl` wrapper, `space-y-6` between sections
- Form section headers: `text-lg font-semibold text-stone-900` (H2 style)
- Field labels: `.label` class
- Form inputs: `.input` class (stone-300 border, samara-accent focus ring)
- Help text: `text-xs text-stone-500` (muted)
- Submit button: `.btn-success` (emerald, universal "yes commit")
- Cancel button: `.btn-secondary`
- Validation errors: `text-red-600 text-sm` above/below field

**ChecklistDetail.jsx**
- Header section:
  - Checklist name: `text-2xl font-semibold text-stone-900`
  - Status badge: StatusBadge component (colored per state)
  - Meta info: `text-sm text-stone-600` (created date, last updated)
- Checklist items list:
  - Use `.card` for item container
  - Item checkbox + name
  - Item status badge (if applicable)
  - Edit/delete buttons: `.btn-secondary` (small, icon-based)
- Timeline/history section:
  - Dividers: `border-t border-stone-200` (warm hairline)
  - Timeline entries: `text-sm text-stone-600`
  - Timestamp: `text-xs text-stone-500`
- Action buttons:
  - Save/submit: `.btn-success` (emerald)
  - Edit: `.btn-secondary`
  - Delete: `.btn-danger`

**History.jsx**
- Page title: "Checklist History" (`text-2xl font-semibold`)
- Filters (if any): Secondary styling with stone-300 borders
- Checklist list:
  - Use `.card` for row or table styling
  - Checklist name: `text-base font-medium text-stone-900`
  - Status: StatusBadge component
  - Dates: `text-sm text-stone-600`
  - Action: View/detail link in samara-accent
- Pagination (if applicable): Secondary buttons, muted text
- Empty state: Friendly message + emoji

**TemplateSelect.jsx** (if template selection is user-facing)
- Template cards: `.card` with samara-accent hover border
- Template name: `text-base font-semibold text-stone-900`
- Description: `text-sm text-stone-600`
- Select CTA: `.btn-primary` (samara-primary)
- Selected state: `border-samara-accent border-2` highlight

### Admin pages

**AdminUsers.jsx**
- Page title: "User Management" (`text-2xl font-semibold`)
- User table/list:
  - Use `.card` per row or table styling
  - Avatar: Avatar component (samara-primary background)
  - Name: `text-base font-medium text-stone-900`
  - Email: `text-sm text-stone-600`
  - Role badge: Colored per role (admin = samara-primary tint, user = stone)
  - Status badge: Active (emerald) / Inactive (stone)
  - Actions: Edit (`.btn-secondary`), Delete (`.btn-danger`)
- Add user button: `.btn-primary` (samara-primary)

**AdminTemplates.jsx**
- Page title: "Template Management" (`text-2xl font-semibold`)
- Upload section:
  - Drag-drop zone or file input
  - Upload button: `.btn-primary` (samara-primary)
  - Helper text: `text-xs text-stone-500`
- Template list:
  - Use `.card` per template
  - Template name: `text-base font-semibold text-stone-900`
  - Upload date: `text-sm text-stone-600`
  - Preview: Thumbnail or icon
  - Actions: Edit (`.btn-secondary`), Delete (`.btn-danger`), Download (if applicable)

**UserManagement components** (UserForm, UserList, ChangePasswordForm, DeleteConfirmation)
- **UserForm.jsx:** Form inputs (`.input`, `.label`), submit (`.btn-success`), cancel (`.btn-secondary`)
- **UserList.jsx:** Use same styling as AdminUsers page
- **ChangePasswordForm.jsx:** Form inputs with samara-accent focus ring, submit (`.btn-success`)
- **DeleteConfirmation.jsx:** Danger modal, confirm (`.btn-danger`), cancel (`.btn-secondary`), warning text in amber

---

## 6. Samara Design Principles & Anti-patterns

### Core principles

1. **Calm by default** — The interface is functional and quiet. Samara's warmth (gold accent, cream bg) expresses brand identity without loudness.
2. **Signal over decoration** — Color has meaning: emerald = "yes commit", amber = at-risk, red = error, gold = accent/highlight. No arbitrary colorization.
3. **Warm hospitality** — Use cream body bg (`#FCFAF5`), warm stone neutrals, sunset gold accents. Never revert to cool corporate grays.
4. **Hospitality voice** — Copy is friendly and warm. "Create a new checklist" not "New Checklist", "Save progress" not "Submit".

### Anti-patterns (never do these)

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| Use `bg-stone-50` body bg instead of `#FCFAF5` | Cool corporate gray; violates Samara warm palette | Always use `#FCFAF5` (warm cream) for page backgrounds |
| Blue focus rings or accents | Samara's accent is gold, not blue | Use `focus:ring-samara-accent` (gold `#D4A648`) for all highlights |
| Use samara-primary (green) for submit/CTA buttons | Primary is for sidebar/branding only; "yes commit" is universal emerald | Submit buttons: always `bg-emerald-700`, never primary green |
| Mix `gray-*` and `stone-*` neutrals on same page | Inconsistent neutral palette | Use ONLY `stone-*` scale everywhere |
| Hardcoded hex colors in components | Breaks single source of truth; hard to update brand-wide | All colors come from tailwind config, never inline `style={{ color: '#...' }}` |
| Add new brand colors ad hoc | Palette drift; visual chaos | Stick to defined palette: primary, accent, success, warning, error + stone scale |
| Oversaturated or busy imagery on hero | Violates calm-by-default; visual noise | If adding photos, keep them muted (Samara mood = calm luxury, not loud design) |

### Layout consistency (per Rascal standard)

- **Page padding:** `p-6` for desktop, `p-4` for mobile (via responsive utility classes)
- **Max widths:** 
  - Dashboards: `max-w-6xl`
  - Main forms: `max-w-4xl`
  - Login/auth: `max-w-md`
- **Spacing scale:** Use Tailwind's default spacing (no custom gaps). Gaps/margins in multiples of 0.25rem (4px grid).
- **Grid layouts:** 
  - 4-up stat row: `grid grid-cols-2 md:grid-cols-4 gap-3`
  - Form splits: `grid md:grid-cols-2 gap-5`
  - Vertical stacks: `space-y-5`

---

## 7. Implementation Priorities

### Phase 1: Foundation (Day 1)
- Update `tailwind.config.js` with Samara palette + warm cream bg
- Update `src/index.css` with new component classes
- Commit foundation layer

### Phase 2: Layout & Auth (Day 1–2)
- Refresh Layout.jsx (sidebar, color updates)
- Refresh Login.jsx, Register.jsx, Success.jsx (brand gradient, button styling)
- Commit auth layer

### Phase 3: Core App (Day 2–3)
- Refresh Dashboard.jsx, ChecklistForm.jsx, ChecklistDetail.jsx, History.jsx
- Integrate StatusBadge component
- Commit main flow

### Phase 4: Admin & Components (Day 3)
- Refresh AdminUsers.jsx, AdminTemplates.jsx + UserManagement components
- Integrate Avatar component
- Integrate LoadingSpinner component
- Commit admin layer

### Phase 5: Polish (Day 4)
- Add Material Symbols Rounded icon font
- Icon replacement (emoji → Material Symbols where applicable)
- Testing: visual QA across all pages, responsive breakpoints
- Final commit

---

## 8. Testing Checklist

- [ ] Auth flow (login → success) uses brand gradient + new colors
- [ ] Dashboard renders with warm cream bg + correct text colors
- [ ] All buttons match their designated styling (primary, secondary, success, danger)
- [ ] Input focus rings are gold (samara-accent), not blue
- [ ] Status badges display correct colors per state
- [ ] Sidebar active nav item is forest green (samara-primary)
- [ ] No `gray-*` classes remain in code (all replaced with `stone-*`)
- [ ] LoadingSpinner uses gold ring + Samara logo
- [ ] Avatar backgrounds use samara-primary
- [ ] Responsive breakpoints work correctly (mobile sidebar, form widths, etc.)
- [ ] No hardcoded hex values in component files

---

## 9. Files to Create/Modify

### New files
- `src/components/StatusBadge.jsx` — Adapt from Rascal-UI-Kit template
- `src/components/Avatar.jsx` — Adapt from Rascal-UI-Kit template
- `src/components/SamaraLoadingSpinner.jsx` — Adapt from Rascal-UI-Kit template
- `docs/superpowers/specs/2026-06-30-samara-ui-redesign-design.md` — This spec

### Modified files
- `tailwind.config.js` — Add Samara color palette, Material Symbols font, warm cream bg
- `src/index.css` — Update all component classes (btn-*, card, input, badge-*, label)
- `src/components/Layout.jsx` — Sidebar colors, nav styling, page bg
- `src/pages/Login.jsx` — Brand gradient, button styling
- `src/pages/Register.jsx` — Form styling, button colors
- `src/pages/Success.jsx` — Accent colors, emoji/icons
- `src/pages/ChangePasswordRequired.jsx` — Form + warning styling
- `src/pages/Dashboard.jsx` — Status badges, button colors, page layout
- `src/pages/ChecklistForm.jsx` — Input focus rings, button styling
- `src/pages/ChecklistDetail.jsx` — Status badges, button colors
- `src/pages/History.jsx` — Badge + link colors
- `src/pages/TemplateSelect.jsx` — Card styling, selection highlights
- `src/pages/AdminUsers.jsx` — Avatar component, badge colors, button styling
- `src/pages/AdminTemplates.jsx` — Button colors, card styling
- `src/components/UserManagement/UserForm.jsx` — Input focus rings, button styling
- `src/components/UserManagement/UserList.jsx` — Badge + link colors
- `src/components/UserManagement/ChangePasswordForm.jsx` — Form + warning styling
- `src/components/UserManagement/DeleteConfirmation.jsx` — Danger button + modal styling

---

## 10. Success Criteria

✅ All 11 pages + Layout component visually refreshed with Samara Lombok branding  
✅ No `gray-*` classes remain (100% migrated to `stone-*`)  
✅ All colors derive from tailwind config (no hardcoded hex in components)  
✅ Rascal-UI-Kit components (StatusBadge, Avatar, LoadingSpinner) integrated  
✅ Auth flow uses Samara brand gradient + primary color  
✅ Dashboard + main app pages use warm cream bg + semantic color palette  
✅ Focus rings + accents are gold (samara-accent), not blue  
✅ Responsive design works correctly across mobile, tablet, desktop  
✅ Design adheres to Samara Design Principles (calm, warm, signal over decoration)  
✅ No visual regressions from current state

