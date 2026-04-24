# Google Play Release Checklist

## Before Upload

- [x] Replace the support email placeholder in `privacy.html`
- [x] Publish `privacy.html` on GitHub Pages or another public HTTPS URL
- [ ] Confirm app name, package name, and screenshots
- [ ] Keep `android/keystore/animal-merge-upload-key.jks` backed up safely
- [ ] Keep `android/signing.properties` backed up safely and out of Git

## Build

- [x] Run the signed AAB build
- [x] Confirm output file exists at `android/app/build/outputs/bundle/release/app-release.aab`
- [x] Confirm AAB is signed

## Play Console

- [ ] Create the app in Google Play Console
- [ ] Fill in the app access / ads / data safety forms
- [ ] Add store listing text from `play-store/store-listing.md`
- [ ] Upload icon, screenshots, and feature graphic
- [ ] Add privacy policy URL
- [ ] Upload `app-release.aab`
- [ ] Start internal or closed testing
- [ ] Submit for review
