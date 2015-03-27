describe('DSRethinkDBAdapter#destroy', function () {
  it('should destroy a user from RethinkDB', function () {
    var id;
    return adapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        return adapter.destroy(User, user.id);
      })
      .then(function (user) {
        assert.isFalse(!!user);
        return adapter.find(User, id);
      })
      .then(function () {
        throw new Error('Should not have reached here!');
      })
      .catch(function (err) {
        assert.equal(err.message, 'Not Found!');
      });
  });
});
