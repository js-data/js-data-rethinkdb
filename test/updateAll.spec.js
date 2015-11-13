describe('DSRethinkDBAdapter#updateAll', function() {
  it('should update all items', function*() {
    var user = yield adapter.create(User, {
      name: 'John',
      age: 20
    })
    var user2 = yield adapter.create(User, {
      name: 'John',
      age: 30
    })
    var users = yield adapter.findAll(User, {
      name: 'John'
    })
    users.sort(function(a, b) {
      return a.age - b.age
    })
    assert.deepEqual(users, [{
      id: user.id,
      name: 'John',
      age: 20
    }, {
      id: user2.id,
      name: 'John',
      age: 30
    }])
    users = yield adapter.updateAll(User, {
      name: 'Johnny'
    }, {
      name: 'John'
    })
    users.sort(function(a, b) {
      return a.age - b.age
    })
    assert.deepEqual(users, [{
      id: user.id,
      name: 'Johnny',
      age: 20
    }, {
      id: user2.id,
      name: 'Johnny',
      age: 30
    }])
    users = yield adapter.findAll(User, {
      name: 'John'
    })
    assert.deepEqual(users, [])
    assert.equal(users.length, 0)
    users = yield adapter.findAll(User, {
      name: 'Johnny'
    })
    users.sort(function(a, b) {
      return a.age - b.age
    })
    assert.deepEqual(users, [{
      id: user.id,
      name: 'Johnny',
      age: 20
    }, {
      id: user2.id,
      name: 'Johnny',
      age: 30
    }])
    users = yield adapter.destroyAll(User)
    assert.isFalse(!!users)
  })
  it('should still work if there are no changes', function*() {
    var user = yield adapter.create(User, {
      name: 'John',
      age: 20
    })
    var user2 = yield adapter.create(User, {
      name: 'John',
      age: 30
    })
    var users = yield adapter.findAll(User, {
      name: 'John'
    })
    users.sort(function(a, b) {
      return a.age - b.age
    })
    assert.deepEqual(users, [{
      id: user.id,
      name: 'John',
      age: 20
    }, {
      id: user2.id,
      name: 'John',
      age: 30
    }])
    users = yield adapter.updateAll(User, {
      name: 'John'
    }, {
      name: 'John'
    })
    users.sort(function(a, b) {
      return a.age - b.age
    })
    assert.deepEqual(users, [{
      id: user.id,
      name: 'John',
      age: 20
    }, {
      id: user2.id,
      name: 'John',
      age: 30
    }])
    users = yield adapter.findAll(User, {
      name: 'John'
    })
    users.sort(function(a, b) {
      return a.age - b.age
    })
    assert.deepEqual(users, [{
      id: user.id,
      name: 'John',
      age: 20
    }, {
      id: user2.id,
      name: 'John',
      age: 30
    }])
    users = yield adapter.destroyAll(User)
    assert.isFalse(!!users)
  })
})
