# Fix Expo Router Resolution Error

## The Problem
```
Unable to resolve "expo-router/build/qualified-entry" from "node_modules/expo-router/entry-classic.js"
```

This happens when expo-router isn't properly installed or there's a version mismatch.

## Quick Fix (Run these commands)

```bash
cd /Users/ebuka/Desktop/project/Afrikad/mobile

# 1. Remove everything
rm -rf node_modules .expo .metro package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Install using Expo's recommended method (this ensures version compatibility)
npx expo install --fix

# 4. If step 3 doesn't work, try:
npm install --legacy-peer-deps

# 5. Install missing dependency (react-native-reanimated is in babel config but missing from package.json)
npx expo install react-native-reanimated

# 6. Start with cleared cache
npx expo start --clear
```

## Why This Happens

1. **Version Mismatch**: Expo Router version must match your Expo SDK version
2. **Corrupted Installation**: node_modules might be corrupted
3. **Missing Dependencies**: Some required packages might be missing
4. **Cache Issues**: Metro bundler cache might be stale

## Using Expo Install (Recommended)

For Expo packages, always use `npx expo install` instead of `npm install` to ensure version compatibility:

```bash
npx expo install expo-router react-native-reanimated
```

This automatically installs versions compatible with your Expo SDK.

## Verify Installation

After installing, verify expo-router is properly installed:

```bash
ls node_modules/expo-router/build/
```

You should see `qualified-entry.js` in that directory.

## Still Not Working?

1. Check your Expo SDK version:
   ```bash
   npx expo --version
   ```

2. If SDK 54 doesn't exist, use the latest stable:
   ```bash
   npx expo install expo@latest
   ```

3. Then reinstall expo-router:
   ```bash
   npx expo install expo-router
   ```
