'use strict'
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
