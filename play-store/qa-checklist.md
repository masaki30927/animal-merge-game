# QA Checklist — Animal Merge Game

Pass this on a real Android device before promoting any build out of the Internal testing track. All 20 items must be PASS or N/A. Any FAIL flagged P0 blocks the release; P1 / P2 are recorded but the build can still ship if the workaround is acceptable.

## Test session metadata

Fill this in at the start of every run.

| Field | Value |
|---|---|
| Test date | YYYY-MM-DD |
| Tester | |
| Device model | |
| Android version | |
| App `versionCode` | |
| App `versionName` | |
| AAB SHA-256 (last 8 chars) | |
| Build channel | Internal / Closed / Production |

## Tests

### 1. App launch — 起動・初期表示

- **Steps**: Tap the launcher icon on the home screen.
- **Expected**: Splash → game screen within ~2 s. Score reads `0`, the leaderboard "Now" row reads `Guest 0`, the rabbit preview is in the next-bubble.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: The app is signed but the package wasn't accepted; rerun `bundleRelease` and re-upload. If splash hangs, look for a Capacitor JavaScript error in `adb logcat`.

### 2. Portrait lock — 起動・初期表示

- **Steps**: Tilt the device to landscape (with auto-rotate ON in system settings).
- **Expected**: The game stays in portrait orientation; the canvas does not rotate or rescale.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: Confirm `android:screenOrientation="portrait"` is still in `android/app/src/main/AndroidManifest.xml`; cap sync should preserve it.

### 3. Safe-area / notch — 起動・初期表示

- **Steps**: On a notched / punch-hole device, hold the phone upright and look at the four edges of the play area.
- **Expected**: Score bubble, Next bubble, language switch, and control strip clear the notch and the home-indicator bar; nothing visually clipped or covered.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: `viewport-fit=cover` may have regressed in `index.html`; verify the meta tag and that mobile CSS still uses `env(safe-area-inset-*)`.

### 4. Tap to drop — 操作

- **Steps**: Tap somewhere in the play field.
- **Expected**: The active piece drops at that horizontal position. After ~420 ms the cooldown ring fills and a second drop is allowed.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: `pointerdown` may have been swallowed by another listener; check `pointer-events` on overlay / settings backdrop.

### 5. Drag to aim — 操作

- **Steps**: Press and drag a finger across the play field, then release.
- **Expected**: The preview piece tracks the finger horizontally and drops at release; no scroll, no rubber-band on iOS-equivalent web view.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: `touch-action: none` on `.game-column` / `#gameCanvas` may have been overridden by user CSS or browser default.

### 6. No double-tap zoom or accidental controls — 操作

- **Steps**: Triple-tap quickly on the score bubble, the canvas, and the Restart button.
- **Expected**: No browser zoom, no double-fire of Restart, no text-selection highlight on tap targets.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: `touch-action: manipulation` on `button` and `-webkit-tap-highlight-color: transparent` on `body` should already cover this; verify they survived the build.

### 7. Merge — ゲーム挙動

- **Steps**: Drop two rabbits side by side so they touch.
- **Expected**: They merge into a cat, score increases, particles burst, the merged piece is locked from re-merging until next tick.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: Inspect `mergeTouchingPairs` — most regressions here come from physics tuning that pushes pieces apart before the merge tolerance is met.

### 8. Game-over trap (1.2 s) — ゲーム挙動

- **Steps**: Stack pieces fast so a large merged piece settles above the warning line and stops moving. Wait.
- **Expected**: Within ~1.2 s of being settled above the line, the Game Over overlay appears.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: Confirm `GAME.gameOverTrapGraceMs = 1200` and `GAME.gameOverSettleVelocity ≈ 0.6 * SCALE` are still in `app.js`. The trap timer needs `contactCount > 0` to tick.

### 9. Restart — ゲーム挙動

- **Steps**: Either tap Restart in the control strip mid-game, or tap Play Again on the game-over overlay.
- **Expected**: Score, leaderboard "Now" row, ball pile, milestone, danger meter, preview, and announce-flag all reset to a fresh run.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: A field added in a future change probably wasn't reset in `Game.reset()`.

### 10. New best announcement — ゲーム挙動

- **Steps**: Play a run that beats your stored best score.
- **Expected**: A "New Best" pulse appears in-canvas; with TalkBack enabled, the new score is read out exactly once via the `#liveStatus` aria-live region.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: `announcedNewBest` flag may have stuck `true` between runs; confirm reset() clears it.

### 11. Settings panel — open and close (four routes) — 設定パネル

- **Steps**: Open Settings via the Settings button. Close it via (a) the close button, (b) tapping the dimmed backdrop, (c) Esc on a paired Bluetooth keyboard. Reopen and Tab through the controls; confirm focus does not escape the panel.
- **Expected**: All four open/close routes work; Tab cycles inside the panel only; on close, focus returns to the Settings button.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: Backdrop click handler or focus-trap keydown listener may have detached. Check for JS errors during open/close.

### 12. Settings toggles persist — 設定パネル

- **Steps**: Toggle Sound off, Haptics off, Reduced Motion on, switch language to JA. Force-quit the app and relaunch.
- **Expected**: All four toggles return to the values you set; the saved language is honored.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: localStorage may be evicted on Capacitor WebView restart; verify the WebView storage quota and `animal-merge-save-v2` key.

### 13. Bilingual UI (JP / EN) — 国際化

- **Steps**: Switch language to JA, scan every visible label (top bar, leaderboard, evolution ring, settings, overlay). Switch to EN and rescan.
- **Expected**: Every string changes between the two locales, no `[object Object]`, no missing-key fallback shown.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: A new string was added without a JA entry. The `t()` lookup falls back to the English value, so English usually still looks fine.

### 14. Player name flow — データ永続化

- **Steps**: In the leaderboard input, try entering: a normal name, exactly 12 characters, 13 characters, only spaces, and the empty string. Press Set after each.
- **Expected**: Names ≤12 characters keep their value; longer names are truncated to 12; whitespace-only or empty becomes "Guest"; the leaderboard "Now" row updates immediately.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:

### 15. Reset Data — データ永続化

- **Steps**: In Settings, tap Reset Data and confirm in the native dialog.
- **Expected**: Best score returns to 0, player name returns to "Guest", leaderboard reverts to the seed entries, language flips back to the device default detection, all toggles return to their on-first-launch values.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: The save store may not have flushed; verify `saveStore.reset()` writes a fresh default object and that legacy keys are also cleared.

### 16. Background and foreground — オフライン・復帰

- **Steps**: Mid-game, press Home; wait 30 s; relaunch the app from the recents tray.
- **Expected**: The game state is preserved (pieces in place, score intact). The first frame after resume does not over-simulate (no large physics jump). Audio resumes the next time you drop a piece.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: `visibilitychange` listener should reset `lastTimestamp = 0` and call `audioManager.resume()` on visible.

### 17. PWA offline launch — オフライン・復帰

- **Steps**: Open the GitHub Pages URL in Chrome on a device, install via "Install app", then enable airplane mode and launch the installed PWA from the home screen. (This is a web-side test; safe to run on the same device that has the Play Store build, since the two install targets are separate icons.)
- **Expected**: The PWA opens, the game loads, audio works on first tap.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: Open DevTools (or `chrome://inspect`) and check `Application → Service Workers`. Look for the cache name `animal-merge-v...` matching the cache buster in the page.

### 18. TalkBack — アクセシビリティ

- **Steps**: Enable TalkBack (Settings → Accessibility). Swipe-explore the game screen.
- **Expected**: TalkBack reads "Settings", "Restart", "Animal Ranking", language buttons, and the Set button. The mascot cloud's literal "drop" text is **not** announced. New best and game over fire focused announcements.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: Confirm `aria-hidden="true"` is on `.mascot-cloud`; confirm `aria-live` regions still exist for `#liveStatus` and `#overlay`.

### 19. Late-game frame rate — パフォーマンス

- **Steps**: Connect the device to a desktop, open `chrome://inspect/#devices`, and inspect the WebView. With Performance tab recording, play until ~30 balls are present and trigger a chain of merges.
- **Expected**: Median FPS stays at 50 or above on a mid-range device; no frame longer than ~60 ms during a merge burst.
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: Confirm the plush cache built (Memory tab should show 11+ HTMLCanvasElements). If `drawPlushFuzz` shows up in the flame graph, the drawPieceCached path was bypassed somewhere.

### 20. Store identity sanity — ストア準拠

- **Steps**: Settings → Apps → Animal Merge Game → App info.
- **Expected**: Package name reads `com.masaki30927.animalmerge`. Version line matches `versionName` in `android/app/build.gradle`. Permission list shows only `INTERNET` (and any system-default like access network state).
- **Result**: ☐ PASS ☐ FAIL ☐ N/A
- **Notes**:
- **If it fails**: A wrong build slipped in. Compare the SHA-256 in your release notes to `Get-FileHash` of the AAB you uploaded.

## Tally

| Outcome | Count |
|---|---|
| PASS | ___ / 20 |
| FAIL | ___ / 20 |
| N/A | ___ / 20 |

When **PASS + N/A = 20** and there is **no FAIL flagged P0**, this run satisfies the "Internal testing pass criteria" defined in [`release-checklist.md`](release-checklist.md#1-internal-testing-110-testers).

## Severity rubric

Use these definitions when a FAIL needs a flag.

- **P0** — Ship-blocker. Crash on launch, data loss, monetization failure (n/a here), policy violation (e.g. Data Safety form mismatch with privacy.html), security regression (e.g. signing keystore committed, INTERNET permission abused). Do not promote the build until fixed.
- **P1** — Significant degradation that a typical user will notice. New-best does not announce, Settings cannot be closed, JP/EN missing strings, late-game FPS below 30, PWA fails to install. Fix before promoting to Closed testing.
- **P2** — Cosmetic or edge-case. Misaligned shadow, slow first-frame audio under flaky network, minor copy typo. Track it but does not block promotion.
