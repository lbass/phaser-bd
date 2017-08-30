const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const dir_js = path.resolve(__dirname, 'src');
const dir_html = path.resolve(__dirname, 'html');
const dir_data = path.resolve(__dirname, 'data');
const dir_lib = path.resolve(__dirname, 'lib');
const dir_assets = path.resolve(__dirname, 'assets');
const dir_build = path.resolve(__dirname, 'build');
const dir_build_assets = path.resolve(__dirname, 'build/assets');
const dir_node_modules = path.resolve(__dirname, 'node_modules');
const webpack = require('webpack'), glob = require('glob');

module.exports = {
  entry: {
    main: glob.sync(dir_js + '/*.js'),
  },
  output: {
    path: dir_build,
    filename: 'main.js'
  },
  module: {
    loaders: [{
      test: dir_js,
      exclude: dir_node_modules,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }],
  },
  plugins: [
      new CopyWebpackPlugin([
        { from: dir_html },
        { from: dir_lib },
        { from: dir_data },
        { from: dir_assets, to: dir_build_assets}
      ])
      /*,
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
      */
  ],
  devtool: 'source-map',
  devServer: {
    port: 8080,
    publicPath: '/',
    inline: true,
    contentBase: path.join(__dirname, '/')
    //contentBase: dir_build
  }
}
