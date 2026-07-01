# Animation Assets

```
animations/
└── animation_others/    Variation library — standalone SVGs for inline contexts
    ├── loading-spinner.svg     Rotating ring (40 px) — default inline loader
    ├── loading-dots.svg        3-dot pulse (16 px tall) — button-inline loader
    ├── loading-pulse.svg       Expanding circle — attention pulse
    └── loading-bar.svg         Top sweep (200×4) — non-blocking background fetch
```

## When to use what

The **canonical full-screen loader** is the [`LoadingSpinner.tsx` component](../../templates/components/LoadingSpinner.tsx) — brand logo + spinning ring on a soft gradient. Use that at app boot, auth boundary, and suspense fallback.

The standalone SVGs in `animation_others/` are **variations for inline / non-blocking contexts** where the full-screen branded loader would be overkill:

| Situation                              | Asset                     |
| -------------------------------------- | ------------------------- |
| Button submit loading state            | `loading-dots.svg`        |
| Inline content fetch (panel-sized)     | `loading-spinner.svg`     |
| Top-of-page non-blocking refresh       | `loading-bar.svg`         |
| Attention pulse (new data arrived)     | `loading-pulse.svg`       |

All four are self-animating SVGs — no React, no JS, drop into any `<img src>` and they animate via SMIL.

## Adding a new variation

1. Drop the SVG file in `animation_others/`.
2. Update the table above.
3. Keep it **purpose-named** (`loading-…`, `success-…`, `error-…`) so the filename communicates intent.
4. Inline `<animate>` / `<animateTransform>` — avoid external CSS so the file works as plain `<img>`.

See [docs/ANIMATIONS.md](../../docs/ANIMATIONS.md) for usage patterns + Tailwind alternatives.
