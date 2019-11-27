module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      loose: true,
      useBuiltIns: 'usage',
      corejs: 3,
    }],
    '@babel/preset-react',
  ],
  plugins: [
    'babel-plugin-graphql-tag',
    'react-hot-loader/babel',
    // ['@babel/plugin-proposal-class-properties', { loose: true }],
    // ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    // '@babel/plugin-proposal-throw-expressions',
    // '@babel/plugin-syntax-dynamic-import',
    // '@babel/plugin-proposal-do-expressions',
    // ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
  env: {
    production: {
      plugins: [
        'ramda',
        // 'transform-react-remove-prop-types'
      ],
    },
  },
}
