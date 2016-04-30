/*global assert:true */
'use strict'

// prepare environment for js-data-adapter-tests
require('babel-polyfill')

var JSData = require('js-data')
var JSDataAdapterTests = require('js-data-adapter-tests')
var JSDataRethinkDB = require('./')
var version = JSDataRethinkDB.version
var OPERATORS = JSDataRethinkDB.OPERATORS
var RethinkDBAdapter = JSDataRethinkDB.RethinkDBAdapter

var assert = global.assert = JSDataAdapterTests.assert
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
  // js-data-rethinkdb does NOT support these features
  xfeatures: [
    'findAllLikeOp',
    'filterOnRelations'
  ]
})

require('./test/handleErrors.test')

describe('exports', function () {
  assert(OPERATORS)
  assert(OPERATORS['=='])
  assert(version)
  assert(version.full)
})
