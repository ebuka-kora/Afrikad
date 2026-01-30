# PWA Setup for Afrikad Admin

The admin panel has been successfully converted to a Progressive Web App (PWA).

## What's Included

✅ **Service Worker** - Enables offline functionality and caching
✅ **Web App Manifest** - Allows installation as a standalone app
✅ **PWA Icons** - 192x192 and 512x512 icons for app installation
✅ **Auto-update** - Service worker automatically updates when new versions are deployed

## Generated Files

After building, the following PWA files are generated in `dist/`:

- `manifest.webmanifest` - App manifest with metadata
- `sw.js` - Service worker for caching and offline support
- `workbox-*.js` - Workbox library for service worker functionality
- `registerSW.js` - Service worker registration script

## Icons

PWA icons are located in `public/`:
- `pwa-192x192.png` - 192x192 icon
- `pwa-512x512.png` - 512x512 icon

To regenerate icons from favicon:
```bash
npm run generate-icons
```

## Installation

Users can install the PWA by:
1. Opening the app in a supported browser (Chrome, Edge, Safari, etc.)
2. Clicking the install prompt or using the browser's install option
3. The app will appear as a standalone application

## Development

Service worker is **disabled in development mode** to avoid build issues. It's only active in production builds.

## Build

```bash
npm run build
```

The build process will:
- Generate the service worker
- Create the web app manifest
- Include PWA assets in the build

## Configuration

PWA settings can be modified in `vite.config.ts` under the `VitePWA` plugin configuration:

- `manifest` - App name, icons, theme colors, etc.
- `workbox` - Caching strategies and service worker behavior
- `devOptions` - Development mode settings

## Browser Support

PWAs work on:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+, macOS)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet

## Notes

- The app requires HTTPS in production (or localhost for development)
- Service worker uses development mode to avoid terser minification issues
- Icons are currently placeholders - replace with your actual app icons before production
