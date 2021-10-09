/*
 * @Date: 2020-06-09 16:52:20
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-08 18:27:45
 * @Description: file content
 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, './packages/example/src/index.html'),
  filename: './index.html'
})

const cssRule = {
  test: /\.less$/,
  use: ['style-loader', 'css-loader', 'less-loader'],
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

module.exports = {
  entry: path.resolve(__dirname, 'packages/example/src/index.tsx'),
  output: {
    path: path.join(__dirname, 'packages/example/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [jsRule, tsRule, cssRule]
  },
  plugins: [htmlWebpackPlugin],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  devServer: {
    port: 3001,
    historyApiFallback: true
  }
}