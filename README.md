# Animal Merge Game

Drop cute animal plushies, merge matching animals, and grow the biggest animal you can.
This is a static browser game, so it can be published directly with GitHub Pages, Netlify, Vercel, or any static host.

## Run

Open `index.html` in a desktop browser.

If your browser blocks local file access for some reason, serve the folder with a tiny static server instead.

## Publish

To publish with GitHub Pages:

1. Push this folder to GitHub.
2. Open the repository's `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Run the `Publish static game` workflow if it does not start automatically.

After GitHub finishes deploying, the game will be available at:

`https://<username>.github.io/<repository-name>/`

## Android App

This project is prepared for Google Play publishing with Capacitor.

First install dependencies:

```powershell
npm install
```

Then generate and sync the Android project:

```powershell
npm run build
npx cap add android
npm run cap:sync
```

Open Android Studio:

```powershell
npx cap open android
```

## Google Play Release

1. Create an upload keystore:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\new-android-keystore.ps1 -StorePassword "your-store-pass" -KeyPassword "your-key-pass"
```

2. Copy `android/signing.properties.example` to `android/signing.properties` and replace the passwords.

3. Build a signed bundle:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:GRADLE_USER_HOME='C:\g'
cd android
.\gradlew.bat :app:bundleRelease --no-daemon --max-workers=1 '-Dorg.gradle.caching=false'
```

The Google Play upload file will be created at:

`android/app/build/outputs/bundle/release/app-release.aab`

4. Upload that `.aab` to Google Play Console and complete the store listing.

Useful files for submission:

- `privacy.html`
- `play-store/store-listing.md`
- `play-store/release-checklist.md`

## Keystore Backup

The Android upload signing key is what proves to Google Play that an update came from you. Two files matter:

- `android/keystore/animal-merge-upload-key.jks` — the upload keystore itself.
- `android/signing.properties` — the passwords and aliases needed to use the keystore at build time.

Both are excluded from Git via `.gitignore`. Never commit them.

### Why this matters

If you lose the `.jks` file or its passwords, **you cannot publish another update under the same package name**. The only recovery path is Google Play's key reset request, which is slow and not always granted. Treat both files like you would treat your bank credentials.

### Where to back them up

Store at least two encrypted copies in places that are not the project folder:

1. A password manager that supports file attachments (1Password, Bitwarden, KeePassXC, etc.) — keep the keystore as an attachment alongside the store/key passwords.
2. An encrypted external drive or cloud-backed encrypted volume (e.g. Cryptomator, age-encrypted archive in Google Drive / iCloud Drive).

Verify at least once that you can restore the keystore from a backup, then build a release AAB with it on a clean machine. A backup you have never restored is not a backup.

### If a key file ever gets committed by accident

Treat any commit that contains the `.jks` or `signing.properties` as compromised. Steps, in order:

1. Generate a new keystore (`scripts/new-android-keystore.ps1`) and update `signing.properties` locally.
2. Rewrite Git history to remove the leaked file from every commit (e.g. `git filter-repo` or `git-filter-branch`). These commands rewrite history and require a force push — only do this on a repository you own and after backing up the current state.
3. Force-push the cleaned branch and notify any collaborators to re-clone.
4. If the leaked key was already used to sign a published release, contact Google Play support — you will likely need their key upgrade flow to swap signing keys.

The cleanup commands above are destructive and out of scope for this README — read the official `git filter-repo` docs before running them.

## Controls

- Move the mouse to choose the drop position
- Click to drop the current piece
- Press `Space` to drop from the keyboard
- Press `Restart` to start over

## Current Features

- Gravity-based falling pieces
- Wall, floor, and piece collisions
- Same-piece merging into the next size
- Score display
- Warning line based game-over logic
- Restart flow

## Scoring

Merges get higher rewards as the animals grow:

`50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750`

## Notes

- The pieces are drawn as animal plush toys directly on the canvas
- Physics are intentionally lightweight and tuned for a simple prototype
- The structure is kept small so later steps can add polish and rules
