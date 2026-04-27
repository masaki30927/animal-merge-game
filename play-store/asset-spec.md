# Google Play Asset Spec

The single reference for every image and video the Play Console will ask for. Build these in your image editor of choice (Figma, Affinity, Krita, Photoshop) and drop them into `play-store/assets/` for tracking, then upload to the Play Console at submission time.

## Required assets

| Asset | Size | Format | Max size | Where it shows | Required |
|---|---|---|---|---|---|
| App icon | 512 × 512 | 32-bit PNG (with alpha) | 1 MB | Play Store listing, install confirmation | Yes |
| Feature graphic | 1024 × 500 | JPG or 24-bit PNG (no alpha) | 1 MB | Top of the store listing, hero banner | Yes |
| Phone screenshots | 320–3840 px on the long edge, aspect 16:9 to 9:16 | JPG or 24-bit PNG | 8 MB each | Screenshots tab on phones | Yes (min 2, max 8) |

## Optional but recommended

| Asset | Size | Format | Max size | Where it shows | Required |
|---|---|---|---|---|---|
| 7-inch tablet screenshots | 320–3840 px on the long edge, 16:9 to 9:16 | JPG or 24-bit PNG | 8 MB each | Tablet listing | No (max 8) |
| 10-inch tablet screenshots | 320–3840 px on the long edge, 16:9 to 9:16 | JPG or 24-bit PNG | 8 MB each | Tablet listing | No (max 8) |
| Promo video (YouTube URL) | 30 sec landscape recommended | YouTube link | n/a | Above the screenshots | No |

The Play Console rejects:

- Icons with hard-coded transparency where there should be solid color (the launcher applies its own mask).
- Feature graphics that bake the store badge or "Get it on Google Play" inside the artwork.
- Screenshots that are pure mockups (must be the actual app running).
- Anything with placeholder text like "lorem ipsum" or "TODO".

## Recommended phone screenshot set

We need at least two phone screenshots. Aim for 4–6 to fill the carousel. Shoot each in **portrait** at 1080 × 2400 (or your device's native portrait resolution) and save as PNG. The minimum target list:

1. **Title / first frame** — the empty board with the rabbit ready to drop, score 0.
2. **Mid-game stack** — 6–8 plushies stacked, a couple of merges already done.
3. **Big merge moment** — capture the particle burst right after a merge or a near-record stack.
4. **Game over overlay** — shows the final score, best score, top animal, and the "Play Again" button.
5. **Settings panel open** — proves localization, sound / haptics / reduced-motion controls, and Reset Data.
6. **Language switch** — same scene as #2 but with the JA UI to demonstrate bilingual support.

Two more (optional): leaderboard close-up, evolution ring close-up.

## How to capture screenshots

### From an Android device (preferred — these look authentic)

```powershell
npm run cap:sync
npx cap run android   # or open Android Studio and run
```

Then on the device:

- Volume Down + Power to capture (most stock Android).
- Pull the PNG off the device with `adb pull /sdcard/Pictures/Screenshots/<file>.png ./play-store/assets/`.

### From Chrome DevTools (works once GitHub Pages is live or you run `npx http-server -p 8080`)

1. Open `http://localhost:8080` (or the Pages URL) in Chrome.
2. Open DevTools → toggle Device Toolbar (Ctrl+Shift+M).
3. Pick "Pixel 7" or "iPhone 14 Pro" or set a custom 1080 × 2400 portrait viewport.
4. DevTools → ︙ → "Capture full size screenshot" or "Capture screenshot".
5. The PNG lands in your downloads. These are sharper than phone captures because there is no device blur, but reviewers may notice the absence of a status bar.

### From Android emulator

If you don't have a physical device handy, the emulator works:

```powershell
npx cap open android
# Run the app, then in the emulator window: Ctrl+S to save a screenshot
```

## Icon notes

The Android launcher icons live under `android/app/src/main/res/mipmap-*/`. They are wired up correctly for the Capacitor build. **Do not** treat them as the Play Store 512×512 listing icon — Google Play wants its own dedicated 512 × 512 PNG.

The PWA build now references icons under `./icons/`:

| File | Used by | Status |
|---|---|---|
| `icons/icon-192.png` | `manifest.webmanifest` (192 × 192, `purpose: any maskable`) | Placeholder, needs real art |
| `icons/icon-512.png` | `manifest.webmanifest` (512 × 512, `purpose: any maskable`) | Placeholder, needs real art |

When you create the 512 PNG for Google Play, export the same artwork at 192 × 192 for the PWA so the install dialog and home-screen icon look right on both platforms.

## Track produced assets

Add finished art under `play-store/assets/` so we can review it in Git diffs. Suggested layout:

```
play-store/assets/
  icon-512.png
  feature-graphic.png
  screenshots/
    01-title.png
    02-stack.png
    03-merge.png
    04-gameover.png
    05-settings.png
    06-japanese.png
```
