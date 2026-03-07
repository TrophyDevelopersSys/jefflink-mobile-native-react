const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
// Monorepo root is one level up from jefflink-mobile/
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch all workspace packages so Metro rebuilds on shared-package changes
config.watchFolders = [workspaceRoot];

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
  // Resolve modules from both local and workspace node_modules
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  // Enable package.json exports field so @jefflink/* packages resolve correctly
  unstable_enablePackageExports: true,
};

module.exports = withNativeWind(config, { input: "./global.css" });
