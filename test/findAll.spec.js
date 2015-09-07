describe('DSRethinkDBAdapter#findAll', function () {
  it('should filter users', function () {
    var id, postId;

    return adapter.findAll(User, {
      age: 30
    }).then(function (users) {
      assert.equal(users.length, 0);
      return adapter.create(User, { name: 'John' });
    }).then(function (user) {
      id = user.id;
      return adapter.create(Post, { title: 'foo', userId: user.id });
    }).then(function (post) {
      postId = post.id;
      assert.equal(post.userId, id);
      return adapter.findAll(User, {
        name: 'John'
      }, { with: ['post', 'comment']});
    }).then(function (users) {
      assert.equal(users.length, 1);
      assert.deepEqual(users[0], { id: id, name: 'John', comments: [], posts: [ { id: postId, userId:id, title: 'foo' } ] });
      return adapter.destroy(User, id);
    }).then(function (destroyedUser) {
      assert.isFalse(!!destroyedUser);
    });
  });
  it('should filter users using the "in" operator', function () {
    var id;

    return adapter.findAll(User, {
      where: {
        age: {
          'in': [30]
        }
      }
    }).then(function (users) {
      assert.equal(users.length, 0);
      return adapter.create(User, { name: 'John' });
    }).then(function (user) {
      id = user.id;
      return adapter.findAll(User, {
        name: 'John'
      });
    }).then(function (users) {
      assert.equal(users.length, 1);
      assert.deepEqual(users[0], { id: id, name: 'John' });
      return adapter.destroy(User, id);
    }).then(function (destroyedUser) {
      assert.isFalse(!!destroyedUser);
    });
  });
  it('should filter users using the "contains" operator', function () {
    var id;

    return adapter.findAll(User, {
      where: {
        name: {
          'contains': 'J'
        }
      }
    }).then(function (users) {
      assert.equal(users.length, 0);
      return adapter.create(User, { name: 'John' });
    }).then(function (user) {
      id = user.id;
      return adapter.findAll(User, {
        where: {
          name: {
            'contains': 'J'
          }
        }
      });
    }).then(function (users) {
      assert.equal(users.length, 1);
      assert.deepEqual(users[0], { id: id, name: 'John' });
      return adapter.destroy(User, id);
    }).then(function (destroyedUser) {
      assert.isFalse(!!destroyedUser);
    });
  });
});
