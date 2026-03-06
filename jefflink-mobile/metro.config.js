module.exports = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: ["png", "jpg", "jpeg", "gif", "svg"],
    sourceExts: ["js", "jsx", "ts", "tsx", "svg"],
  },
};