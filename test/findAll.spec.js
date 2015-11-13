describe('DSRethinkDBAdapter#findAll', function() {
  it('should filter users', function*() {
    var users = yield adapter.findAll(User, {
      age: 30
    })
    assert.equal(users.length, 0)
    var user = yield adapter.create(User, {
      name: 'John'
    })
    var post = yield adapter.create(Post, {
      title: 'foo',
      userId: user.id
    })
    assert.equal(post.userId, user.id)
    var users = yield adapter.findAll(User, {
      name: 'John'
    }, {
      with: ['post', 'comment']
    })
    assert.equal(users.length, 1)
    assert.deepEqual(users[0], {
      id: user.id,
      name: 'John',
      comments: [],
      posts: [{
        id: post.id,
        userId: user.id,
        title: 'foo'
      }]
    })
    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })

  it('should filter users using the "in" operator', function*() {
    var users = yield adapter.findAll(User, {
      where: {
        age: {
          'in': [30]
        }
      }
    })
    assert.equal(users.length, 0)
    var user = yield adapter.create(User, {
      name: 'John'
    })
    users = yield adapter.findAll(User, {
      name: 'John'
    })
    assert.equal(users.length, 1)
    assert.deepEqual(users[0], {
      id: user.id,
      name: 'John'
    })
    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })

  it('should filter users using the "notContains" operator', function*() {
    var users = yield adapter.findAll(User, {
      where: {
        roles: {
          'notContains': 'user'
        }
      }
    })
    assert.equal(users.length, 0)
    
    var user = yield adapter.create(User, { name: 'John', roles: [ 'admin' ] })

    users = yield adapter.findAll(User, {
      where: {
        roles: {
          'notContains': 'user'
        }
      }
    })
    assert.equal(users.length, 1)
    assert.deepEqual(users[0], { id: user.id, name: 'John', roles: [ 'admin' ] })

    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })

  it('should filter users using the "contains" operator', function*() {
    var users = yield adapter.findAll(User, {
      where: {
        roles: {
          'contains': 'admin'
        }
      }
    })
    assert.equal(users.length, 0)
    
    var user = yield adapter.create(User, { name: 'John', roles: [ 'admin' ] })

    users = yield adapter.findAll(User, {
      where: {
        roles: {
          'contains': 'admin'
        }
      }
    })
    assert.equal(users.length, 1)
    assert.deepEqual(users[0], { id: user.id, name: 'John', roles: [ 'admin' ] })
    
    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })

  it('should filter users using the "like" operator', function*() {
    var users = yield adapter.findAll(User, {
      where: {
        name: {
          'like': 'J'
        }
      }
    })

    assert.equal(users.length, 0)
    var user = yield adapter.create(User, { name: 'John' })

    users = yield adapter.findAll(User, {
      where: {
        name: {
          'like': 'J'
        }
      }
    })

    assert.equal(users.length, 1)
    assert.deepEqual(users[0], { id: user.id, name: 'John' })

    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })

  it('should filter users using the "notLike" operator', function*() {
    var users = yield adapter.findAll(User, {
      where: {
        name: {
          'notLike': 'x'
        }
      }
    })
    assert.equal(users.length, 0);

    var user = yield adapter.create(User, { name: 'John' })

    users = yield adapter.findAll(User, {
      where: {
        name: {
          'notLike': 'x'
        }
      }
    })
    assert.equal(users.length, 1);
    assert.deepEqual(users[0], { id: user.id, name: 'John' })

    user = yield adapter.destroy(User, user.id)
    assert.isFalse(!!user)
  })
})
