# Installation Instructions - Run These Commands

Due to network connectivity issues in the automated process, please run these commands manually in your terminal:

## Step 1: Navigate to mobile directory
```bash
cd /Users/ebuka/Desktop/project/Afrikad/mobile
```

## Step 2: Install dependencies
```bash
npm install --legacy-peer-deps
```

## Step 3: Install Expo packages with correct versions
After npm install completes, run:
```bash
npx expo install expo-router react-native-reanimated
```

This ensures expo-router and react-native-reanimated are installed with versions compatible with Expo SDK 54.0.31.

## Step 4: Verify expo-router installation
```bash
ls node_modules/expo-router/build/qualified-entry.js
```

If this file exists, expo-router is properly installed.

## Step 5: Start the app with cleared cache
```bash
npx expo start --clear
```

## If npm install fails due to network issues:

1. **Try using yarn instead:**
   ```bash
   yarn install
   ```

2. **Or retry npm install:**
   ```bash
   npm install --legacy-peer-deps --retry 3
   ```

3. **Check your network connection** and try again.

## What was fixed:

✅ Updated `package.json` to use `expo: ~54.0.31` (as you specified)
✅ Added `react-native-reanimated: ~3.16.1` (was missing but referenced in babel.config.js)
✅ Cleaned up node_modules and caches

After running the commands above, the expo-router error should be resolved!
