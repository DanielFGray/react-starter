module.exports = ({ env }) => ({
  plugins: {
    'postcss-preset-env': { stage: 0 },
    'postcss-advanced-variables': {},
    'postcss-extend-rule': { onUnusedExtend: 'warn' },
    cssnano: env === 'production' ? { autoprefixer: false, safe: true, calc: false } : false,
  },
})
