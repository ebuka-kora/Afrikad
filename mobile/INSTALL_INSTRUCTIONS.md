# Installation Instructions

## Issue
There are dependency conflicts due to version mismatches. Follow these steps to resolve:

## Solution 1: Use Legacy Peer Deps (Recommended)

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Solution 2: Use Expo Install (Auto-fix versions)

After installing with legacy-peer-deps, run:

```bash
npx expo install --fix
```

This will automatically adjust package versions to be compatible with your Expo SDK.

## Solution 3: Manual Version Adjustment

If the above doesn't work, you may need to adjust versions. The current package.json uses:
- Expo SDK 54 (verify this version exists)
- React 19.1.0
- React Native 0.81.5

If Expo SDK 54 doesn't exist yet, you may need to:
1. Check the latest Expo SDK version: `npx expo --version`
2. Update package.json to use the latest stable SDK
3. Use `npx expo install expo@latest` to get compatible versions

## Alternative: Use Latest Stable Expo SDK

If SDK 54 isn't available, you can use the latest stable:

```bash
npx create-expo-app@latest --template
# Then migrate your code
```

Or manually update package.json to use the latest stable Expo SDK version.

## After Installation

Once dependencies are installed:
1. Run `npx expo start` to verify everything works
2. If you see version warnings, run `npx expo install --fix`
3. Test the app on iOS/Android/Web

## Troubleshooting

If you continue to have issues:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules and package-lock.json
3. Try using yarn instead: `yarn install`
4. Check Expo documentation for SDK 54 compatibility
