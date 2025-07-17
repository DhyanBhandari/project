// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push('sql');

// Enable symlinks support
config.resolver.unstable_enableSymlinks = true;

// Configure transformer
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Disable minification in development
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;