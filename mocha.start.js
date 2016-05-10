/*global assert:true */
'use strict'

// prepare environment for js-data-adapter-tests
require('babel-polyfill')

var JSData = require('js-data')
var JSDataAdapterTests = require('js-data-adapter-tests')
var JSDataRethinkDB = require('./')

var assert = global.assert = JSDataAdapterTests.assert
global.sinon = JSDataAdapterTests.sinon

JSDataAdapterTests.init({
  debug: false,
  JSData: JSData,
  Adapter: JSDataRethinkDB.RethinkDBAdapter,
  adapterConfig: {
    rOpts: {
      buffer: 1,
      max: 5
    }
  },
  // js-data-rethinkdb does NOT support these features
  xfeatures: [
    'findAllLikeOp',
    'filterOnRelations'
  ]
})

require('./test/handleErrors.test')

describe('exports', function () {
  it('should have correct exports', function () {
    assert(JSDataRethinkDB.default)
    assert(JSDataRethinkDB.RethinkDBAdapter)
    assert(JSDataRethinkDB.RethinkDBAdapter === JSDataRethinkDB.default)
    assert(JSDataRethinkDB.OPERATORS)
    assert(JSDataRethinkDB.OPERATORS['=='])
    assert(JSDataRethinkDB.version)
    assert(JSDataRethinkDB.version.full)
  })
})
