describe('DSRethinkDBAdapter#destroy', function() {
  it('should destroy a user from RethinkDB', function*() {
    var id
    var user = yield adapter.create(User, {
      name: 'John'
    })
    id = user.id
    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
    try {
      user = yield adapter.find(User, id)
      throw new Error('Should not have reached here!')
    }
    catch (err) {
      assert.equal(err.message, 'Not Found!')
    }
  })
})
