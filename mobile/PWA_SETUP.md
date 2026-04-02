# PWA Setup for Afrikad Mobile App

This guide is a copy/paste reference for converting any Expo app to a PWA.
It uses Expo's built-in web/PWA support and works for this project as-is.

---

## Quick Start (Copy/Paste)

1) Ensure the `web` section exists in `app.json` (see template below)
2) Add icons to `assets/` (icon.png, favicon.png)
3) Run the web build:

```bash
npx expo export:web
```

4) Deploy the `web-build/` folder to any static host
5) Open the site over HTTPS and install the PWA

---

## Required App Config (app.json)

Add or update the `web` section:

```json
"web": {
  "favicon": "./assets/favicon.png",
  "name": "AfriKAD",
  "shortName": "Afrikad",
  "description": "Afrikad - Digital Wallet & Virtual Card",
  "themeColor": "#000000",
  "backgroundColor": "#000000",
  "display": "standalone",
  "startUrl": "/",
  "scope": "/",
  "orientation": "portrait",
  "lang": "en",
  "bundler": "metro"
}
```

What Expo does for you:
- Generates `manifest.json` from `web` config
- Generates a service worker automatically
- Injects PWA meta tags into the HTML
- Uses `assets/icon.png` + `assets/favicon.png` for install icons

---

## Assets Checklist

Place in `assets/`:
- `icon.png` (1024x1024 recommended)
- `favicon.png` (48x48 or 64x64)
- `adaptive-icon.png` (Android adaptive icon; optional for PWA but used by Expo)

---

## Run and Test

### Development
```bash
npx expo start --web
```

### Production Build
```bash
npx expo export:web
```

Output folder: `web-build/`

---

## Deploy (Any Static Host)

Upload the `web-build/` folder to:
- Vercel
- Netlify
- Cloudflare Pages
- S3 + CloudFront
- Any static hosting

Important: PWA install requires **HTTPS**.

---

## How to Install (User Steps)

1) Open the site in Chrome/Edge/Safari
2) Click "Install app" (or browser menu -> Install)
3) PWA opens as a standalone app

---

## Common Issues

1) "No install prompt"
   - Not on HTTPS
   - Missing manifest (check /manifest.json)
   - Missing icons
   - Service worker not registered

2) Blank screen after deploy
   - Ensure hosting serves `index.html` for SPA routes
   - Check console for missing assets

3) Old content after deploy
   - Clear cache or unregister service worker
   - Increment build version and redeploy

---

## One-Line Summary (for quick sharing)

"Add `web` config in app.json, add icons, run `npx expo export:web`, and deploy `web-build/` over HTTPS."
