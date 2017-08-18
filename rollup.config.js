import babel from 'rollup-plugin-babel'

export default {
  external: [
    'rethinkdbdash',
    'js-data',
    'js-data-adapter',
    'lodash.snakecase'
  ],
  plugins: [
    babel({
      babelrc: false,
      plugins: [
        'external-helpers'
      ],
      presets: [
        [
          'es2015',
          {
            modules: false
          }
        ]
      ],
      exclude: 'node_modules/**'
    })
  ]
}
