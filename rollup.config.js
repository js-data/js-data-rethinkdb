var babel = require('rollup-plugin-babel')

module.exports = {
  external: [
    'rethinkdbdash',
    'js-data',
    'js-data-adapter',
    'mout/string/underscore'
  ],
  plugins: [
    babel({
      babelrc: false,
      presets: [
        'es2015-rollup'
      ],
      exclude: 'node_modules/**'
    })
  ]
}
