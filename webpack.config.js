const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, './example/src/index.html'),
  filename: './index.html'
})

const cssRule = {
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
  exclude: /node_modules/
}
const jsRule = {
  test: /\.(js | jsx)$/,
  use: 'babel-loader',
  exclude: /node_modules/
}
const tsRule = {
  test: /\.ts(x?)$/,
  use: 'ts-loader',
  exclude: /node_modules/
}
const eslintRule = {
  test: /\.ts(x?)$/,
  use: 'eslint-loader',
  exclude: /node_modules/
}

module.exports = {
  entry: path.resolve(__dirname, 'example/src/index.tsx'),
  output: {
    path: path.join(__dirname, 'example/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [eslintRule, jsRule, tsRule, cssRule]
  },
  plugins: [htmlWebpackPlugin],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  devServer: {
    port: 3001
  }
}