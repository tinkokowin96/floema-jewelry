const path = require("path");
const glob = require("glob");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurgecssPlugin = require("purgecss-webpack-plugin");

module.exports = {
  mode: "production",

  devtool: "eval",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
  },

  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
  },

  entry: path.join(__dirname, "src/index.ts"),

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${path.join(__dirname)}/page/*`, { nodir: true }),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, "src")],
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },

      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },
};
