/*global assert:true */
'use strict'

// prepare environment for js-data-adapter-tests
import 'babel-polyfill'

import * as JSData from 'js-data'
import JSDataAdapterTests from './node_modules/js-data-adapter/dist/js-data-adapter-tests'
import * as JSDataRethinkDB from './src/index'

const assert = global.assert = JSDataAdapterTests.assert
global.sinon = JSDataAdapterTests.sinon

JSDataAdapterTests.init({
  debug: false,
  JSData: JSData,
  Adapter: JSDataRethinkDB.RethinkDBAdapter,
  adapterConfig: {
    rOpts: {
      buffer: 1,
      max: 5
    }
  },
  // js-data-rethinkdb does NOT support these features
  xfeatures: [
    'findAllLikeOp',
    'filterOnRelations'
  ]
})

describe('RethinkDBAdapter#handleErrors(err)', function () {
  it('should do nothing when passed a falsy value', function () {
    var Test = this
    assert.doesNotThrow(function () {
      Test.$$adapter._handleErrors(false)
    })
  })
  it('should do nothing when errors is 0', function () {
    var Test = this
    assert.doesNotThrow(function () {
      Test.$$adapter._handleErrors({
        errors: 0
      })
    })
  })
  it('should throw an error when errors > 0 && first_error is a string', function () {
    var Test = this
    var errorString = 'error string'
    assert.throws(function () {
      Test.$$adapter._handleErrors({
        errors: 1,
        first_error: errorString
      })
    }, Error, errorString)
  })
  it('should throw a generic error when errors > 0 && first_error is nothing', function () {
    var Test = this
    assert.throws(function () {
      Test.$$adapter._handleErrors({
        errors: 1
      })
    }, Error, 'Unknown RethinkDB Error')
  })
})

describe('exports', function () {
  it('should have correct exports', function () {
    assert(JSDataRethinkDB.RethinkDBAdapter)
    assert(JSDataRethinkDB.OPERATORS)
    assert(JSDataRethinkDB.OPERATORS['=='])
    assert(JSDataRethinkDB.version)
  })
})

describe('RethinkDBAdapter#find', function () {
  it('should allow subset of fields to be returned', function () {
    const User = this.$$User
    let props = { name: 'John', age: 30, role: 'admin', password: 'foo', address: { state: 'TX', zip: 12345 } }
    let user
    assert.debug('create', User.name, props)
    return this.$$adapter.create(User, props)
      .then((_user) => {
        user = _user

        return this.$$adapter.find(User, user[User.idAttribute], { fields: User.idAttribute })
      })
      .then((_user) => {
        assert.objectsEqual(_user, {
          [User.idAttribute]: user[User.idAttribute]
        }, 'only ID was selected')

        return this.$$adapter.find(User, user[User.idAttribute], { fields: [User.idAttribute, 'age'] })
      })
      .then((_user) => {
        assert.objectsEqual(_user, {
          [User.idAttribute]: user[User.idAttribute],
          age: user.age
        }, 'only ID and age were selected')
      })
  })
})

describe('RethinkDBAdapter#findAll', function () {
  it('should allow subset of fields to be returned', function () {
    const User = this.$$User
    let props = { name: 'John', age: 30, role: 'dev', password: 'foo', address: { state: 'TX', zip: 12345 } }
    let props2 = { name: 'Sally', age: 28, role: 'admin', password: 'bar', address: { state: 'MA', zip: 54321 } }
    let users
    assert.debug('create', User.name, [props, props2])
    return this.$$adapter.createMany(User, [props, props2])
      .then((_users) => {
        users = _users

        return this.$$adapter.findAll(User, { orderBy: 'name' }, { fields: User.idAttribute })
      })
      .then((_users) => {
        assert.objectsEqual(_users, [{
          [User.idAttribute]: users[0][User.idAttribute]
        }, {
          [User.idAttribute]: users[1][User.idAttribute]
        }], 'only ID was selected')

        return this.$$adapter.findAll(User, { orderBy: 'name' }, { fields: [User.idAttribute, 'age'] })
      })
      .then((_users) => {
        assert.objectsEqual(_users, [{
          [User.idAttribute]: users[0][User.idAttribute],
          age: users[0].age
        }, {
          [User.idAttribute]: users[1][User.idAttribute],
          age: users[1].age
        }], 'only ID and age were selected')
      })
  })
})
