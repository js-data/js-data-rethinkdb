describe('DSRethinkDBAdapter#create', function() {
  it('should create a user in RethinkDB', function*() {
    var id
    var user = yield adapter.create(User, {
      name: 'John'
    })
    id = user.id
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    user = yield adapter.find(User, user.id)
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    assert.deepEqual(user, {
      id: id,
      name: 'John'
    })
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
