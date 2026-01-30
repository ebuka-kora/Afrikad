const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only watch the src directory and essential config files
config.watchFolders = [
  __dirname,
];

// Aggressively exclude files from watching
config.resolver = {
  ...config.resolver,
  blockList: [
    // Block all nested node_modules
    /.*\/node_modules\/.*\/node_modules\/.*/,
    // Block project artifacts only. Do NOT block /dist/ or /build/ – they break node_modules (e.g. whatwg-fetch/dist, expo-router/build)
    /.*\/\.expo\/.*/,
    /.*\/\.git\/.*/,
    /.*\/\.DS_Store/,
    // Block test files if not needed
    /.*\/__tests__\/.*/,
    /.*\/\.test\./,
    /.*\/\.spec\./,
  ],
};

// Configure watcher - try to use watchman if available, otherwise use polling
// If watchman causes EMFILE errors, it will be disabled via EXPO_NO_WATCHMAN env var
config.watcher = {
  ...config.watcher,
  // Let watchman be used if available (more efficient)
  // It will be disabled by EXPO_NO_WATCHMAN env var if needed
  healthCheck: {
    enabled: true,
    // Increase interval and timeout for polling mode
    interval: 5000, // Check every 5 seconds
    timeout: 20000, // Allow up to 20 seconds for file detection
  },
};

// Reduce server overhead
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (!url.includes('.')) {
      return url;
    }
    return url;
  },
};

module.exports = config;
