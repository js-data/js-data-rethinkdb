/*global assert:true */
'use strict'

// prepare environment for js-data-adapter-tests
require('babel-polyfill')
global.assert = require('chai').assert

var JSData = require('js-data')
var TestRunner = require('js-data-adapter-tests')
var RethinkDBAdapter = require('./')

TestRunner.init({
  debug: false,
  DS: JSData.DS,
  Adapter: RethinkDBAdapter,
  adapterConfig: {},
  storeConfig: {
    bypassCache: true,
    linkRelations: false,
    cacheResponse: false,
    log: false,
    debug: false
  },
  features: [],
  methods: [
    'create',
    'destroy',
    'destroyAll',
    'find',
    'findAll',
    'update',
    'updateAll'
  ]
})

// require('./test/find.test')
