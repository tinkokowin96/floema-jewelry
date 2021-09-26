const common = require("./webpack.common");
const { merge } = require("lodash");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval",
});
