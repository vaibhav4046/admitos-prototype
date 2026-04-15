# UniOffer Brand Assets — `/public/brand/`

This folder holds the shipping brand assets for the UniOffer marketing
landing page and every other surface that needs the UniOffer mark.
The rules live in `docs/brand/unioffer-brand-identity-guidelines.pdf`
(Andy's 40-page brand bible) — what follows is the M1 inventory.

## Status

**Raster-only for M1.** Andy hasn't shipped the vector source for the
logo or icon yet. Every asset in this folder was derived from the two
raster masters he sent on 14 April:

- `unioffer-icon-source.png` (1536 × 1024, 2 × 2 composite of four
  mark variants — solid / gradient × light-bg / dark-bg)
- `unioffer-logo.jpg` (478 × 522, full wordmark)

**Full SVG VI/CI pass is pending the vector source from the brand
lead.** Once it arrives, the follow-up commit will:

1. Add `unioffer-icon.svg` and `unioffer-logo.svg` as the canonical
   masters, re-export every raster size from the SVGs for crispness,
   and drop this README's "raster-only" caveat.
2. Produce a proper multi-path favicon.svg for modern browsers (we
   currently ship favicon.ico only; modern browsers fall back to the
   `.ico` fine, but a vector favicon renders sharper on hi-DPI).
3. Ship the stacked lockup, horizontal lockup, monochrome mark, and
   one-colour reverse-knockout variants called out in guide §6.

## What ships today

### Icon — nav / favicon surface

Cropped from the top row of `unioffer-icon-source.png` (the two solid
variants) so that exactly one image renders per theme:

| File | Size | Use |
| --- | --- | --- |
| `unioffer-icon-light.png` | 384 × 256 | Light-theme master |
| `unioffer-icon-dark.png`  | 384 × 256 | Dark-theme master |
| `unioffer-icon-light@1x.png` | x32  | Nav (default), @1x raster |
| `unioffer-icon-light@2x.png` | x64  | Nav @2x |
| `unioffer-icon-light@3x.png` | x96  | Nav @3x |
| `unioffer-icon-dark@1x.png`  | x32  | Nav (dark), @1x raster |
| `unioffer-icon-dark@2x.png`  | x64  | Nav @2x (dark) |
| `unioffer-icon-dark@3x.png`  | x96  | Nav @3x (dark) |
| `unioffer-icon-source.png`   | 1536 × 1024 | Presentation composite (reference only, do not hotlink) |

### Wordmark — for larger surfaces

Per guide §6.1 the wordmark has a **minimum 120 px digital width**.
The nav uses the icon (guide §6.2 preference); use the wordmark only
where you can honour 120 px.

| File | Size | Use |
| --- | --- | --- |
| `unioffer-logo.jpg`     | 478 × 522 | Master JPEG from Andy |
| `unioffer-logo@1x.png`  | x64       | 1x raster |
| `unioffer-logo@2x.png`  | x128      | 2x raster |
| `unioffer-logo@3x.png`  | x192      | 3x raster |

### Favicon

| File | Size | Use |
| --- | --- | --- |
| `/favicon.ico`       | multi (16 / 32 / 64) | Shipped at site root, referenced from `<head>` |
| `favicon-16.png`     | 16 × 16  | Reference PNG |
| `favicon-32.png`     | 32 × 32  | Reference PNG |
| `favicon-64.png`     | 64 × 64  | Reference PNG |

All three favicon sizes are derived from `unioffer-icon-light.png`
with `magick -trim +repage -background white -gravity center -extent`
so the mark is centred inside the square canvas.

## Generation recipe (reproducible)

If you need to regenerate any variant:

```bash
cd public/brand

# Icon 1x/2x/3x (both themes)
for scale in 1x:32 2x:64 3x:96; do
  h="${scale##*:}"; s="${scale%%:*}"
  magick unioffer-icon-light.png -resize "x${h}" -strip -define png:compression-level=9 "unioffer-icon-light@${s}.png"
  magick unioffer-icon-dark.png  -resize "x${h}" -strip -define png:compression-level=9 "unioffer-icon-dark@${s}.png"
done

# Wordmark 1x/2x/3x
magick unioffer-logo.jpg -resize x64  -strip unioffer-logo@1x.png
magick unioffer-logo.jpg -resize x128 -strip unioffer-logo@2x.png
magick unioffer-logo.jpg -resize x192 -strip unioffer-logo@3x.png

# Favicon (run from /public)
magick brand/unioffer-icon-light.png -trim +repage -background white -gravity center -resize "64x64" -extent 64x64 brand/favicon-64.png
magick brand/unioffer-icon-light.png -trim +repage -background white -gravity center -resize "32x32" -extent 32x32 brand/favicon-32.png
magick brand/unioffer-icon-light.png -trim +repage -background white -gravity center -resize "16x16" -extent 16x16 brand/favicon-16.png
magick brand/favicon-16.png brand/favicon-32.png brand/favicon-64.png favicon.ico
```

## Brand-guide compliance summary (guide version dated 14 Apr)

- **§3.1 palette** — Uni Blue `#173B63` and Offer Crimson `#A33A3A` are
  the only primary brand colours; the landing CSS in
  `app/_landing/landing.css` is locked to these.
- **§3.3 palette don'ts** — Bright orange-red substitutions are
  explicitly forbidden. The earlier `#F97316` CTA has been replaced
  throughout.
- **§5.1–5.2 surfaces** — Light `#F6F8FB`, dark `#0E1623` (with guide
  §5.2 Method B "slightly lifted" blue for dark mode, here
  `#2E5F96`).
- **§6.1 minimum sizes** — Wordmark ≥ 120 px digital / 25 mm print.
  The landing nav uses the icon instead, which per §6.2 is allowed
  down to 24 px.
- **§6.2 preference** — The icon is the preferred mark for compact
  navigation; we honour this in the sticky nav.
- **§8.2 typesetting** — Wordmark **never** hand-typeset. All surfaces
  use the image asset; no `<span>Uni</span><span>Offer</span>`
  reconstructions anywhere in the codebase.

## Open items flagged for Andy (19:00 BST email)

1. **Vector source (SVG) for icon + wordmark** — blocks the full SVG
   VI/CI pass; raster fallback in the meantime is noted above.
2. **Stacked + reverse-knockout lockups** from guide §6 — shippable
   only after vector lands.
3. **Brand-coloured favicon.svg** — same vector dependency.

---
_Last updated: 2026-04-15 — M1 Week 2, CHUNK 4 of the landing-v1 push._
