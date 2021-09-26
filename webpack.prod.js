const { merge } = require("lodash");
const PurgecssPlugin = require("purgecss-webpack-plugin");
const common = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const glob = require("glob");
const path = require("path");

console.log("I reached to production config....");
module.exports = merge(common, {
  mode: "production",

  devtool: "source-map",

  optimization: {
    minimizer: [new OptimizeCssAssetsPlugin(), new TerserPlugin()],
  },

  plugins: [
    new PurgecssPlugin({
      paths: glob.sync(`${path.join(__dirname)}/page/*`, { nodir: true }),
    }),
  ],
});
