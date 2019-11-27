/* eslint-disable import/no-extraneous-dependencies,global-require */
require('dotenv').config()
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const {
  NODE_ENV,
  PUBLIC_DIR,
  APP_TITLE,
  APP_BASE,
  MOUNT,
  HOST,
  PORT,
} = process.env

const DEV_MODE = NODE_ENV === 'development'

const rules = [
  {
    test: /node_modules[\\/].*\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
    ],
  },
  {
    exclude: /node_modules/,
    test: /\.(s|c)ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'postcss-loader',
    ],
  },
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

const plugins = [
  new HtmlWebpackPlugin({
    template: 'src/client/html.ejs',
    inject: false,
    title: APP_TITLE,
    appMountId: MOUNT,
    mobile: true,
  }),
  new DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(NODE_ENV),
      APP_BASE: JSON.stringify(APP_BASE),
      APP_TITLE: JSON.stringify(APP_TITLE),
      MOUNT: JSON.stringify(MOUNT),
    },
  }),
  new MiniCssExtractPlugin()
]

const stats = {
  chunks: false,
  modules: false,
  colors: true,
}

const clientConfig = {
  name: 'client',
  mode: NODE_ENV,
  entry: ['./src/client/index'],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: path.resolve(PUBLIC_DIR),
    filename: DEV_MODE ? '[name].js' : '[name]-[hash].js',
  },
  module: {
    rules,
  },
  plugins,
  stats,
}

module.exports = merge(
  clientConfig,
  DEV_MODE
    ? {
      devServer: {
        host: HOST,
        port: PORT,
        contentBase: PUBLIC_DIR,
        stats,
      },
    }
    : {
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].[hash].css',
        }),
      ],
    },
)
