module.exports = {
  debug: true,
  entry: './src/index.js',
  output: {
    filename: './dist/js-data-rethinkdb.js',
    libraryTarget: 'commonjs2',
    library: 'js-data-rethinkdb'
  },
  externals: [
    'mout/string/underscore',
    'bluebird',
    'js-data',
    'rethinkdbdash'
  ],
  module: {
    loaders: [{
      test: /(src)(.+)\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader?blacklist=useStrict'
    }]
  }
};
