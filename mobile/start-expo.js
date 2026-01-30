#!/usr/bin/env node

// Start Expo with optimized settings
const { spawn } = require('child_process');
const { execSync } = require('child_process');

// Check if watchman is available (more efficient than polling)
let useWatchman = true;
try {
  execSync('which watchman', { stdio: 'ignore' });
  // Watchman is available
} catch (e) {
  // Watchman not installed, will use polling
  useWatchman = false;
}

// Set environment variables to reduce file watching
const env = {
  ...process.env,
  // Only disable watchman if it's not available or causes issues
  // Remove this line if you have watchman installed and want to use it
  ...(useWatchman ? {} : { EXPO_NO_WATCHMAN: '1' }),
  // Reduce Metro's file watching
  EXPO_NO_METRO_LAZY: '1',
};

// Check if offline flag is requested
const args = process.argv.slice(2);
const isOffline = args.includes('--offline') || args.includes('-o');

if (!useWatchman) {
  console.log('ℹ️  Watchman not found. Using polling file watcher (may be slower).');
  console.log('   Install watchman for better performance: brew install watchman\n');
}

// Start Expo with all passed arguments
// Fix deprecation warning by not using shell: true with args
const expoArgs = ['expo', 'start', ...args];
const expoProcess = spawn('npx', expoArgs, {
  stdio: 'inherit',
  env,
});

expoProcess.on('error', (error) => {
  console.error('Failed to start Expo:', error);
  if (error.message && error.message.includes('ENOENT')) {
    console.error('\nMake sure Expo CLI is installed: npm install -g expo-cli');
  }
  process.exit(1);
});

expoProcess.on('exit', (code) => {
  if (code !== 0 && !isOffline) {
    console.log('\n💡 Tip: If you see network errors, try running with --offline flag:');
    console.log('   npm start -- --offline');
  }
  process.exit(code || 0);
});
