# PWA Icons

`manifest.webmanifest` references two files in this directory:

| File | Size | Purpose |
|------|------|---------|
| `icon-192.png` | 192 × 192 | Home-screen icon, install dialog, manifest `any maskable` |
| `icon-512.png` | 512 × 512 | High-resolution rendering, also `any maskable` |

Both should be solid-edged 32-bit PNG with the artwork centered inside the inner ~80 % of the canvas, so the maskable cropping circles do not chop the animal off. The remaining 10 % padding on each side is the safe zone that Android, iOS, and Chrome's "maskable" rendering may eat.

When you produce a new 512 × 512 master, downsample it to 192 × 192 and save both. The Play Store wants its own 512 × 512 icon as well — see `play-store/asset-spec.md`. Use the same source artwork so the PWA and the Play listing match.

If these files are missing, the PWA still installs but ships with the browser default icon. The Capacitor Android build is unaffected because it draws launcher icons from `android/app/src/main/res/mipmap-*/` directly.
