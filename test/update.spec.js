describe('DSRethinkDBAdapter#update', function () {
  it('should update a user in RethinkDB', function () {
    var id;
    return adapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        assert.equal(user.name, 'John');
        assert.isString(user.id);
        return adapter.find(User, user.id);
      })
      .then(function (foundUser) {
        assert.equal(foundUser.name, 'John');
        assert.isString(foundUser.id);
        assert.deepEqual(foundUser, { id: id, name: 'John' });
        return adapter.update(User, foundUser.id, { name: 'Johnny' });
      })
      .then(function (updatedUser) {
        assert.equal(updatedUser.name, 'Johnny');
        assert.isString(updatedUser.id);
        assert.deepEqual(updatedUser, { id: id, name: 'Johnny' });
        return adapter.find(User, updatedUser.id);
      })
      .then(function (foundUser) {
        assert.equal(foundUser.name, 'Johnny');
        assert.isString(foundUser.id);
        assert.deepEqual(foundUser, { id: id, name: 'Johnny' });
        return adapter.destroy(User, foundUser.id);
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
