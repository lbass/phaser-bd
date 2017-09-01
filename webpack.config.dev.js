const path = require('path');
const webpack = require('webpack'), glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const dir_html = path.resolve(__dirname, 'html');
const dir_js = path.resolve(__dirname, 'src/js');
const dir_assets = path.resolve(__dirname, 'src/assets');

const dir_build = path.resolve(__dirname, 'build');
const dir_build_js = dir_build + '/js';
const dir_build_assets = dir_build + '/assets';

const phaser_file = dir_js + '/phaser.min.js';

module.exports = {
  entry: {
    main: dir_js + '/app.js'
  },
  output: {
    path: dir_build,
    publicPath: 'http://localhost:8080/',
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
            cacheDirectory: true,
            presets: ['es2015']
        },
        exclude: /node_modules/
      }
    ],
  },
  plugins: [
      new CopyWebpackPlugin([
        { from: dir_html, to: dir_build},
        { from: phaser_file, to: dir_build },
        { from: dir_assets, to: dir_build_assets}
      ])
  ],
  devtool: 'source-map',
  devServer: {
    port: 8080,
    inline: true,
    hot: true,
    contentBase: dir_build
  }
}
