module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      loose: true,
      useBuiltIns: 'usage',
      corejs: 3,
    }],
    '@babel/preset-react',
  ],
  plugins: ['ramda', 'macros'],
}
