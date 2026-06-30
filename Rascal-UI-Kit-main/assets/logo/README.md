# Logo Assets

Brand marks for the Rascal hospitality group + sister properties. Organised by brand, with **three SVG variants** per brand (navy / black / white) and PNG fallbacks where available.

```
logo/
├── rascalrepublic/                   ← Primary Rascal Republic brand
│   ├── rascalrepublic-navy.svg       Navy #011132 — default in-app
│   ├── rascalrepublic-black.svg      Black #000000 — print, mono surfaces
│   ├── rascalrepublic-white.svg      White #ffffff — on dark backgrounds
│   ├── rascalrepublic.png            Raster fallback (email signatures)
│   └── rascalrepublic-rgb.png        Alt RGB raster from brand kit
│
├── rinjanibay/                       ← Sister property — Sumbawa
│   ├── rinjanibay-navy.svg
│   ├── rinjanibay-black.svg
│   ├── rinjanibay-white.svg
│   ├── rinjanibay-black.png
│   └── rinjanibay-white.png
│
└── samaralombok/                     ← Sister property — Lombok
    ├── samaralombok-navy.svg
    ├── samaralombok-black.svg
    ├── samaralombok-white.svg
    ├── samaralombok-black.png
    ├── samaralombok-primary.png      Green RGB primary
    └── samaralombok-white.png
```

## Which variant to use

| Context                                      | Variant                |
| -------------------------------------------- | ---------------------- |
| In-app sidebar, login, dashboard headers     | `*-navy.svg`           |
| Mono surfaces, print, watermark              | `*-black.svg`          |
| Dark sidebar / dark hero background          | `*-white.svg`          |
| Email signatures, contexts that strip SVG    | `*.png`                |

## Adding a new variant

1. Use the navy SVG as source; swap `fill="#011132"` for your target colour.
2. Update this README's tree above.
3. Avoid raster unless mandated by the consumer (email clients, slide decks).

## Note on the Rinjani Bay & Samara Lombok SVGs

These two SVG sets are typographic approximations of the brand wordmarks — the PNG files in the same folder are the **authoritative reference**. When the designer ships clean vector source files, replace the SVGs in this folder.
