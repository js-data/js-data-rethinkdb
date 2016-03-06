'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var jsData = require('js-data');
var Adapter = require('js-data-adapter');
var Adapter__default = _interopDefault(Adapter);
var rethinkdbdash = _interopDefault(require('rethinkdbdash'));
var underscore = _interopDefault(require('mout/string/underscore'));
var unique = _interopDefault(require('mout/array/unique'));

var babelHelpers = {};

babelHelpers.defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

babelHelpers;

var addHiddenPropsToTarget = jsData.utils.addHiddenPropsToTarget;
var classCallCheck = jsData.utils.classCallCheck;
var extend = jsData.utils.extend;
var fillIn = jsData.utils.fillIn;
var forEachRelation = jsData.utils.forEachRelation;
var forOwn = jsData.utils.forOwn;
var get = jsData.utils.get;
var isArray = jsData.utils.isArray;
var isObject = jsData.utils.isObject;
var isString = jsData.utils.isString;
var isUndefined = jsData.utils.isUndefined;
var omit = jsData.utils.omit;
var plainCopy = jsData.utils.plainCopy;
var resolve = jsData.utils.resolve;


var withoutRelations = function withoutRelations(mapper, props) {
  return omit(props, mapper.relationFields || []);
};

var DEFAULTS = {
  /**
   * RethinkDB authorization key.
   *
   * @name RethinkDBAdapter#authKey
   * @type {string}
   */
  authKey: '',

  /**
   * Buffer size for connection pool.
   *
   * @name RethinkDBAdapter#bufferSize
   * @type {number}
   * @default 10
   */
  bufferSize: 10,

  /**
   * Default database.
   *
   * @name RethinkDBAdapter#db
   * @type {string}
   * @default "test"
   */
  db: 'test',

  /**
   * RethinkDB host.
   *
   * @name RethinkDBAdapter#host
   * @type {string}
   * @default "localhost"
   */
  host: 'localhost',

  /**
   * Minimum connections in pool.
   *
   * @name RethinkDBAdapter#min
   * @type {number}
   * @default 10
   */
  min: 10,

  /**
   * Maximum connections in pool.
   *
   * @name RethinkDBAdapter#max
   * @type {number}
   * @default 50
   */
  max: 50,

  /**
   * RethinkDB port.
   *
   * @name RethinkDBAdapter#port
   * @type {number}
   * @default 10
   */
  port: 28015
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
 * @name RethinkDBAdapter.OPERATORS
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

/**
 * RethinkDBAdapter class.
 *
 * @example
 * // Use Container instead of DataStore on the server
 * import {Container} from 'js-data'
 * import RethinkdbDBAdapter from 'js-data-rethinkdb'
 *
 * // Create a store to hold your Mappers
 * const store = new Container()
 *
 * // Create an instance of RethinkdbDBAdapter with default settings
 * const adapter = new RethinkdbDBAdapter()
 *
 * // Mappers in "store" will use the RethinkDB adapter by default
 * store.registerAdapter('rethinkdb', adapter, { default: true })
 *
 * // Create a Mapper that maps to a "user" table
 * store.defineMapper('user')
 *
 * @class RethinkDBAdapter
 * @extends Adapter
 * @param {Object} [opts] Configuration opts.
 * @param {string} [opts.authKey=""] RethinkDB authorization key.
 * @param {number} [opts.bufferSize=10] Buffer size for connection pool.
 * @param {string} [opts.db="test"] Default database.
 * @param {boolean} [opts.debug=false] Whether to log debugging information.
 * @param {string} [opts.host="localhost"] RethinkDB host.
 * @param {number} [opts.max=50] Maximum connections in pool.
 * @param {number} [opts.min=10] Minimum connections in pool.
 * @param {Object} [opts.operators] Override the default predicate functions for
 * specified operators.
 * @param {number} [opts.port=28015] RethinkDB port.
 * @param {boolean} [opts.raw=false] Whether to return a more detailed response object.
 */
function RethinkDBAdapter(opts) {
  var self = this;
  classCallCheck(self, RethinkDBAdapter);
  opts || (opts = {});
  fillIn(opts, DEFAULTS);
  Adapter__default.call(self, opts);

  /**
   * Default options to pass to r#insert.
   *
   * @name RethinkDBAdapter#insertOpts
   * @type {Object}
   * @default {}
   */
  self.insertOpts || (self.insertOpts = {});
  fillIn(self.insertOpts, INSERT_OPTS_DEFAULTS);

  /**
   * Default options to pass to r#update.
   *
   * @name RethinkDBAdapter#updateOpts
   * @type {Object}
   * @default {}
   */
  self.updateOpts || (self.updateOpts = {});
  fillIn(self.updateOpts, UPDATE_OPTS_DEFAULTS);

  /**
   * Default options to pass to r#delete.
   *
   * @name RethinkDBAdapter#deleteOpts
   * @type {Object}
   * @default {}
   */
  self.deleteOpts || (self.deleteOpts = {});
  fillIn(self.deleteOpts, DELETE_OPTS_DEFAULTS);

  /**
   * Default options to pass to r#run.
   *
   * @name RethinkDBAdapter#runOpts
   * @type {Object}
   * @default {}
   */
  self.runOpts || (self.runOpts = {});
  fillIn(self.runOpts, RUN_OPTS_DEFAULTS);

  /**
   * Override the default predicate functions for specified operators.
   *
   * @name RethinkDBAdapter#operators
   * @type {Object}
   * @default {}
   */
  self.operators || (self.operators = {});

  /**
   * The rethinkdbdash instance used by this adapter. Use this directly when you
   * need to write custom queries.
   *
   * @name RethinkDBAdapter#r
   * @type {Object}
   */
  self.r = rethinkdbdash(opts);
  self.databases = {};
  self.tables = {};
  self.indices = {};
}

// Setup prototype inheritance from Adapter
RethinkDBAdapter.prototype = Object.create(Adapter__default.prototype, {
  constructor: {
    value: RethinkDBAdapter,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

Object.defineProperty(RethinkDBAdapter, '__super__', {
  configurable: true,
  value: Adapter__default
});

/**
 * Alternative to ES6 class syntax for extending `RethinkDBAdapter`.
 *
 * @name RethinkDBAdapter.extend
 * @method
 * @param {Object} [instanceProps] Properties that will be added to the
 * prototype of the RethinkDBAdapter.
 * @param {Object} [classProps] Properties that will be added as static
 * properties to the RethinkDBAdapter itself.
 * @return {Object} RethinkDBAdapter of `RethinkDBAdapter`.
 */
RethinkDBAdapter.extend = extend;

addHiddenPropsToTarget(RethinkDBAdapter.prototype, {
  _handleErrors: function _handleErrors(cursor) {
    if (cursor && cursor.errors > 0) {
      if (cursor.first_error) {
        throw new Error(cursor.first_error);
      }
      throw new Error('Unknown RethinkDB Error');
    }
  },
  selectDb: function selectDb(opts) {
    return this.r.db(isUndefined(opts.db) ? this.db : opts.db);
  },
  selectTable: function selectTable(mapper, opts) {
    return this.selectDb(opts).table(mapper.table || underscore(mapper.name));
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
    var self = this;
    var r = self.r;

    query = plainCopy(query || {});
    opts || (opts = {});
    opts.operators || (opts.operators = {});
    query.where || (query.where = {});
    query.orderBy || (query.orderBy = query.sort);
    query.orderBy || (query.orderBy = []);
    query.skip || (query.skip = query.offset);

    // Transform non-keyword properties to "where" clause configuration
    forOwn(query, function (config, keyword) {
      if (Adapter.reserved.indexOf(keyword) === -1) {
        if (isObject(config)) {
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
    if (Object.keys(query.where).length !== 0) {
      // Filter sequence using filter function
      rql = rql.filter(function (row) {
        var subQuery = void 0;
        // Apply filter for each field
        forOwn(query.where, function (criteria, field) {
          if (!isObject(criteria)) {
            criteria = { '==': criteria };
          }
          // Apply filter for each operator
          forOwn(criteria, function (value, operator) {
            var isOr = false;
            if (operator && operator[0] === '|') {
              operator = operator.substr(1);
              isOr = true;
            }
            var predicateFn = self.getOperator(operator, opts);
            if (predicateFn) {
              var predicateResult = predicateFn(r, row, field, value);
              if (isOr) {
                subQuery = subQuery ? subQuery.or(predicateResult) : predicateResult;
              } else {
                subQuery = subQuery ? subQuery.and(predicateResult) : predicateResult;
              }
            }
          });
        });
        return subQuery || true;
      });
    }

    // Sort
    if (query.orderBy) {
      if (isString(query.orderBy)) {
        query.orderBy = [[query.orderBy, 'asc']];
      }
      for (var i = 0; i < query.orderBy.length; i++) {
        if (isString(query.orderBy[i])) {
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
  waitForDb: function waitForDb(opts) {
    var self = this;
    opts || (opts = {});
    var db = isUndefined(opts.db) ? self.db : opts.db;
    if (!self.databases[db]) {
      self.databases[db] = self.r.branch(self.r.dbList().contains(db), true, self.r.dbCreate(db)).run();
    }
    return self.databases[db];
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
    var self = this;
    var op = void 0;
    props || (props = {});
    opts || (opts = {});

    return self.waitForTable(mapper, opts).then(function () {
      // beforeCreate lifecycle hook
      op = opts.op = 'beforeCreate';
      return resolve(self[op](mapper, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = isUndefined(_props) ? props : _props;
      var insertOpts = self.getOpt('insertOpts', opts);
      insertOpts.returnChanges = true;
      return self.selectTable(mapper, opts).insert(props, insertOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      self._handleErrors(cursor);
      var record = void 0;
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
        record = cursor.changes[0].new_val;
      }
      var response = new Adapter.Response(record, cursor, 'create');
      response.created = record ? 1 : 0;
      response = self.respond(response, opts);

      // afterCreate lifecycle hook
      op = opts.op = 'afterCreate';
      return resolve(self[op](mapper, props, opts, response)).then(function (_response) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_response) ? response : _response;
      });
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
    var self = this;
    var op = void 0;
    props || (props = {});
    opts || (opts = {});

    return self.waitForTable(mapper, opts).then(function () {
      // beforeCreateMany lifecycle hook
      op = opts.op = 'beforeCreateMany';
      return resolve(self[op](mapper, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = isUndefined(_props) ? props : _props;
      var insertOpts = self.getOpt('insertOpts', opts);
      insertOpts.returnChanges = true;
      _props = props.map(function (record) {
        return withoutRelations(mapper, record);
      });
      return self.selectTable(mapper, opts).insert(_props, insertOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      self._handleErrors(cursor);
      var records = [];
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes) {
        records = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      var result = new Adapter.Response(records, cursor, 'createMany');
      result.created = records.length;
      result = self.getOpt('raw', opts) ? result : result.data;

      // afterCreateMany lifecycle hook
      op = opts.op = 'afterCreateMany';
      return resolve(self[op](mapper, props, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
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
    var self = this;
    var op = void 0;
    opts || (opts = {});

    return self.waitForTable(mapper, opts).then(function () {
      // beforeDestroy lifecycle hook
      op = opts.op = 'beforeDestroy';
      return resolve(self[op](mapper, id, opts));
    }).then(function () {
      op = opts.op = 'destroy';
      self.dbg(op, id, opts);
      return self.selectTable(mapper, opts).get(id).delete(self.getOpt('deleteOpts', opts)).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var result = new Adapter.Response(undefined, cursor, 'destroy');
      result = self.getOpt('raw', opts) ? result : undefined;

      // afterDestroy lifecycle hook
      op = opts.op = 'afterDestroy';
      return resolve(self[op](mapper, id, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
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
    var self = this;
    var op = void 0;
    query || (query = {});
    opts || (opts = {});

    return self.waitForTable(mapper, opts).then(function () {
      // beforeDestroyAll lifecycle hook
      op = opts.op = 'beforeDestroyAll';
      return resolve(self[op](mapper, query, opts));
    }).then(function () {
      op = opts.op = 'destroyAll';
      self.dbg(op, query, opts);
      return self.filterSequence(self.selectTable(mapper, opts), query).delete(self.getOpt('deleteOpts', opts)).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var result = new Adapter.Response(undefined, cursor, 'destroyAll');
      result = self.getOpt('raw', opts) ? result : undefined;

      // afterDestroyAll lifecycle hook
      op = opts.op = 'afterDestroyAll';
      return resolve(self[op](mapper, query, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
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
    var self = this;
    var record = void 0,
        op = void 0;
    opts || (opts = {});
    opts.with || (opts.with = []);

    var relationList = mapper.relationList || [];
    var tasks = [self.waitForTable(mapper, opts)];

    relationList.forEach(function (def) {
      var relationName = def.relation;
      var relationDef = def.getRelation();
      if (!opts.with || opts.with.indexOf(relationName) === -1) {
        return;
      }
      if (def.foreignKey && def.type !== 'belongsTo') {
        if (def.type === 'belongsTo') {
          tasks.push(self.waitForIndex(mapper.table || underscore(mapper.name), def.foreignKey, opts));
        } else {
          tasks.push(self.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts));
        }
      }
    });
    return Promise.all(tasks).then(function () {
      // beforeFind lifecycle hook
      op = opts.op = 'beforeFind';
      return resolve(self[op](mapper, id, opts));
    }).then(function () {
      op = opts.op = 'find';
      self.dbg(op, id, opts);
      return self.selectTable(mapper, opts).get(id).run(self.getOpt('runOpts', opts));
    }).then(function (_record) {
      if (!_record) {
        return;
      }
      record = _record;
      var tasks = [];

      forEachRelation(mapper, opts, function (def, __opts) {
        var relatedMapper = def.getRelation();
        var task = void 0;

        if (def.foreignKey && (def.type === 'hasOne' || def.type === 'hasMany')) {
          if (def.type === 'hasOne') {
            task = self.loadHasOne(mapper, def, record, __opts);
          } else {
            task = self.loadHasMany(mapper, def, record, __opts);
          }
        } else if (def.type === 'hasMany' && def.localKeys) {
          var localKeys = [];
          var itemKeys = get(record, def.localKeys) || [];
          itemKeys = isArray(itemKeys) ? itemKeys : Object.keys(itemKeys);
          localKeys = localKeys.concat(itemKeys);
          task = self.findAll(relatedMapper, {
            where: babelHelpers.defineProperty({}, relatedMapper.idAttribute, {
              'in': unique(localKeys).filter(function (x) {
                return x;
              })
            })
          }, __opts).then(function (relatedItems) {
            def.setLocalField(record, relatedItems);
          });
        } else if (def.type === 'hasMany' && def.foreignKeys) {
          task = self.findAll(relatedMapper, {
            where: babelHelpers.defineProperty({}, def.foreignKeys, {
              'contains': self.makeHasManyForeignKeys(mapper, def, record)
            })
          }, __opts).then(function (relatedItems) {
            def.setLocalField(record, relatedItems);
          });
        } else if (def.type === 'belongsTo') {
          task = self.loadBelongsTo(mapper, def, record, __opts);
        }
        if (task) {
          tasks.push(task);
        }
      });

      return Promise.all(tasks);
    }).then(function () {
      var result = new Adapter.Response(record, {}, 'find');
      result.found = record ? 1 : 0;
      result = self.getOpt('raw', opts) ? result : result.data;

      // afterFind lifecycle hook
      op = opts.op = 'afterFind';
      return resolve(self[op](mapper, id, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
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
    var self = this;
    opts || (opts = {});
    opts.with || (opts.with = []);

    var records = [];
    var op = void 0;
    var relationList = mapper.relationList || [];
    var tasks = [self.waitForTable(mapper, opts)];

    relationList.forEach(function (def) {
      var relationName = def.relation;
      var relationDef = def.getRelation();
      if (!opts.with || opts.with.indexOf(relationName) === -1) {
        return;
      }
      if (def.foreignKey && def.type !== 'belongsTo') {
        if (def.type === 'belongsTo') {
          tasks.push(self.waitForIndex(mapper.table || underscore(mapper.name), def.foreignKey, opts));
        } else {
          tasks.push(self.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts));
        }
      }
    });
    return Promise.all(tasks).then(function () {
      // beforeFindAll lifecycle hook
      op = opts.op = 'beforeFindAll';
      return resolve(self[op](mapper, query, opts));
    }).then(function () {
      op = opts.op = 'findAll';
      self.dbg(op, query, opts);
      return self.filterSequence(self.selectTable(mapper, opts), query).run(self.getOpt('runOpts', opts));
    }).then(function (_records) {
      records = _records;
      var tasks = [];
      forEachRelation(mapper, opts, function (def, __opts) {
        var relatedMapper = def.getRelation();
        var idAttribute = mapper.idAttribute;
        var task = void 0;
        if (def.foreignKey && (def.type === 'hasOne' || def.type === 'hasMany')) {
          if (def.type === 'hasMany') {
            task = self.loadHasMany(mapper, def, records, __opts);
          } else {
            task = self.loadHasOne(mapper, def, records, __opts);
          }
        } else if (def.type === 'hasMany' && def.localKeys) {
          (function () {
            var localKeys = [];
            records.forEach(function (item) {
              var itemKeys = item[def.localKeys] || [];
              itemKeys = isArray(itemKeys) ? itemKeys : Object.keys(itemKeys);
              localKeys = localKeys.concat(itemKeys);
            });
            task = self.findAll(relatedMapper, {
              where: babelHelpers.defineProperty({}, relatedMapper.idAttribute, {
                'in': unique(localKeys).filter(function (x) {
                  return x;
                })
              })
            }, __opts).then(function (relatedItems) {
              records.forEach(function (item) {
                var attached = [];
                var itemKeys = get(item, def.localKeys) || [];
                itemKeys = isArray(itemKeys) ? itemKeys : Object.keys(itemKeys);
                relatedItems.forEach(function (relatedItem) {
                  if (itemKeys && itemKeys.indexOf(relatedItem[relatedMapper.idAttribute]) !== -1) {
                    attached.push(relatedItem);
                  }
                });
                def.setLocalField(item, attached);
              });
              return relatedItems;
            });
          })();
        } else if (def.type === 'hasMany' && def.foreignKeys) {
          task = self.findAll(relatedMapper, {
            where: babelHelpers.defineProperty({}, def.foreignKeys, {
              'isectNotEmpty': records.map(function (record) {
                return self.makeHasManyForeignKeys(mapper, def, record);
              })
            })
          }, __opts).then(function (relatedItems) {
            var foreignKeysField = def.foreignKeys;
            records.forEach(function (record) {
              var _relatedItems = [];
              var id = get(record, idAttribute);
              relatedItems.forEach(function (relatedItem) {
                var foreignKeys = get(relatedItems, foreignKeysField) || [];
                if (foreignKeys.indexOf(id) !== -1) {
                  _relatedItems.push(relatedItem);
                }
              });
              def.setLocalField(record, _relatedItems);
            });
          });
        } else if (def.type === 'belongsTo') {
          task = self.loadBelongsTo(mapper, def, records, __opts);
        }
        if (task) {
          tasks.push(task);
        }
      });
      return Promise.all(tasks);
    }).then(function () {
      records || (records = []);
      var result = new Adapter.Response(records, {}, 'findAll');
      result.found = records.length;
      result = self.getOpt('raw', opts) ? result : result.data;

      // afterFindAll lifecycle hook
      op = opts.op = 'afterFindAll';
      return resolve(self[op](mapper, query, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
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
    return isUndefined(opts.operators[operator]) ? ownOps[operator] || OPERATORS[operator] : opts.operators[operator];
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
    var self = this;
    props || (props = {});
    opts || (opts = {});
    var op = void 0;

    return self.waitForTable(mapper, opts).then(function () {
      // beforeUpdate lifecycle hook
      op = opts.op = 'beforeUpdate';
      return resolve(self[op](mapper, id, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = isUndefined(_props) ? props : _props;
      var updateOpts = self.getOpt('updateOpts', opts);
      updateOpts.returnChanges = true;
      return self.selectTable(mapper, opts).get(id).update(withoutRelations(mapper, props), updateOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var record = void 0;
      self._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
        record = cursor.changes[0].new_val;
      } else {
        throw new Error('Not Found');
      }
      var result = new Adapter.Response(record, cursor, 'update');
      result.updated = 1;
      result = self.getOpt('raw', opts) ? result : result.data;

      // afterUpdate lifecycle hook
      op = opts.op = 'afterUpdate';
      return resolve(self[op](mapper, id, props, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
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
    var self = this;
    props || (props = {});
    query || (query = {});
    opts || (opts = {});
    var op = void 0;

    return self.waitForTable(mapper, opts).then(function () {
      // beforeUpdateAll lifecycle hook
      op = opts.op = 'beforeUpdateAll';
      return resolve(self[op](mapper, props, query, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = isUndefined(_props) ? props : _props;
      var updateOpts = self.getOpt('updateOpts', opts);
      updateOpts.returnChanges = true;
      return self.filterSequence(self.selectTable(mapper, opts), query).update(withoutRelations(mapper, props), updateOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var records = [];
      self._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length) {
        records = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      var result = new Adapter.Response(records, cursor, 'update');
      result.updated = records.length;
      result = self.getOpt('raw', opts) ? result : result.data;

      // afterUpdateAll lifecycle hook
      op = opts.op = 'afterUpdateAll';
      return resolve(self[op](mapper, props, query, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
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
    var self = this;
    records || (records = []);
    opts || (opts = {});
    var op = void 0;
    var idAttribute = mapper.idAttribute;

    records = records.filter(function (record) {
      return get(record, idAttribute);
    });

    return self.waitForTable(mapper, opts).then(function () {
      // beforeUpdateMany lifecycle hook
      op = opts.op = 'beforeUpdateMany';
      return resolve(self[op](mapper, records, opts));
    }).then(function (_records) {
      // Allow for re-assignment from lifecycle hook
      _records = isUndefined(_records) ? records : _records;
      var insertOpts = self.getOpt('insertOpts', opts);
      insertOpts.returnChanges = true;
      insertOpts.conflict = 'update';
      _records = _records.map(function (record) {
        return withoutRelations(mapper, record);
      });
      return self.selectTable(mapper, opts).insert(_records, insertOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var updatedRecords = void 0;
      self._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length) {
        updatedRecords = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      var result = new Adapter.Response(updatedRecords || [], cursor, 'update');
      result.updated = result.data.length;
      result = self.getOpt('raw', opts) ? result : result.data;

      // afterUpdateMany lifecycle hook
      op = opts.op = 'afterUpdateMany';
      return resolve(self[op](mapper, records, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_result) ? result : _result;
      });
    });
  },
  waitForTable: function waitForTable(mapper, options) {
    var _this = this;

    var table = isString(mapper) ? mapper : mapper.table || underscore(mapper.name);
    options = options || {};
    var db = isUndefined(options.db) ? this.db : options.db;
    return this.waitForDb(options).then(function () {
      _this.tables[db] = _this.tables[db] || {};
      if (!_this.tables[db][table]) {
        _this.tables[db][table] = _this.r.branch(_this.r.db(db).tableList().contains(table), true, _this.r.db(db).tableCreate(table)).run();
      }
      return _this.tables[db][table];
    });
  },
  waitForIndex: function waitForIndex(table, index, options) {
    var _this2 = this;

    options = options || {};
    var db = isUndefined(options.db) ? this.db : options.db;
    return this.waitForDb(options).then(function () {
      return _this2.waitForTable(table, options);
    }).then(function () {
      _this2.indices[db] = _this2.indices[db] || {};
      _this2.indices[db][table] = _this2.indices[db][table] || {};
      if (!_this2.tables[db][table][index]) {
        _this2.tables[db][table][index] = _this2.r.branch(_this2.r.db(db).table(table).indexList().contains(index), true, _this2.r.db(db).table(table).indexCreate(index)).run().then(function () {
          return _this2.r.db(db).table(table).indexWait(index).run();
        });
      }
      return _this2.tables[db][table][index];
    });
  }
});

RethinkDBAdapter.OPERATORS = OPERATORS;

module.exports = RethinkDBAdapter;
//# sourceMappingURL=js-data-rethinkdb.js.map