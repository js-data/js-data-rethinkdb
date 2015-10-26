describe('handleErrors', function () {
  it('should do nothing when passed a falsy value', function () {
    var error
    try {
      adapter._handleErrors(false)
    } catch(err) {
      error = err
    }
    assert.equal(error, undefined)
  })
  it('should do nothing when errors is 0', function () {
    var error
    try {
      adapter._handleErrors({
        errors: 0
      })
    } catch(err) {
      error = err
    }
    assert.equal(error, undefined)
  })
  it('should throw an error when errors > 0 && first_error is a string', function () {
    var errorString = 'error string', error
    try {
      adapter._handleErrors({
        errors: 1,
        first_error: errorString
      })
    } catch(err) {
      error = err
    }
    assert.equal(error.message, errorString)
  })
  it('should throw a generic error when errors > 0 && first_error is nothing', function () {
    var error
    try {
      adapter._handleErrors({
        errors: 1,
      })
    } catch(err) {
      error = err
    }
    assert.equal(error.message, 'Unknown RethinkDB Error')
  })
})
