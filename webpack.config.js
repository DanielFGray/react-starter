/* eslint-disable import/no-extraneous-dependencies,global-require */

require('dotenv').config()
const path = require('path')
const { DefinePlugin } = require('webpack')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const { NODE_ENV, PUBLIC_DIR, OUTPUT_DIR, APP_TITLE, APP_BASE, MOUNT } = process.env

const devMode = NODE_ENV === 'development'

const cssLoaders = [
  {
    test: /node_modules[\\/].*\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
    ],
  },
  {
    exclude: /node_modules/,
    test: /\.(sc|[sc])ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'postcss-loader',
    ],
  },
]

const babelLoader = {
  test: /\.[tj]sx?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    },
  ],
}

const stats = {
  chunks: false,
  modules: false,
  colors: true,
}

const clientConfig = {
  name: 'client',
  mode: NODE_ENV,
  entry: [
    './src/client/index',
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: path.resolve(PUBLIC_DIR),
    publicPath: '/',
    filename: devMode ? '[name].js' : '[name]-[hash].js',
    chunkFilename: devMode ? '[name].js' : '[id]-[chunkhash].js',
  },
  module: {
    rules: cssLoaders.concat(babelLoader),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name]-[hash].css',
      chunkFilename: devMode ? '[name].css' : '[id]-[chunkhash].css',
    }),
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        APP_BASE: JSON.stringify(APP_BASE),
        APP_TITLE: JSON.stringify(APP_TITLE),
        MOUNT: JSON.stringify(MOUNT),
      },
    }),
    new WebpackAssetsManifest({
      // https://github.com/webdeveric/webpack-assets-manifest/#readme
      output: path.join(path.resolve(OUTPUT_DIR), './manifest.json'),
      writeToDisk: true,
    }),
    ...(
      devMode
        ? []
        : [new OptimizeCssAssetsPlugin()]
    ),
  ],
  stats,
}

const serverConfig = {
  name: 'server',
  mode: NODE_ENV,
  entry: { index: './src/index' },
  target: 'node',
  externals: [
    /config\.js$/,
    /manifest\.json$/,
    nodeExternals(),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(OUTPUT_DIR),
    publicPath: '/',
  },
  module: {
    rules: [babelLoader],
  },
  stats,
}

module.exports = [serverConfig, clientConfig]
