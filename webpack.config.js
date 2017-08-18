var path = require('path');

module.exports = {
  entry: ['./src/app.js'],
  devServer: {
    port: 8080,
    publicPath: '/',
    inline: true,
    contentBase: path.join(__dirname, '/')
  }
}
