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
      exclude: 'node_modules/**'
    })
  ]
}
