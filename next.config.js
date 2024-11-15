const path = require("path");

module.exports = {
    webpack(config) {
      config.resolve.alias["plugins"] = path.resolve(__dirname, "plugins");
      return config;
    },
  };
  