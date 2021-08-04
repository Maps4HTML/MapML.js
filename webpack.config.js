const
  webpack = require("webpack"),
  path = require('path'),
  webpackUglifyJsPlugin = require('webpack-uglify-js-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin')
;

module.exports = {
  entry: './src/mapml-viewer.js',
  output: {
    // filename: 'mapml-viewer-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: 'css-loader',
      },
      {
        test: /\.(js|jsx)$/,
        use: 'file-loader',
      }
    ]
  },
  mode: 'production',
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  watch: false, // Set to false to keep the grunt process alive
  watchOptions: {
    aggregateTimeout: 500,
    // poll: true // Use this when you need to fallback to poll based watching (webpack 1.9.1+ only)
  },
  keepalive: true, // defaults to true for watch and dev-server otherwise false
};
