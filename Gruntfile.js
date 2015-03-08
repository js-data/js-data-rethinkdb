/*
 * js-data-rethinkdb
 * http://github.com/js-data/js-data-rethinkdb
 *
 * Copyright (c) 2014-2015 Jason Dobry <http://www.js-data.io/js-data-rethinkdb>
 * Licensed under the MIT license. <https://github.com/js-data/js-data-rethinkdb/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  'use strict';

  require('jit-grunt')(grunt, {
    coveralls: 'grunt-karma-coveralls'
  });
  require('time-grunt')(grunt);

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/*.js'],
      jshintrc: '.jshintrc'
    },
    watch: {
      dist: {
        files: ['src/**/*.js'],
        tasks: ['build']
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage'
      }
    },
    mochaTest: {
      all: {
        options: {
          timeout: 20000,
          reporter: 'spec'
        },
        src: ['mocha.start.js', 'test/**/*.js']
      }
    },
    webpack: {
      dist: {
        debug: true,
        entry: './src/index.js',
        output: {
          filename: './dist/js-data-rethinkdb.js',
          libraryTarget: 'commonjs2',
          library: 'js-data-rethinkdb'
        },
        externals: [
          'mout/array/contains',
          'mout/object/forOwn',
          'mout/object/keys',
          'mout/object/deepMixIn',
          'mout/array/forEach',
          'mout/lang/isObject',
          'mout/lang/isArray',
          'mout/lang/isEmpty',
          'mout/lang/isString',
          'mout/string/upperCase',
          'mout/string/underscore',
          'bluebird',
          'js-data',
          'js-data-schema',
          'rethinkdbdash'
        ],
        module: {
          loaders: [
            { test: /(src)(.+)\.js$/, exclude: /node_modules/, loader: 'babel-loader?blacklist=useStrict' }
          ],
          preLoaders: [
            {
              test: /(src)(.+)\.js$|(test)(.+)\.js$/, // include .js files
              exclude: /node_modules/, // exclude any and all files in the node_modules folder
              loader: "jshint-loader?failOnHint=true"
            }
          ]
        }
      }
    }
  });

  grunt.registerTask('n', ['mochaTest']);

  grunt.registerTask('test', ['build', 'n']);
  grunt.registerTask('build', [
    'webpack'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('default', ['build']);
};
