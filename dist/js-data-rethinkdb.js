'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var jsData = require('js-data');
var rethinkdbdash = _interopDefault(require('rethinkdbdash'));
var underscore = _interopDefault(require('mout/string/underscore'));

var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

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
var fillIn = jsData.utils.fillIn;
var forEachRelation = jsData.utils.forEachRelation;
var forOwn = jsData.utils.forOwn;
var get = jsData.utils.get;
var isArray = jsData.utils.isArray;
var isObject = jsData.utils.isObject;
var isString = jsData.utils.isString;
var isUndefined = jsData.utils.isUndefined;
var resolve = jsData.utils.resolve;


var reserved = ['orderBy', 'sort', 'limit', 'offset', 'skip', 'where'];

var unique = function unique(array) {
  var seen = {};
  var final = [];
  array.forEach(function (item) {
    if (item in seen) {
      return;
    }
    final.push(item);
    seen[item] = 0;
  });
  return final;
};

var noop = function noop() {
  var self = this;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var opts = args[args.length - 1];
  self.dbg.apply(self, [opts.op].concat(args));
  return resolve();
};

var noop2 = function noop2() {
  var self = this;

  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var opts = args[args.length - 2];
  self.dbg.apply(self, [opts.op].concat(args));
  return resolve();
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
   * Whether to log debugging information.
   *
   * @name RethinkDBAdapter#debug
   * @type {boolean}
   * @default false
   */
  debug: false,

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
  port: 28015,

  /**
   * Whether to return a more detailed response object.
   *
   * @name RethinkDBAdapter#raw
   * @type {boolean}
   * @default false
   */
  raw: false
};

var INSERT_OPTS_DEFAULTS = {};
var UPDATE_OPTS_DEFAULTS = {};
var DELETE_OPTS_DEFAULTS = {};
var RUN_OPTS_DEFAULTS = {};

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
 * @param {Object} [opts] Configuration opts.
 * @param {string} [opts.authKey=""] RethinkDB authorization key.
 * @param {number} [opts.bufferSize=10] Buffer size for connection pool.
 * @param {string} [opts.db="test"] Default database.
 * @param {boolean} [opts.debug=false] Whether to log debugging information.
 * @param {string} [opts.host="localhost"] RethinkDB host.
 * @param {number} [opts.max=50] Maximum connections in pool.
 * @param {number} [opts.min=10] Minimum connections in pool.
 * @param {number} [opts.port=28015] RethinkDB port.
 * @param {boolean} [opts.raw=false] Whether to return detailed result objects
 * instead of just record data.
 */
function RethinkDBAdapter(opts) {
  var self = this;
  opts || (opts = {});
  fillIn(opts, DEFAULTS);
  fillIn(self, opts);

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

addHiddenPropsToTarget(RethinkDBAdapter.prototype, {
  _handleErrors: function _handleErrors(cursor) {
    if (cursor && cursor.errors > 0) {
      if (cursor.first_error) {
        throw new Error(cursor.first_error);
      }
      throw new Error('Unknown RethinkDB Error');
    }
  },

  /**
   * @name RethinkDBAdapter#afterCreate
   * @method
   */
  afterCreate: noop2,

  /**
   * @name RethinkDBAdapter#afterCreateMany
   * @method
   */
  afterCreateMany: noop2,

  /**
   * @name RethinkDBAdapter#afterDestroy
   * @method
   */
  afterDestroy: noop2,

  /**
   * @name RethinkDBAdapter#afterDestroyAll
   * @method
   */
  afterDestroyAll: noop2,

  /**
   * @name RethinkDBAdapter#afterFind
   * @method
   */
  afterFind: noop2,

  /**
   * @name RethinkDBAdapter#afterFindAll
   * @method
   */
  afterFindAll: noop2,

  /**
   * @name RethinkDBAdapter#afterUpdate
   * @method
   */
  afterUpdate: noop2,

  /**
   * @name RethinkDBAdapter#afterUpdateAll
   * @method
   */
  afterUpdateAll: noop2,

  /**
   * @name RethinkDBAdapter#afterUpdateMany
   * @method
   */
  afterUpdateMany: noop2,

  /**
   * @name RethinkDBAdapter#beforeCreate
   * @method
   */
  beforeCreate: noop,

  /**
   * @name RethinkDBAdapter#beforeCreateMany
   * @method
   */
  beforeCreateMany: noop,

  /**
   * @name RethinkDBAdapter#beforeDestroy
   * @method
   */
  beforeDestroy: noop,

  /**
   * @name RethinkDBAdapter#beforeDestroyAll
   * @method
   */
  beforeDestroyAll: noop,

  /**
   * @name RethinkDBAdapter#beforeFind
   * @method
   */
  beforeFind: noop,

  /**
   * @name RethinkDBAdapter#beforeFindAll
   * @method
   */
  beforeFindAll: noop,

  /**
   * @name RethinkDBAdapter#beforeUpdate
   * @method
   */
  beforeUpdate: noop,

  /**
   * @name RethinkDBAdapter#beforeUpdateAll
   * @method
   */
  beforeUpdateAll: noop,

  /**
   * @name RethinkDBAdapter#beforeUpdateMany
   * @method
   */
  beforeUpdateMany: noop,

  /**
   * @name RethinkDBAdapter#dbg
   * @method
   */
  dbg: function dbg() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    this.log.apply(this, ['debug'].concat(args));
  },
  selectDb: function selectDb(opts) {
    return this.r.db(isUndefined(opts.db) ? this.db : opts.db);
  },
  selectTable: function selectTable(mapper, opts) {
    return this.selectDb(opts).table(mapper.table || underscore(mapper.name));
  },
  filterSequence: function filterSequence(sequence, params) {
    var r = this.r;
    params = params || {};
    params.where = params.where || {};
    params.orderBy = params.orderBy || params.sort;
    params.skip = params.skip || params.offset;

    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (reserved.indexOf(k) === -1) {
        if (isObject(v)) {
          params.where[k] = v;
        } else {
          params.where[k] = {
            '==': v
          };
        }
        delete params[k];
      }
    });

    var query = sequence;

    if (Object.keys(params.where).length !== 0) {
      query = query.filter(function (row) {
        var subQuery = undefined;
        forOwn(params.where, function (criteria, field) {
          if (!isObject(criteria)) {
            criteria = { '==': criteria };
          }
          forOwn(criteria, function (v, op) {
            if (op === '==' || op === '===') {
              subQuery = subQuery ? subQuery.and(row(field).default(null).eq(v)) : row(field).default(null).eq(v);
            } else if (op === '!=' || op === '!==') {
              subQuery = subQuery ? subQuery.and(row(field).default(null).ne(v)) : row(field).default(null).ne(v);
            } else if (op === '>') {
              subQuery = subQuery ? subQuery.and(row(field).default(null).gt(v)) : row(field).default(null).gt(v);
            } else if (op === '>=') {
              subQuery = subQuery ? subQuery.and(row(field).default(null).ge(v)) : row(field).default(null).ge(v);
            } else if (op === '<') {
              subQuery = subQuery ? subQuery.and(row(field).default(null).lt(v)) : row(field).default(null).lt(v);
            } else if (op === '<=') {
              subQuery = subQuery ? subQuery.and(row(field).default(null).le(v)) : row(field).default(null).le(v);
            } else if (op === 'isectEmpty') {
              subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0);
            } else if (op === 'isectNotEmpty') {
              subQuery = subQuery ? subQuery.and(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0);
            } else if (op === 'in') {
              subQuery = subQuery ? subQuery.and(r.expr(v).default(r.expr([])).contains(row(field).default(null))) : r.expr(v).default(r.expr([])).contains(row(field).default(null));
            } else if (op === 'notIn') {
              subQuery = subQuery ? subQuery.and(r.expr(v).default(r.expr([])).contains(row(field).default(null)).not()) : r.expr(v).default(r.expr([])).contains(row(field).default(null)).not();
            } else if (op === 'contains') {
              subQuery = subQuery ? subQuery.and(row(field).default([]).contains(v)) : row(field).default([]).contains(v);
            } else if (op === 'notContains') {
              subQuery = subQuery ? subQuery.and(row(field).default([]).contains(v).not()) : row(field).default([]).contains(v).not();
            } else if (op === '|==' || op === '|===') {
              subQuery = subQuery ? subQuery.or(row(field).default(null).eq(v)) : row(field).default(null).eq(v);
            } else if (op === '|!=' || op === '|!==') {
              subQuery = subQuery ? subQuery.or(row(field).default(null).ne(v)) : row(field).default(null).ne(v);
            } else if (op === '|>') {
              subQuery = subQuery ? subQuery.or(row(field).default(null).gt(v)) : row(field).default(null).gt(v);
            } else if (op === '|>=') {
              subQuery = subQuery ? subQuery.or(row(field).default(null).ge(v)) : row(field).default(null).ge(v);
            } else if (op === '|<') {
              subQuery = subQuery ? subQuery.or(row(field).default(null).lt(v)) : row(field).default(null).lt(v);
            } else if (op === '|<=') {
              subQuery = subQuery ? subQuery.or(row(field).default(null).le(v)) : row(field).default(null).le(v);
            } else if (op === '|isectEmpty') {
              subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().eq(0);
            } else if (op === '|isectNotEmpty') {
              subQuery = subQuery ? subQuery.or(row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0)) : row(field).default([]).setIntersection(r.expr(v).default([])).count().ne(0);
            } else if (op === '|in') {
              subQuery = subQuery ? subQuery.or(r.expr(v).default(r.expr([])).contains(row(field).default(null))) : r.expr(v).default(r.expr([])).contains(row(field).default(null));
            } else if (op === '|notIn') {
              subQuery = subQuery ? subQuery.or(r.expr(v).default(r.expr([])).contains(row(field).default(null)).not()) : r.expr(v).default(r.expr([])).contains(row(field).default(null)).not();
            } else if (op === '|contains') {
              subQuery = subQuery ? subQuery.or(row(field).default([]).contains(v)) : row(field).default([]).contains(v);
            } else if (op === '|notContains') {
              subQuery = subQuery ? subQuery.or(row(field).default([]).contains(v).not()) : row(field).default([]).contains(v).not();
            }
          });
        });
        return subQuery || true;
      });
    }

    if (params.orderBy) {
      if (isString(params.orderBy)) {
        params.orderBy = [[params.orderBy, 'asc']];
      }
      for (var i = 0; i < params.orderBy.length; i++) {
        if (isString(params.orderBy[i])) {
          params.orderBy[i] = [params.orderBy[i], 'asc'];
        }
        query = (params.orderBy[i][1] || '').toUpperCase() === 'DESC' ? query.orderBy(r.desc(params.orderBy[i][0])) : query.orderBy(params.orderBy[i][0]);
      }
    }

    if (params.skip) {
      query = query.skip(+params.skip);
    }

    if (params.limit) {
      query = query.limit(+params.limit);
    }

    return query;
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
    var op = undefined;
    props || (props = {});
    opts || (opts = {});

    return self.waitForTable(mapper, opts).then(function () {
      // beforeCreate lifecycle hook
      op = opts.op = 'beforeCreate';
      return resolve(self[op](mapper, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      var insertOpts = self.getOpt('insertOpts', opts);
      insertOpts.returnChanges = true;
      return self.selectTable(mapper, opts).insert(_props, insertOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      self._handleErrors(cursor);
      var record = undefined;
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
        record = cursor.changes[0].new_val;
      }
      // afterCreate lifecycle hook
      op = opts.op = 'afterCreate';
      return self[op](mapper, props, opts, record).then(function (_record) {
        // Allow for re-assignment from lifecycle hook
        record = isUndefined(_record) ? record : _record;
        var result = {};
        fillIn(result, cursor);
        result.data = record;
        result.created = record ? 1 : 0;
        return self.getOpt('raw', opts) ? result : result.data;
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
    var op = undefined;
    props || (props = {});
    opts || (opts = {});

    return self.waitForTable(mapper, opts).then(function () {
      // beforeCreateMany lifecycle hook
      op = opts.op = 'beforeCreateMany';
      return resolve(self[op](mapper, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      var insertOpts = self.getOpt('insertOpts', opts);
      insertOpts.returnChanges = true;
      return self.selectTable(mapper, opts).insert(_props, insertOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      self._handleErrors(cursor);
      var records = [];
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes) {
        records = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      // afterCreateMany lifecycle hook
      op = opts.op = 'afterCreateMany';
      return self[op](mapper, props, opts, records).then(function (_records) {
        // Allow for re-assignment from lifecycle hook
        records = isUndefined(_records) ? records : _records;
        var result = {};
        fillIn(result, cursor);
        result.data = records;
        result.created = records.length;
        return self.getOpt('raw', opts) ? result : result.data;
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
    var op = undefined;
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
      // afterDestroy lifecycle hook
      op = opts.op = 'afterDestroy';
      return resolve(self[op](mapper, id, opts, cursor)).then(function (_cursor) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_cursor) ? cursor : _cursor;
      });
    }).then(function (cursor) {
      return self.getOpt('raw', opts) ? cursor : undefined;
    });
  },


  /**
   * Destroy the records that match the selection query.
   *
   * @name RethinkDBAdapter#destroyAll
   * @method
   * @param {Object} mapper the mapper.
   * @param {Object} [query] Selection query.
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.deleteOpts] Options to pass to r#delete.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  destroyAll: function destroyAll(mapper, query, opts) {
    var self = this;
    var op = undefined;
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
      // afterDestroyAll lifecycle hook
      op = opts.op = 'afterDestroyAll';
      return resolve(self[op](mapper, query, opts, cursor)).then(function (_cursor) {
        // Allow for re-assignment from lifecycle hook
        return isUndefined(_cursor) ? cursor : _cursor;
      });
    }).then(function (cursor) {
      return self.getOpt('raw', opts) ? cursor : undefined;
    });
  },


  /**
   * Return the foreignKey from the given record for the provided relationship.
   *
   * There may be reasons why you may want to override this method, like when
   * the id of the parent doesn't exactly match up to the key on the child.
   *
   * @name RethinkDBAdapter#makeHasManyForeignKey
   * @method
   * @return {*}
   */
  makeHasManyForeignKey: function makeHasManyForeignKey(mapper, def, record) {
    return def.getForeignKey(record);
  },


  /**
   * Load a hasMany relationship.
   *
   * @name RethinkDBAdapter#loadHasMany
   * @method
   * @return {Promise}
   */
  loadHasMany: function loadHasMany(mapper, def, records, __opts) {
    var self = this;
    var singular = false;

    if (isObject(records) && !isArray(records)) {
      singular = true;
      records = [records];
    }
    var IDs = records.map(function (record) {
      return self.makeHasManyForeignKey(mapper, def, record);
    });
    var query = {};
    var criteria = query[def.foreignKey] = {};
    if (singular) {
      // more efficient query when we only have one record
      criteria['=='] = IDs[0];
    } else {
      criteria['in'] = IDs.filter(function (id) {
        return id;
      });
    }
    return self.findAll(def.getRelation(), query, __opts).then(function (relatedItems) {
      records.forEach(function (record) {
        var attached = [];
        // avoid unneccesary iteration when we only have one record
        if (singular) {
          attached = relatedItems;
        } else {
          relatedItems.forEach(function (relatedItem) {
            if (get(relatedItem, def.foreignKey) === record[mapper.idAttribute]) {
              attached.push(relatedItem);
            }
          });
        }
        def.setLocalField(record, attached);
      });
    });
  },


  /**
   * Load a hasOne relationship.
   *
   * @name RethinkDBAdapter#loadHasOne
   * @method
   * @return {Promise}
   */
  loadHasOne: function loadHasOne(mapper, def, records, __opts) {
    if (isObject(records) && !isArray(records)) {
      records = [records];
    }
    return this.loadHasMany(mapper, def, records, __opts).then(function () {
      records.forEach(function (record) {
        var relatedData = def.getLocalField(record);
        if (isArray(relatedData) && relatedData.length) {
          def.setLocalField(record, relatedData[0]);
        }
      });
    });
  },


  /**
   * Return the foreignKey from the given record for the provided relationship.
   *
   * @name RethinkDBAdapter#makeBelongsToForeignKey
   * @method
   * @return {*}
   */
  makeBelongsToForeignKey: function makeBelongsToForeignKey(mapper, def, record) {
    return def.getForeignKey(record);
  },


  /**
   * Load a belongsTo relationship.
   *
   * @name RethinkDBAdapter#loadBelongsTo
   * @method
   * @return {Promise}
   */
  loadBelongsTo: function loadBelongsTo(mapper, def, records, __opts) {
    var self = this;
    var relationDef = def.getRelation();

    if (isObject(records) && !isArray(records)) {
      var _ret = function () {
        var record = records;
        return {
          v: self.find(relationDef, self.makeBelongsToForeignKey(mapper, def, record), __opts).then(function (relatedItem) {
            def.setLocalField(record, relatedItem);
          })
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
    } else {
      var keys = records.map(function (record) {
        return self.makeBelongsToForeignKey(mapper, def, record);
      }).filter(function (key) {
        return key;
      });
      return self.findAll(relationDef, {
        where: babelHelpers.defineProperty({}, relationDef.idAttribute, {
          'in': keys
        })
      }, __opts).then(function (relatedItems) {
        records.forEach(function (record) {
          relatedItems.forEach(function (relatedItem) {
            if (relatedItem[relationDef.idAttribute] === record[def.foreignKey]) {
              def.setLocalField(record, relatedItem);
            }
          });
        });
      });
    }
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
    var record = undefined,
        op = undefined;
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
        var task = undefined;

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
              'contains': get(record, mapper.idAttribute)
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
      // afterFind lifecycle hook
      op = opts.op = 'afterFind';
      return resolve(self[op](mapper, id, opts, record)).then(function (_record) {
        // Allow for re-assignment from lifecycle hook
        record = isUndefined(_record) ? record : _record;
        return self.getOpt('raw', opts) ? {
          data: record,
          found: record ? 1 : 0
        } : record;
      });
    });
  },


  /**
   * Retrieve the records that match the selection query.
   *
   * @name RethinkDBAdapter#findAll
   * @method
   * @param {Object} mapper The mapper.
   * @param {Object} query Selection query.
   * @param {Object} [opts] Configuration options.
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
    var op = undefined;
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
        var task = undefined;
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
                return get(record, idAttribute);
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
      // afterFindAll lifecycle hook
      op = opts.op = 'afterFindAll';
      return resolve(self[op](mapper, query, opts, records)).then(function (_records) {
        // Allow for re-assignment from lifecycle hook
        records = isUndefined(_records) ? records : _records;
        return self.getOpt('raw', opts) ? {
          data: records,
          found: records.length
        } : records;
      });
    });
  },


  /**
   * Resolve the value of the specified option based on the given options and
   * this adapter's settings.
   *
   * @name RethinkDBAdapter#getOpt
   * @method
   * @param {string} opt The name of the option.
   * @param {Object} [opts] Configuration options.
   * @return {*} The value of the specified option.
   */
  getOpt: function getOpt(opt, opts) {
    opts || (opts = {});
    return isUndefined(opts[opt]) ? this[opt] : opts[opt];
  },


  /**
   * Logging utility method.
   *
   * @name RethinkDBAdapter#log
   * @method
   */
  log: function log(level) {
    for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    if (level && !args.length) {
      args.push(level);
      level = 'debug';
    }
    if (level === 'debug' && !this.debug) {
      return;
    }
    var prefix = level.toUpperCase() + ': (RethinkDBAdapter)';
    if (console[level]) {
      var _console;

      (_console = console)[level].apply(_console, [prefix].concat(args));
    } else {
      var _console2;

      (_console2 = console).log.apply(_console2, [prefix].concat(args));
    }
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
    var op = undefined;

    return self.waitForTable(mapper, opts).then(function () {
      // beforeUpdate lifecycle hook
      op = opts.op = 'beforeUpdate';
      return resolve(self[op](mapper, id, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      var updateOpts = self.getOpt('updateOpts', opts);
      updateOpts.returnChanges = true;
      return self.selectTable(mapper, opts).get(id).update(_props, updateOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var record = undefined;
      self._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
        record = cursor.changes[0].new_val;
      } else {
        throw new Error('Not Found');
      }

      // afterUpdate lifecycle hook
      op = opts.op = 'afterUpdate';
      return resolve(self[op](mapper, id, props, opts, record)).then(function (_record) {
        // Allow for re-assignment from lifecycle hook
        record = isUndefined(_record) ? record : _record;
        var result = {};
        fillIn(result, cursor);
        result.data = record;
        result.updated = record ? 1 : 0;
        return self.getOpt('raw', opts) ? result : result.data;
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
   * @param {Object} [opts] Configuration options.
   * @param {Object} [opts.updateOpts] Options to pass to r#update.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {Object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  updateAll: function updateAll(mapper, props, query, opts) {
    var self = this;
    props || (props = {});
    query || (query = {});
    opts || (opts = {});
    var op = undefined;

    return self.waitForTable(mapper, opts).then(function () {
      // beforeUpdateAll lifecycle hook
      op = opts.op = 'beforeUpdateAll';
      return resolve(self[op](mapper, props, query, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      var updateOpts = self.getOpt('updateOpts', opts);
      updateOpts.returnChanges = true;
      return self.filterSequence(self.selectTable(mapper, opts), query).update(_props, updateOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var records = [];
      self._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length) {
        records = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }
      // afterUpdateAll lifecycle hook
      op = opts.op = 'afterUpdateAll';
      return self[op](mapper, props, query, opts, records).then(function (_records) {
        // Allow for re-assignment from lifecycle hook
        records = isUndefined(_records) ? records : _records;
        var result = {};
        fillIn(result, cursor);
        result.data = records;
        result.updated = records.length;
        return self.getOpt('raw', opts) ? result : result.data;
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
    var op = undefined;
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
      return self.selectTable(mapper, opts).insert(_records, insertOpts).run(self.getOpt('runOpts', opts));
    }).then(function (cursor) {
      var updatedRecords = undefined;
      self._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length) {
        updatedRecords = cursor.changes.map(function (change) {
          return change.new_val;
        });
      }

      // afterUpdateMany lifecycle hook
      op = opts.op = 'afterUpdateMany';
      return resolve(self[op](mapper, records, opts, updatedRecords)).then(function (_records) {
        // Allow for re-assignment from lifecycle hook
        records = isUndefined(_records) ? updatedRecords : _records;
        var result = {};
        fillIn(result, cursor);
        result.data = records;
        result.updated = records.length;
        return self.getOpt('raw', opts) ? result : result.data;
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

module.exports = RethinkDBAdapter;
//# sourceMappingURL=js-data-rethinkdb.js.map