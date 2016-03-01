/*global assert:true */
'use strict'

// prepare environment for js-data-adapter-tests
require('babel-polyfill')

var JSData = require('js-data')
var JSDataAdapterTests = require('js-data-adapter-tests')
var RethinkDBAdapter = require('./')

global.assert = JSDataAdapterTests.assert
global.sinon = JSDataAdapterTests.sinon

JSDataAdapterTests.init({
  debug: false,
  JSData: JSData,
  Adapter: RethinkDBAdapter,
  adapterConfig: {
    min: 1,
    max: 5,
    bufferSize: 5
  },
  storeConfig: {
    bypassCache: true,
    linkRelations: false,
    cacheResponse: false,
    log: false,
    debug: false
  },
  features: [
    'findHasManyLocalKeys',
    'findHasManyForeignKeys'
  ]
})

require('./test/handleErrors.test')
