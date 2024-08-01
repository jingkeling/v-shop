// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-px-to-viewport': {
      viewportWidth: 960, // 手机端为375，pc上设置大一点
      unitPrecision: 2,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore', /^body$/, '.hairlines', /^\.dp/, /^\.scroller/],
      minPixelValue: 1,
      mediaQuery: false,
    },
  },
};