module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.modules.push("src");
      webpackConfig.resolve.extensions.push(".js", ".jsx");
      return webpackConfig;
    },
    alias: {
      "@components": "src/components",
      "@pages": "src/pages",
      "@assets": "src/assets",
    },
  },
};
