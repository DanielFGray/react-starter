
/* eslint-disable import/no-extraneous-dependencies,global-require */

const path = require('path')
const { DefinePlugin } = require('webpack')
const WebpackAssetsManifest = require('webpack-assets-manifest')
// const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nodeExternals = require('webpack-node-externals')
const {
  appBase,
  appMountId,
  appTitle,
  devMode,
  nodeEnv,
  outputDir,
  publicDir,
} = require('./config')

const constants = {
  __MOUNT: JSON.stringify(appMountId),
  __APPBASE: JSON.stringify(devMode ? '/' : appBase),
  __DEV: devMode,
  __BROWSER: true,
  __APPTITLE: JSON.stringify(appTitle),
}

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
  mode: nodeEnv,
  entry: { main: './src/client/index' },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: publicDir,
    filename: devMode ? '[name].js' : '[name]-[hash].js',
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
      output: path.join(outputDir, './manifest.json'),
      writeToDisk: true,
    }),
  ],
  stats,
}

const serverConfig = {
  name: 'server',
  mode: nodeEnv,
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
    filename: '[name].js',
    path: outputDir,
  },
  module: {
    rules: babelLoader,
  },
  plugins: [
    new DefinePlugin({ ...constants, __BROWSER: false }),
  ],
  stats,
}

if (! devMode) {
  clientConfig.plugins.push(
    // new BabelMinifyWebpackPlugin(),
    new CleanWebpackPlugin(['public']),
  )
}

module.exports = [clientConfig, serverConfig]
