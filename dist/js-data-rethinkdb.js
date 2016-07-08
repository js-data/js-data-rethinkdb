'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var jsData = require('js-data');
var jsDataAdapter = require('js-data-adapter');
var rethinkdbdash = _interopDefault(require('rethinkdbdash'));
var underscore = _interopDefault(require('mout/string/underscore'));

var __super__ = jsDataAdapter.Adapter.prototype;

var R_OPTS_DEFAULTS = {
  db: 'test'
};
var INSERT_OPTS_DEFAULTS = {};
var UPDATE_OPTS_DEFAULTS = {};
var DELETE_OPTS_DEFAULTS = {};
var RUN_OPTS_DEFAULTS = {};

var equal = function equal(r, row, field, value) {
  return row(field).default(null).eq(value);
};

var notEqual = function notEqual(r, row, field, value) {
  return row(field).default(null).ne(value);
};

/**
 * Default predicate functions for the filtering operators.
 *
 * @name module:js-data-rethinkdb.OPERATORS
 * @property {Function} = Equality operator.
 * @property {Function} == Equality operator.
 * @property {Function} != Inequality operator.
 * @property {Function} > "Greater than" operator.
 * @property {Function} >= "Greater than or equal to" operator.
 * @property {Function} < "Less than" operator.
 * @property {Function} <= "Less than or equal to" operator.
 * @property {Function} isectEmpty Operator to test that the intersection
 * between two arrays is empty.
 * @property {Function} isectNotEmpty Operator to test that the intersection
 * between two arrays is NOT empty.
 * @property {Function} in Operator to test whether a value is found in the
 * provided array.
 * @property {Function} notIn Operator to test whether a value is NOT found in
 * the provided array.
 * @property {Function} contains Operator to test whether an array contains the
 * provided value.
 * @property {Function} notContains Operator to test whether an array does NOT
 * contain the provided value.
 */
var OPERATORS = {
  '=': equal,
  '==': equal,
  '===': equal,
  '!=': notEqual,
  '!==': notEqual,
  '>': function _(r, row, field, value) {
    return row(field).default(null).gt(value);
  },
  '>=': function _(r, row, field, value) {
    return row(field).default(null).ge(value);
  },
  '<': function _(r, row, field, value) {
    return row(field).default(null).lt(value);
  },
  '<=': function _(r, row, field, value) {
    return row(field).default(null).le(value);
  },
  'isectEmpty': function isectEmpty(r, row, field, value) {
    return row(field).default([]).setIntersection(r.expr(value).default([])).count().eq(0);
  },
  'isectNotEmpty': function isectNotEmpty(r, row, field, value) {
    return row(field).default([]).setIntersection(r.expr(value).default([])).count().ne(0);
  },
  'in': function _in(r, row, field, value) {
    return r.expr(value).default(r.expr([])).contains(row(field).default(null));
  },
  'notIn': function notIn(r, row, field, value) {
    return r.expr(value).default(r.expr([])).contains(row(field).default(null)).not();
  },
  'contains': function contains(r, row, field, value) {
    return row(field).default([]).contains(value);
  },
  'notContains': function notContains(r, row, field, value) {
    return row(field).default([]).contains(value).not();
  }
};

Object.freeze(OPERATORS);

/**
 * RethinkDBAdapter class.
 *
 * @example
 * // Use Container instead of DataStore on the server
 * import {Container} from 'js-data'
 * import {RethinkDBAdapter} from 'js-data-rethinkdb'
 *
 * // Create a store to hold your Mappers
 * const store = new Container()
 *
 * // Create an instance of RethinkDBAdapter with default settings
 * const adapter = new RethinkDBAdapter()
 *
 * // Mappers in "store" will use the RethinkDB adapter by default
 * store.registerAdapter('rethinkdb', adapter, { default: true })
 *
 * // Create a Mapper that maps to a "user" table
 * store.defineMapper('user')
 *
 * @class RethinkDBAdapter
 * @extends Adapter
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Adapter#debug}.
 * @param {Object} [opts.deleteOpts={}] See {@link RethinkDBAdapter#deleteOpts}.
 * @param {Object} [opts.insertOpts={}] See {@link RethinkDBAdapter#insertOpts}.
 * @param {Object} [opts.operators={@link module:js-data-rethinkdb.OPERATORS}] See {@link RethinkDBAdapter#operators}.
 * @param {Object} [opts.r] See {@link RethinkDBAdapter#r}.
 * @param {boolean} [opts.raw=false] See {@link Adapter#raw}.
 * @param {Object} [opts.rOpts={}] See {@link RethinkDBAdapter#rOpts}.
 * @param {Object} [opts.runOpts={}] See {@link RethinkDBAdapter#runOpts}.
 * @param {Object} [opts.updateOpts={}] See {@link RethinkDBAdapter#updateOpts}.
 */
function RethinkDBAdapter(opts) {
  jsData.utils.classCallCheck(this, RethinkDBAdapter);
  opts || (opts = {});

  // Setup non-enumerable properties
  Object.defineProperties(this, {
    /**
     * The rethinkdbdash instance used by this adapter. Use this directly when
     * you need to write custom queries.
     *
     * @example <caption>Use default instance.</caption>
     * import {RethinkDBAdapter} from 'js-data-rethinkdb'
     * const adapter = new RethinkDBAdapter()
     * adapter.r.dbDrop('foo').then(...)
     *
     * @example <caption>Configure default instance.</caption>
     * import {RethinkDBAdapter} from 'js-data-rethinkdb'
     * const adapter = new RethinkDBAdapter({
     *   rOpts: {
     *     user: 'myUser',
     *     password: 'myPassword'
     *   }
     * })
     * adapter.r.dbDrop('foo').then(...)
     *
     * @example <caption>Provide a custom instance.</caption>
     * import rethinkdbdash from 'rethinkdbdash'
     * import {RethinkDBAdapter} from 'js-data-rethinkdb'
     * const r = rethinkdbdash()
     * const adapter = new RethinkDBAdapter({
     *   r: r
     * })
     * adapter.r.dbDrop('foo').then(...)
     *
     * @name RethinkDBAdapter#r
     * @type {Object}
     */
    r: {
      writable: true,
      value: undefined
    },
    databases: {
      value: {}
    },
    indices: {
      value: {}
    },
    tables: {
      value: {}
    }
  });

  jsDataAdapter.Adapter.call(this, opts);

  /**
   * Default options to pass to r#insert.
   *
   * @name RethinkDBAdapter#insertOpts
   * @type {Object}
   * @default {}
   */
  this.insertOpts || (this.insertOpts = {});
  jsData.utils.fillIn(this.insertOpts, INSERT_OPTS_DEFAULTS);

  /**
   * Default options to pass to r#update.
   *
   * @name RethinkDBAdapter#updateOpts
   * @type {Object}
   * @default {}
   */
  this.updateOpts || (this.updateOpts = {});
  jsData.utils.fillIn(this.updateOpts, UPDATE_OPTS_DEFAULTS);

  /**
   * Default options to pass to r#delete.
   *
   * @name RethinkDBAdapter#deleteOpts
   * @type {Object}
   * @default {}
   */
  this.deleteOpts || (this.deleteOpts = {});
  jsData.utils.fillIn(this.deleteOpts, DELETE_OPTS_DEFAULTS);

  /**
   * Default options to pass to r#run.
   *
   * @name RethinkDBAdapter#runOpts
   * @type {Object}
   * @default {}
   */
  this.runOpts || (this.runOpts = {});
  jsData.utils.fillIn(this.runOpts, RUN_OPTS_DEFAULTS);

  /**
   * Override the default predicate functions for the specified operators.
   *
   * @name RethinkDBAdapter#operators
   * @type {Object}
   * @default {}
   */
  this.operators || (this.operators = {});
  jsData.utils.fillIn(this.operators, OPERATORS);

  /**
   * Options to pass to a new `rethinkdbdash` instance, if one was not provided
   * at {@link RethinkDBAdapter#r}. See the [rethinkdbdash README][readme] for
   * instance options.
   *
   * [readme]: https://github.com/neumino/rethinkdbdash#importing-the-driver
   *
   * @example <caption>Connect to localhost:8080, and let the driver find other instances.</caption>
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   * const adapter = new RethinkDBAdapter({
   *   rOpts: {
   *     discovery: true
   *   }
   * })
   *
   * @example <caption>Connect to and only to localhost:8080.</caption>
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   * const adapter = new RethinkDBAdapter()
   *
   * @example <caption>Do not create a connection pool.</caption>
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   * const adapter = new RethinkDBAdapter({
   *   rOpts: {
   *     pool: false
   *   }
   * })
   *
   * @example <caption>Connect to a cluster seeding from `192.168.0.100`, `192.168.0.101`, `192.168.0.102`.</caption>
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   * const adapter = new RethinkDBAdapter({
   *   rOpts: {
   *     servers: [
   *       { host: '192.168.0.100', port: 28015 },
   *       { host: '192.168.0.101', port: 28015 },
   *       { host: '192.168.0.102', port: 28015 }
   *     ]
   *   }
   * })
   *
   * @name RethinkDBAdapter#rOpts
   * @see https://github.com/neumino/rethinkdbdash#importing-the-driver
   * @type {Object}
   */
  this.rOpts || (this.rOpts = {});
  jsData.utils.fillIn(this.rOpts, R_OPTS_DEFAULTS);

  this.r || (this.r = rethinkdbdash(this.rOpts));
}

jsDataAdapter.Adapter.extend({
  constructor: RethinkDBAdapter,

  _handleErrors: function _handleErrors(cursor) {
    if (cursor && cursor.errors > 0) {
      if (cursor.first_error) {
        throw new Error(cursor.first_error);
      }
      throw new Error('Unknown RethinkDB Error');
    }
  },
  _count: function _count(mapper, query, opts) {
    opts || (opts = {});
    query || (query = {});

    return this.filterSequence(this.selectTable(mapper, opts), query).count().run(this.getOpt('runOpts', opts)).then(function (count) {
      return [count, {}];
    });
  },
  _create: function _create(mapper, props, opts) {
    var _this = this;

    props || (props = {});
    opts || (opts = {});

    var insertOpts = this.getOpt('insertOpts', opts);
    insertOpts.returnChanges = true;

    return this.selectTable(mapper, opts).insert(props, insertOpts).run(this.getOpt('runOpts', opts)).then(function (cursor) {
      _this._handleErrors(cursor);
      var record = void 0;
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
        record = cursor.changes[0].new_val;
      }
      return [record, cursor];
    });
  },
  _createMany: function _createMany(mapper, props, opts) {
    var _this2 = this;

    props || (props = {});
    opts || (opts = {});

    var insertOpts = this.getOpt('insertOpts', opts);
    insertOpts.returnChanges = true;

    return this.selectTable(mapper, opts).insert(props, insertOpts).run(this.getOpt('runOpts', opts)).then(function (cursor) {
      _this2._handleErrors(cursor);
      var records = [];
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes) {
        records = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      return [records, cursor];
    });
  },
  _destroy: function _destroy(mapper, id, opts) {
    var _this3 = this;

    opts || (opts = {});

    return this.selectTable(mapper, opts).get(id).delete(this.getOpt('deleteOpts', opts)).run(this.getOpt('runOpts', opts)).then(function (cursor) {
      _this3._handleErrors(cursor);
      return [undefined, cursor];
    });
  },
  _destroyAll: function _destroyAll(mapper, query, opts) {
    var _this4 = this;

    query || (query = {});
    opts || (opts = {});

    return this.filterSequence(this.selectTable(mapper, opts), query).delete(this.getOpt('deleteOpts', opts)).run(this.getOpt('runOpts', opts)).then(function (cursor) {
      _this4._handleErrors(cursor);
      return [undefined, cursor];
    });
  },
  _find: function _find(mapper, id, opts) {
    opts || (opts = {});

    return this.selectTable(mapper, opts).get(id).run(this.getOpt('runOpts', opts)).then(function (record) {
      return [record, {}];
    });
  },
  _findAll: function _findAll(mapper, query, opts) {
    opts || (opts = {});
    query || (query = {});

    return this.filterSequence(this.selectTable(mapper, opts), query).run(this.getOpt('runOpts', opts)).then(function (records) {
      return [records, {}];
    });
  },
  _sum: function _sum(mapper, field, query, opts) {
    if (!jsData.utils.isString(field)) {
      throw new Error('field must be a string!');
    }
    opts || (opts = {});
    query || (query = {});

    return this.filterSequence(this.selectTable(mapper, opts), query).sum(field).run(this.getOpt('runOpts', opts)).then(function (sum) {
      return [sum, {}];
    });
  },
  _update: function _update(mapper, id, props, opts) {
    var _this5 = this;

    props || (props = {});
    opts || (opts = {});

    var updateOpts = this.getOpt('updateOpts', opts);
    updateOpts.returnChanges = true;

    return this.selectTable(mapper, opts).get(id).update(props, updateOpts).run(this.getOpt('runOpts', opts)).then(function (cursor) {
      var record = void 0;
      _this5._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
        record = cursor.changes[0].new_val;
      } else {
        throw new Error('Not Found');
      }
      return [record, cursor];
    });
  },
  _updateAll: function _updateAll(mapper, props, query, opts) {
    var _this6 = this;

    props || (props = {});
    query || (query = {});
    opts || (opts = {});

    var updateOpts = this.getOpt('updateOpts', opts);
    updateOpts.returnChanges = true;

    return this.filterSequence(this.selectTable(mapper, opts), query).update(props, updateOpts).run(this.getOpt('runOpts', opts)).then(function (cursor) {
      var records = [];
      _this6._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length) {
        records = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      return [records, cursor];
    });
  },
  _updateMany: function _updateMany(mapper, records, opts) {
    var _this7 = this;

    records || (records = []);
    opts || (opts = {});

    var insertOpts = this.getOpt('insertOpts', opts);
    insertOpts.returnChanges = true;
    insertOpts.conflict = 'update';

    return this.selectTable(mapper, opts).insert(records, insertOpts).run(this.getOpt('runOpts', opts)).then(function (cursor) {
      records = [];
      _this7._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length) {
        records = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      return [records, cursor];
    });
  },
  _applyWhereFromObject: function _applyWhereFromObject(where) {
    var fields = [];
    var ops = [];
    var predicates = [];
    jsData.utils.forOwn(where, function (clause, field) {
      if (!jsData.utils.isObject(clause)) {
        clause = {
          '==': clause
        };
      }
      jsData.utils.forOwn(clause, function (expr, op) {
        fields.push(field);
        ops.push(op);
        predicates.push(expr);
      });
    });
    return {
      fields: fields,
      ops: ops,
      predicates: predicates
    };
  },
  _applyWhereFromArray: function _applyWhereFromArray(where) {
    var _this8 = this;

    var groups = [];
    where.forEach(function (_where, i) {
      if (jsData.utils.isString(_where)) {
        return;
      }
      var prev = where[i - 1];
      var parser = jsData.utils.isArray(_where) ? _this8._applyWhereFromArray : _this8._applyWhereFromObject;
      var group = parser.call(_this8, _where);
      if (prev === 'or') {
        group.isOr = true;
      }
      groups.push(group);
    });
    groups.isArray = true;
    return groups;
  },
  _testObjectGroup: function _testObjectGroup(rql, group, row, opts) {
    var i = void 0;
    var r = this.r;
    var fields = group.fields;
    var ops = group.ops;
    var predicates = group.predicates;
    var len = ops.length;
    for (i = 0; i < len; i++) {
      var op = ops[i];
      var isOr = op.charAt(0) === '|';
      op = isOr ? op.substr(1) : op;
      var predicateFn = this.getOperator(op, opts);
      if (predicateFn) {
        var predicateResult = predicateFn(r, row, fields[i], predicates[i]);
        if (isOr) {
          rql = rql ? rql.or(predicateResult) : predicateResult;
        } else {
          rql = rql ? rql.and(predicateResult) : predicateResult;
        }
      } else {
        throw new Error('Operator ' + op + ' not supported!');
      }
    }
    return rql;
  },
  _testArrayGroup: function _testArrayGroup(rql, groups, row, opts) {
    var i = void 0;
    var len = groups.length;
    for (i = 0; i < len; i++) {
      var group = groups[i];
      var subQuery = void 0;
      if (group.isArray) {
        subQuery = this._testArrayGroup(rql, group, row, opts);
      } else {
        subQuery = this._testObjectGroup(null, group, row, opts);
      }
      if (groups[i - 1]) {
        if (group.isOr) {
          rql = rql.or(subQuery);
        } else {
          rql = rql.and(subQuery);
        }
      } else {
        rql = rql ? rql.and(subQuery) : subQuery;
      }
    }
    return rql;
  },


  /**
   * Apply the specified selection query to the provided RQL sequence.
   *
   * @name RethinkDBAdapter#filterSequence
   * @method
   * @param {Object} mapper The mapper.
   * @param {Object} [query] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.operators] Override the default predicate functions
   * for specified operators.
   */
  filterSequence: function filterSequence(sequence, query, opts) {
    var _this9 = this;

    var r = this.r;

    query = jsData.utils.plainCopy(query || {});
    opts || (opts = {});
    opts.operators || (opts.operators = {});
    query.where || (query.where = {});
    query.orderBy || (query.orderBy = query.sort);
    query.orderBy || (query.orderBy = []);
    query.skip || (query.skip = query.offset);

    // Transform non-keyword properties to "where" clause configuration
    jsData.utils.forOwn(query, function (config, keyword) {
      if (jsDataAdapter.reserved.indexOf(keyword) === -1) {
        if (jsData.utils.isObject(config)) {
          query.where[keyword] = config;
        } else {
          query.where[keyword] = {
            '==': config
          };
        }
        delete query[keyword];
      }
    });

    var rql = sequence;

    // Filter
    var groups = void 0;

    if (jsData.utils.isObject(query.where) && Object.keys(query.where).length !== 0) {
      groups = this._applyWhereFromArray([query.where]);
    } else if (jsData.utils.isArray(query.where)) {
      groups = this._applyWhereFromArray(query.where);
    }

    if (groups) {
      rql = rql.filter(function (row) {
        return _this9._testArrayGroup(null, groups, row, opts) || true;
      });
    }

    // Sort
    if (query.orderBy) {
      if (jsData.utils.isString(query.orderBy)) {
        query.orderBy = [[query.orderBy, 'asc']];
      }
      for (var i = 0; i < query.orderBy.length; i++) {
        if (jsData.utils.isString(query.orderBy[i])) {
          query.orderBy[i] = [query.orderBy[i], 'asc'];
        }
        rql = (query.orderBy[i][1] || '').toUpperCase() === 'DESC' ? rql.orderBy(r.desc(query.orderBy[i][0])) : rql.orderBy(query.orderBy[i][0]);
      }
    }

    // Offset
    if (query.skip) {
      rql = rql.skip(+query.skip);
    }

    // Limit
    if (query.limit) {
      rql = rql.limit(+query.limit);
    }

    return rql;
  },
  selectDb: function selectDb(opts) {
    return this.r.db(jsData.utils.isUndefined(opts.db) ? this.rOpts.db : opts.db);
  },
  selectTable: function selectTable(mapper, opts) {
    return this.selectDb(opts).table(mapper.table || underscore(mapper.name));
  },
  waitForDb: function waitForDb(opts) {
    opts || (opts = {});
    var db = jsData.utils.isUndefined(opts.db) ? this.rOpts.db : opts.db;
    if (!this.databases[db]) {
      this.databases[db] = this.r.branch(this.r.dbList().contains(db), true, this.r.dbCreate(db)).run();
    }
    return this.databases[db];
  },
  waitForTable: function waitForTable(mapper, opts) {
    var _this10 = this;

    opts || (opts = {});
    var table = jsData.utils.isString(mapper) ? mapper : mapper.table || underscore(mapper.name);
    var db = jsData.utils.isUndefined(opts.db) ? this.rOpts.db : opts.db;
    return this.waitForDb(opts).then(function () {
      _this10.tables[db] = _this10.tables[db] || {};
      if (!_this10.tables[db][table]) {
        _this10.tables[db][table] = _this10.r.branch(_this10.r.db(db).tableList().contains(table), true, _this10.r.db(db).tableCreate(table)).run();
      }
      return _this10.tables[db][table];
    });
  },
  waitForIndex: function waitForIndex(table, index, opts) {
    var _this11 = this;

    opts || (opts = {});
    var db = jsData.utils.isUndefined(opts.db) ? this.rOpts.db : opts.db;
    return this.waitForDb(opts).then(function () {
      return _this11.waitForTable(table, opts);
    }).then(function () {
      _this11.indices[db] = _this11.indices[db] || {};
      _this11.indices[db][table] = _this11.indices[db][table] || {};
      if (!_this11.tables[db][table][index]) {
        _this11.tables[db][table][index] = _this11.r.branch(_this11.r.db(db).table(table).indexList().contains(index), true, _this11.r.db(db).table(table).indexCreate(index)).run().then(function () {
          return _this11.r.db(db).table(table).indexWait(index).run();
        });
      }
      return _this11.tables[db][table][index];
    });
  },


  /**
   * Return the number of records that match the selection query.
   *
   * @name RethinkDBAdapter#count
   * @method
   * @param {Object} mapper the mapper.
   * @param {Object} [query] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  count: function count(mapper, query, opts) {
    var _this12 = this;

    opts || (opts = {});
    query || (query = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.count.call(_this12, mapper, query, opts);
    });
  },


  /**
   * Create a new record.
   *
   * @name RethinkDBAdapter#create
   * @method
   * @param {Object} mapper The mapper.
   * @param {Object} props The record to be created.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.insertOpts] Options to pass to r#insert.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  create: function create(mapper, props, opts) {
    var _this13 = this;

    props || (props = {});
    opts || (opts = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.create.call(_this13, mapper, props, opts);
    });
  },


  /**
   * Create multiple records in a single batch.
   *
   * @name RethinkDBAdapter#createMany
   * @method
   * @param {Object} mapper The mapper.
   * @param {Object} props The records to be created.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.insertOpts] Options to pass to r#insert.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  createMany: function createMany(mapper, props, opts) {
    var _this14 = this;

    props || (props = {});
    opts || (opts = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.createMany.call(_this14, mapper, props, opts);
    });
  },


  /**
   * Destroy the record with the given primary key.
   *
   * @name RethinkDBAdapter#destroy
   * @method
   * @param {Object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to destroy.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.deleteOpts] Options to pass to r#delete.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  destroy: function destroy(mapper, id, opts) {
    var _this15 = this;

    opts || (opts = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.destroy.call(_this15, mapper, id, opts);
    });
  },


  /**
   * Destroy the records that match the selection query.
   *
   * @name RethinkDBAdapter#destroyAll
   * @method
   * @param {Object} mapper the mapper.
   * @param {Object} [query] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.deleteOpts] Options to pass to r#delete.
   * @param {Object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  destroyAll: function destroyAll(mapper, query, opts) {
    var _this16 = this;

    opts || (opts = {});
    query || (query = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.destroyAll.call(_this16, mapper, query, opts);
    });
  },


  /**
   * Retrieve the record with the given primary key.
   *
   * @name RethinkDBAdapter#find
   * @method
   * @param {Object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to retrieve.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @param {string[]} [opts.with=[]] Relations to eager load.
   * @return {Promise}
   */
  find: function find(mapper, id, opts) {
    var _this17 = this;

    opts || (opts = {});
    opts.with || (opts.with = []);

    var relationList = mapper.relationList || [];
    var tasks = [this.waitForTable(mapper, opts)];

    relationList.forEach(function (def) {
      var relationName = def.relation;
      var relationDef = def.getRelation();
      if (!opts.with || opts.with.indexOf(relationName) === -1) {
        return;
      }
      if (def.foreignKey && def.type !== 'belongsTo') {
        if (def.type === 'belongsTo') {
          tasks.push(_this17.waitForIndex(mapper.table || underscore(mapper.name), def.foreignKey, opts));
        } else {
          tasks.push(_this17.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts));
        }
      }
    });
    return Promise.all(tasks).then(function () {
      return __super__.find.call(_this17, mapper, id, opts);
    });
  },


  /**
   * Retrieve the records that match the selection query.
   *
   * @name RethinkDBAdapter#findAll
   * @method
   * @param {Object} mapper The mapper.
   * @param {Object} [query] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @param {string[]} [opts.with=[]] Relations to eager load.
   * @return {Promise}
   */
  findAll: function findAll(mapper, query, opts) {
    var _this18 = this;

    opts || (opts = {});
    opts.with || (opts.with = []);
    query || (query = {});

    var relationList = mapper.relationList || [];
    var tasks = [this.waitForTable(mapper, opts)];

    relationList.forEach(function (def) {
      var relationName = def.relation;
      var relationDef = def.getRelation();
      if (!opts.with || opts.with.indexOf(relationName) === -1) {
        return;
      }
      if (def.foreignKey && def.type !== 'belongsTo') {
        if (def.type === 'belongsTo') {
          tasks.push(_this18.waitForIndex(mapper.table || underscore(mapper.name), def.foreignKey, opts));
        } else {
          tasks.push(_this18.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts));
        }
      }
    });
    return Promise.all(tasks).then(function () {
      return __super__.findAll.call(_this18, mapper, query, opts);
    });
  },


  /**
   * Resolve the predicate function for the specified operator based on the
   * given options and this adapter's settings.
   *
   * @name RethinkDBAdapter#getOperator
   * @method
   * @param {string} operator The name of the operator.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @return {*} The predicate function for the specified operator.
   */
  getOperator: function getOperator(operator, opts) {
    opts || (opts = {});
    opts.operators || (opts.operators = {});
    var ownOps = this.operators || {};
    return jsData.utils.isUndefined(opts.operators[operator]) ? ownOps[operator] : opts.operators[operator];
  },


  /**
   * Return the sum of the specified field of records that match the selection
   * query.
   *
   * @name RethinkDBAdapter#sum
   * @method
   * @param {Object} mapper The mapper.
   * @param {string} field The field to sum.
   * @param {Object} [query] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  sum: function sum(mapper, field, query, opts) {
    var _this19 = this;

    opts || (opts = {});
    query || (query = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.sum.call(_this19, mapper, field, query, opts);
    });
  },


  /**
   * Apply the given update to the record with the specified primary key.
   *
   * @name RethinkDBAdapter#update
   * @method
   * @param {Object} mapper The mapper.
   * @param {(string|number)} id The primary key of the record to be updated.
   * @param {Object} props The update to apply to the record.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.updateOpts] Options to pass to r#update.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  update: function update(mapper, id, props, opts) {
    var _this20 = this;

    props || (props = {});
    opts || (opts = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.update.call(_this20, mapper, id, props, opts);
    });
  },


  /**
   * Apply the given update to all records that match the selection query.
   *
   * @name RethinkDBAdapter#updateAll
   * @method
   * @param {Object} mapper The mapper.
   * @param {Object} props The update to apply to the selected records.
   * @param {Object} [query] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @param {Object} [opts.updateOpts] Options to pass to r#update.
   * @return {Promise}
   */
  updateAll: function updateAll(mapper, props, query, opts) {
    var _this21 = this;

    props || (props = {});
    query || (query = {});
    opts || (opts = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.updateAll.call(_this21, mapper, props, query, opts);
    });
  },


  /**
   * Update the given records in a single batch.
   *
   * @name RethinkDBAdapter#updateMany
   * @method
   * @param {Object} mapper The mapper.
   * @param {Object[]} records The records to update.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.insertOpts] Options to pass to r#insert.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  updateMany: function updateMany(mapper, records, opts) {
    var _this22 = this;

    records || (records = []);
    opts || (opts = {});

    return this.waitForTable(mapper, opts).then(function () {
      return __super__.updateMany.call(_this22, mapper, records, opts);
    });
  }
});

/**
 * Details of the current version of the `js-data-rethinkdb` module.
 *
 * @example <caption>ES2015 modules import</caption>
 * import {version} from 'js-data-rethinkdb'
 * console.log(version.full)
 *
 * @example <caption>CommonJS import</caption>
 * var version = require('js-data-rethinkdb').version
 * console.log(version.full)
 *
 * @name module:js-data-rethinkdb.version
 * @type {Object}
 * @property {string} version.full The full semver value.
 * @property {number} version.major The major version number.
 * @property {number} version.minor The minor version number.
 * @property {number} version.patch The patch version number.
 * @property {(string|boolean)} version.alpha The alpha version value,
 * otherwise `false` if the current version is not alpha.
 * @property {(string|boolean)} version.beta The beta version value,
 * otherwise `false` if the current version is not beta.
 */
var version = {
  beta: 8,
  full: '3.0.0-beta.8',
  major: 3,
  minor: 0,
  patch: 0
};

/**
 * {@link RethinkDBAdapter} class.
 *
 * @example <caption>ES2015 modules import</caption>
 * import {RethinkDBAdapter} from 'js-data-rethinkdb'
 * const adapter = new RethinkDBAdapter()
 *
 * @example <caption>CommonJS import</caption>
 * var RethinkDBAdapter = require('js-data-rethinkdb').RethinkDBAdapter
 * var adapter = new RethinkDBAdapter()
 *
 * @name module:js-data-rethinkdb.RethinkDBAdapter
 * @see RethinkDBAdapter
 * @type {Constructor}
 */

/**
 * Registered as `js-data-rethinkdb` in NPM.
 *
 * @example <caption>Install from NPM</caption>
 * npm i --save js-data-rethinkdb@beta js-data@beta rethinkdbdash
 *
 * @example <caption>ES2015 modules import</caption>
 * import {RethinkDBAdapter} from 'js-data-rethinkdb'
 * const adapter = new RethinkDBAdapter()
 *
 * @example <caption>CommonJS import</caption>
 * var RethinkDBAdapter = require('js-data-rethinkdb').RethinkDBAdapter
 * var adapter = new RethinkDBAdapter()
 *
 * @module js-data-rethinkdb
 */

/**
 * Create a subclass of this RethinkDBAdapter:
 * @example <caption>RethinkDBAdapter.extend</caption>
 * // Normally you would do: import {RethinkDBAdapter} from 'js-data-rethinkdb'
 * const JSDataRethinkDB = require('js-data-rethinkdb@3.0.0-beta.8')
 * const {RethinkDBAdapter} = JSDataRethinkDB
 * console.log('Using JSDataRethinkDB v' + JSDataRethinkDB.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomRethinkDBAdapterClass extends RethinkDBAdapter {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customRethinkDBAdapter = new CustomRethinkDBAdapterClass()
 * console.log(customRethinkDBAdapter.foo())
 * console.log(CustomRethinkDBAdapterClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherRethinkDBAdapterClass = RethinkDBAdapter.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherRethinkDBAdapter = new OtherRethinkDBAdapterClass()
 * console.log(otherRethinkDBAdapter.foo())
 * console.log(OtherRethinkDBAdapterClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherRethinkDBAdapterClass () {
 *   RethinkDBAdapter.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * RethinkDBAdapter.extend({
 *   constructor: AnotherRethinkDBAdapterClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherRethinkDBAdapter = new AnotherRethinkDBAdapterClass()
 * console.log(anotherRethinkDBAdapter.created_at)
 * console.log(anotherRethinkDBAdapter.foo())
 * console.log(AnotherRethinkDBAdapterClass.beep())
 *
 * @method RethinkDBAdapter.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this RethinkDBAdapter class.
 * @since 3.0.0
 */

exports.OPERATORS = OPERATORS;
exports.RethinkDBAdapter = RethinkDBAdapter;
exports.version = version;
//# sourceMappingURL=js-data-rethinkdb.js.map