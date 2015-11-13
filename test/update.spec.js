describe('DSRethinkDBAdapter#update', function() {
  it('should update a user in RethinkDB', function*() {
    var id
    var user = yield adapter.create(User, {
      name: 'John'
    })
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    user = yield adapter.find(User, user.id)
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    assert.deepEqual(user, {
      id: user.id,
      name: 'John'
    })
    user = yield adapter.update(User, user.id, {
      name: 'Johnny'
    })
    assert.equal(user.name, 'Johnny')
    assert.isString(user.id)
    assert.deepEqual(user, {
      id: user.id,
      name: 'Johnny'
    })
    user = yield adapter.find(User, user.id)
    assert.equal(user.name, 'Johnny')
    assert.isString(user.id)
    assert.deepEqual(user, {
      id: user.id,
      name: 'Johnny'
    })
    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })
  it('should still work if there are no changes', function*() {
    var user = yield adapter.create(User, {
      name: 'John'
    })
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    user = yield adapter.find(User, user.id)
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    assert.deepEqual(user, {
      id: user.id,
      name: 'John'
    })
    user = yield adapter.update(User, user.id, user)
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    assert.deepEqual(user, {
      id: user.id,
      name: 'John'
    })
    user = yield adapter.find(User, user.id)
    assert.equal(user.name, 'John')
    assert.isString(user.id)
    assert.deepEqual(user, {
      id: user.id,
      name: 'John'
    })
    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })
})
