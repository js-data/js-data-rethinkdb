var Promise = require('bluebird')
describe('DSRethinkDBAdapter#find', function() {
  it('should find a user in RethinkDB', function*() {
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
    var post = yield adapter.create(Post, {
      content: 'test',
      userId: user.id
    })
    assert.equal(post.content, 'test')
    assert.isString(post.id)
    assert.isString(post.userId)
    var comments = yield Promise.all([
      adapter.create(Comment, {
        content: 'test2',
        postId: post.id,
        userId: user.id
      }),
      adapter.create(Comment, {
        content: 'test3',
        postId: post.id,
        userId: user.id
      })
    ])
    comments.sort(function(a, b) {
      return a.content > b.content
    })
    post = yield adapter.find(Post, post.id, {
      with: ['user', 'comment']
    })
    post.comments.sort(function(a, b) {
      return a.content > b.content
    })
    assert.equal(JSON.stringify(post.user), JSON.stringify(user))
    assert.equal(JSON.stringify(post.comments), JSON.stringify(comments))
    yield adapter.destroy(User, user.id)
    try {
      yield adapter.find(User, user.id)
      throw new Error('Should not have reached here!')
    }
    catch (err) {
      assert.equal(err.message, 'Not Found!')
    }

    yield adapter.destroy(Post, post.id)
  })
})
