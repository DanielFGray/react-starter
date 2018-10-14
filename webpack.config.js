/* eslint-disable import/no-extraneous-dependencies,global-require */

const path = require('path')
const { DefinePlugin } = require('webpack')
const WebpackAssetsManifest = require('webpack-assets-manifest')
// const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nodeExternals = require('webpack-node-externals')
const config = require('./config.js')

const constants = Object.entries(config)
  .map(([k, v]) => [`__${k}`, JSON.stringify(v)])
  .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {})

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

const babelLoader = [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },
]

const stats = {
  chunks: false,
  modules: false,
  colors: true,
}

const clientConfig = {
  name: 'client',
  mode: config.nodeEnv,
  entry: { main: './src/client/index' },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: config.publicDir,
    filename: config.devMode ? '[name].js' : '[name]-[hash].js',
    chunkFilename: '[id]-[chunkhash].js',
  },
  module: {
    rules: [...babelLoader, ...cssLoaders],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new DefinePlugin(constants),
    new WebpackAssetsManifest({
      // https://github.com/webdeveric/webpack-assets-manifest/#readme
      output: path.join(config.outputDir, './manifest.json'),
      writeToDisk: true,
    }),
  ],
  stats,
}

const serverConfig = {
  name: 'server',
  mode: config.nodeEnv,
  entry: { index: './src/index' },
  target: 'node',
  externals: [
    /config\.js$/,
    /manifest\.json$/,
    nodeExternals(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: config.outputDir,
    filename: '[name].js'
  },
  module: {
    rules: babelLoader,
  },
  plugins: [
    new DefinePlugin({ ...constants, __BROWSER: false }),
  ],
  stats,
}

if (! config.devMode) {
  clientConfig.plugins.push(
    // new BabelMinifyWebpackPlugin(),
    new CleanWebpackPlugin(['dist', 'public']),
  )
}

module.exports = [clientConfig, serverConfig]
