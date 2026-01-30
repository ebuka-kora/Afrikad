#!/bin/bash

# Script to remove old web app files that conflict with Expo

echo "Cleaning up old web app files..."

# Remove old web app directories
rm -rf src/app
rm -rf src/styles
rm -f src/main.tsx
rm -f vite.config.ts
rm -f postcss.config.mjs
rm -f index.html
rm -rf guidelines
rm -f ATTRIBUTIONS.md

echo "Cleanup complete! Old web app files removed."
echo "You can now run: npm start"
