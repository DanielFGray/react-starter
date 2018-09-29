module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions'],
      },
      loose: true,
      modules: false
    }],
    '@babel/preset-react',
  ],
  plugins: [
    ['lodash', { id: ['lodash', 'ramda', 'recompose'] }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    // ['@babel/plugin-proposal-pipeline-operator', { proposal: 'smart' }],
    // '@babel/plugin-proposal-throw-expressions',
    // '@babel/plugin-syntax-dynamic-import',
    // '@babel/plugin-proposal-do-expressions',
    // ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
  env: {
    production: {
      plugins: ['transform-react-remove-prop-types'],
    },
  },
}
