# Troubleshooting Expo Router Error

## Error: Unable to resolve "expo-router/build/qualified-entry"

This error occurs when expo-router isn't properly installed or there's a version mismatch.

## Solution Steps

### Step 1: Clean Install

Run these commands in your terminal:

```bash
cd mobile

# Remove all caches and dependencies
rm -rf node_modules
rm -rf .expo
rm -rf .metro
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall with Expo's recommended method
npx expo install --fix

# Or if that doesn't work, use:
npm install --legacy-peer-deps
```

### Step 2: Verify Expo Router Installation

Check if expo-router is properly installed:

```bash
ls node_modules/expo-router/build/
```

You should see files including `qualified-entry.js`. If not, the package is corrupted.

### Step 3: Use Expo Install for Compatibility

Expo Router version must match your Expo SDK. Run:

```bash
npx expo install expo-router
```

This will install the correct version compatible with your Expo SDK.

### Step 4: Clear Metro Bundler Cache

After reinstalling, clear Metro cache:

```bash
npx expo start --clear
```

### Step 5: Check for Missing Dependencies

Make sure you have all required dependencies. The babel config references `react-native-reanimated`, so install it:

```bash
npx expo install react-native-reanimated
```

## Alternative: Check Expo SDK Version

If Expo SDK 54 doesn't exist yet, check what's available:

```bash
npx expo --version
```

Then update package.json to use the correct SDK version, or use:

```bash
npx expo install expo@latest
```

## Still Having Issues?

1. **Try using yarn instead:**
   ```bash
   yarn install
   ```

2. **Check if node_modules/expo-router exists:**
   ```bash
   ls -la node_modules/expo-router
   ```

3. **Verify your Expo version:**
   ```bash
   npx expo --version
   ```

4. **Reinstall expo-router specifically:**
   ```bash
   npm uninstall expo-router
   npx expo install expo-router
   ```

## Quick Fix Script

You can also run the provided fix script:

```bash
chmod +x fix-expo-router.sh
./fix-expo-router.sh
```
