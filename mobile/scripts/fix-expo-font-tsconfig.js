#!/usr/bin/env node
/**
 * Fix expo-font tsconfig.json so it extends ../expo/tsconfig.base.json
 * instead of missing expo-module-scripts/tsconfig.base (fixes IDE error).
 * Run after patch-package in postinstall. Safe to run in CI; exits 0 on any error.
 */
const fs = require('fs');
const path = require('path');

function main() {
  try {
    const tsconfigPath = path.join(
      __dirname,
      '..',
      'node_modules',
      'expo-font',
      'tsconfig.json'
    );

    if (!fs.existsSync(tsconfigPath)) {
      return;
    }

    let content = fs.readFileSync(tsconfigPath, 'utf8');
    if (content.includes('expo-module-scripts/tsconfig.base')) {
      content = content.replace(
        '"extends": "expo-module-scripts/tsconfig.base"',
        '"extends": "../expo/tsconfig.base.json"'
      );
      fs.writeFileSync(tsconfigPath, content);
    }
  } catch (_) {
    // Ignore (e.g. in CI when expo-font layout differs or patch wasn't applied)
  }
}

main();
process.exit(0);
