module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions'],
        node: 'current',
      },
      loose: true,
      useBuiltIns: 'usage',
    }],
    '@babel/preset-react',
  ],
  plugins: [
    'babel-plugin-graphql-tag',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    // ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    // '@babel/plugin-proposal-throw-expressions',
    // '@babel/plugin-syntax-dynamic-import',
    // '@babel/plugin-proposal-do-expressions',
    // ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
  env: {
    production: {
      plugins: [
        ['lodash', { id: ['lodash', 'ramda', 'recompose'] }],
        // 'transform-react-remove-prop-types'
      ],
    },
  },
}
