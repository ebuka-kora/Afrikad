#!/usr/bin/env node
/**
 * Fix expo-font tsconfig.json so it extends ../expo/tsconfig.base.json
 * instead of missing expo-module-scripts/tsconfig.base (fixes IDE error).
 * Run after patch-package in postinstall.
 */
const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-font',
  'tsconfig.json'
);

if (!fs.existsSync(tsconfigPath)) {
  process.exit(0);
}

let content = fs.readFileSync(tsconfigPath, 'utf8');
if (content.includes('expo-module-scripts/tsconfig.base')) {
  content = content.replace(
    '"extends": "expo-module-scripts/tsconfig.base"',
    '"extends": "../expo/tsconfig.base.json"'
  );
  fs.writeFileSync(tsconfigPath, content);
}
