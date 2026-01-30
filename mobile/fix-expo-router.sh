#!/bin/bash

# Fix Expo Router Resolution Error
# Run this script to fix the "Unable to resolve expo-router/build/qualified-entry" error

echo "🔧 Fixing Expo Router resolution error..."

# Navigate to mobile directory
cd "$(dirname "$0")"

# Clear caches
echo "📦 Clearing caches..."
rm -rf node_modules
rm -rf .expo
rm -rf .metro
rm -f package-lock.json

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📥 Reinstalling dependencies..."
npm install --legacy-peer-deps

# Clear Metro bundler cache
echo "🗑️  Clearing Metro bundler cache..."
npx expo start --clear

echo "✅ Done! Try running 'npm start' again."
