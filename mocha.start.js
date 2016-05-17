/*global assert:true */
'use strict'

// prepare environment for js-data-adapter-tests
import 'babel-polyfill'

import * as JSData from 'js-data'
import JSDataAdapterTests from './node_modules/js-data-adapter/dist/js-data-adapter-tests'
import * as JSDataRethinkDB from './src/index'

const assert = global.assert = JSDataAdapterTests.assert
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

describe('RethinkDBAdapter#handleErrors(err)', function () {
  it('should do nothing when passed a falsy value', function () {
    var Test = this
    assert.doesNotThrow(function () {
      Test.$$adapter._handleErrors(false)
    })
  })
  it('should do nothing when errors is 0', function () {
    var Test = this
    assert.doesNotThrow(function () {
      Test.$$adapter._handleErrors({
        errors: 0
      })
    })
  })
  it('should throw an error when errors > 0 && first_error is a string', function () {
    var Test = this
    var errorString = 'error string'
    assert.throws(function () {
      Test.$$adapter._handleErrors({
        errors: 1,
        first_error: errorString
      })
    }, Error, errorString)
  })
  it('should throw a generic error when errors > 0 && first_error is nothing', function () {
    var Test = this
    assert.throws(function () {
      Test.$$adapter._handleErrors({
        errors: 1
      })
    }, Error, 'Unknown RethinkDB Error')
  })
})

describe('exports', function () {
  it('should have correct exports', function () {
    assert(JSDataRethinkDB.RethinkDBAdapter)
    assert(JSDataRethinkDB.OPERATORS)
    assert(JSDataRethinkDB.OPERATORS['=='])
    assert(JSDataRethinkDB.version)
  })
})
