describe('DSRethinkDBAdapter#destroyAll', function() {
  it('should destroy all items', function*() {
    var user = yield adapter.create(User, {
      name: 'John'
    })
    var users = yield adapter.findAll(User, {
      name: 'John'
    })
    assert.equal(users.length, 1)
    assert.deepEqual(users[0], {
      id: user.id,
      name: 'John'
    })
    yield adapter.destroyAll(User, {
      name: 'John'
    })
    users = yield adapter.findAll(User, {
      name: 'John'
    })
    assert.equal(users.length, 0)
  })
})
