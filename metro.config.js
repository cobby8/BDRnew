const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    html2canvas: path.resolve(__dirname, "node_modules/html2canvas/dist/html2canvas.js"),
};

// Fix for "Cannot use import.meta outside a module" when using Reanimated on Web
// Prioritize CJS to avoid experimental ESM in Reanimated
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = withNativeWind(config, { input: "./global.css" });
