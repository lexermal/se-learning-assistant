const path = require("path");

module.exports = {
  output: "standalone",
  webpack(config) {
    config.resolve.alias["plugins"] = path.resolve(__dirname, "plugins");
    return config;
  },
};
