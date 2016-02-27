'use strict';

var jsData = require('js-data');

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

var rethinkdbdash = require('rethinkdbdash');
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


var underscore = require('mout/string/underscore');

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
   * TODO
   *
   * @name RethinkDBAdapter#authKey
   * @type {string}
   */
  authKey: '',

  /**
   * TODO
   *
   * @name RethinkDBAdapter#bufferSize
   * @type {number}
   * @default 10
   */
  bufferSize: 10,

  /**
   * TODO
   *
   * @name RethinkDBAdapter#db
   * @type {string}
   * @default "test"
   */
  db: 'test',

  /**
   * TODO
   *
   * @name RethinkDBAdapter#debug
   * @type {boolean}
   * @default false
   */
  debug: false,

  /**
   * TODO
   *
   * @name RethinkDBAdapter#host
   * @type {string}
   * @default "localhost"
   */
  host: 'localhost',

  /**
   * TODO
   *
   * @name RethinkDBAdapter#min
   * @type {number}
   * @default 10
   */
  min: 10,

  /**
   * TODO
   *
   * @name RethinkDBAdapter#max
   * @type {number}
   * @default 50
   */
  max: 50,

  /**
   * TODO
   *
   * @name RethinkDBAdapter#port
   * @type {number}
   * @default 10
   */
  port: 28015,

  /**
   * TODO
   *
   * @name RethinkDBAdapter#raw
   * @type {boolean}
   * @default false
   */
  raw: false,

  /**
   * TODO
   *
   * @name RethinkDBAdapter#returnDeletedIds
   * @type {boolean}
   * @default false
   */
  returnDeletedIds: false
};

/**
 * RethinkDBAdapter class.
 *
 * @example
 * import {DS} from 'js-data'
 * import RethinkDBAdapter from 'js-data-rethinkdb'
 * const store = new DS()
 * const adapter = new RethinkDBAdapter()
 * store.registerAdapter('rethinkdb', adapter, { 'default': true })
 *
 * @class RethinkDBAdapter
 * @param {Object} [opts] Configuration opts.
 * @param {string} [opts.host='localhost'] TODO
 * @param {number} [opts.port=28015] TODO
 * @param {string} [opts.authKey=''] TODO
 * @param {string} [opts.db='test'] TODO
 * @param {number} [opts.min=10] TODO
 * @param {number} [opts.max=50] TODO
 * @param {number} [opts.bufferSize=10] TODO
 */
function RethinkDBAdapter(opts) {
  var self = this;
  opts || (opts = {});
  fillIn(opts, DEFAULTS);
  fillIn(self, opts);
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
  selectTable: function selectTable(Resource, opts) {
    return this.selectDb(opts).table(Resource.table || underscore(Resource.name));
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
   * @param {boolean} [opts.raw=false] TODO
   * @return {Promise}
   */
  create: function create(mapper, props, opts) {
    var self = this;
    var op = undefined;
    props || (props = {});
    opts || (opts = {});

    return self.waitForTable(mapper.table || underscore(mapper.name), opts).then(function () {
      // beforeCreate lifecycle hook
      op = opts.op = 'beforeCreate';
      return resolve(self[op](mapper, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      return self.selectTable(mapper, opts).insert(_props, { returnChanges: true }).run();
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
        return self.getRaw(opts) ? result : result.data;
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
   * @param {boolean} [opts.raw=false] TODO
   * @return {Promise}
   */
  createMany: function createMany(mapper, props, opts) {
    var self = this;
    var op = undefined;
    props || (props = {});
    opts || (opts = {});

    return self.waitForTable(mapper.table || underscore(mapper.name), opts).then(function () {
      // beforeCreateMany lifecycle hook
      op = opts.op = 'beforeCreateMany';
      return resolve(self[op](mapper, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      return self.selectTable(mapper, opts).insert(_props, { returnChanges: true }).run();
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
        return self.getRaw(opts) ? result : result.data;
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
   * @param {boolean} [opts.raw=false] TODO
   * @param {boolean} [opts.returnDeletedIds=false] Whether to return the
   * primary keys of any deleted records.
   * @return {Promise}
   */
  destroy: function destroy(mapper, id, opts) {
    var self = this;
    var op = undefined;
    opts || (opts = {});
    var returnDeletedIds = isUndefined(opts.returnDeletedIds) ? self.returnDeletedIds : !!opts.returnDeletedIds;

    return self.waitForTable(mapper.table || underscore(mapper.name), opts).then(function () {
      // beforeDestroy lifecycle hook
      op = opts.op = 'beforeDestroy';
      return resolve(self[op](mapper, id, opts));
    }).then(function () {
      op = opts.op = 'destroy';
      self.dbg(op, id, opts);
      return self.selectTable(mapper, opts).get(id).delete().run();
    }).then(function (cursor) {
      var deleted = 0;
      if (cursor && cursor.deleted && returnDeletedIds) {
        deleted = cursor.deleted;
      }
      // afterDestroy lifecycle hook
      op = opts.op = 'afterDestroy';
      return resolve(self[op](mapper, id, opts, deleted ? id : undefined)).then(function (_id) {
        // Allow for re-assignment from lifecycle hook
        id = isUndefined(_id) && deleted ? id : _id;
        var result = {};
        fillIn(result, cursor);
        result.data = id;
        return self.getRaw(opts) ? result : result.data;
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
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.raw=false] TODO
   * @param {boolean} [opts.returnDeletedIds=false] Whether to return the
   * primary keys of any deleted records.
   * @return {Promise}
   */
  destroyAll: function destroyAll(mapper, query, opts) {
    var self = this;
    var idAttribute = mapper.idAttribute;
    var op = undefined;
    query || (query = {});
    opts || (opts = {});
    var returnDeletedIds = isUndefined(opts.returnDeletedIds) ? self.returnDeletedIds : !!opts.returnDeletedIds;

    return self.waitForTable(mapper.table || underscore(mapper.name), opts).then(function () {
      // beforeDestroyAll lifecycle hook
      op = opts.op = 'beforeDestroyAll';
      return resolve(self[op](mapper, query, opts));
    }).then(function () {
      op = opts.op = 'destroyAll';
      self.dbg(op, query, opts);
      return self.filterSequence(self.selectTable(mapper, opts), query).delete({ returnChanges: returnDeletedIds }).merge(function (cursor) {
        return {
          changes: cursor('changes').default([]).map(function (record) {
            return record('old_val').default({})(idAttribute).default({});
          }).filter(function (id) {
            return id;
          })
        };
      }).run();
    }).then(function (cursor) {
      var deletedIds = undefined;
      if (cursor && cursor.changes && returnDeletedIds) {
        deletedIds = cursor.changes;
        delete cursor.changes;
      }
      // afterDestroyAll lifecycle hook
      op = opts.op = 'afterDestroyAll';
      return resolve(self[op](mapper, query, opts, deletedIds)).then(function (_deletedIds) {
        // Allow for re-assignment from lifecycle hook
        deletedIds = isUndefined(_deletedIds) ? deletedIds : _deletedIds;
        var result = {};
        fillIn(result, cursor);
        result.data = deletedIds;
        return self.getRaw(opts) ? result : result.data;
      });
    });
  },


  /**
   * TODO
   *
   * There may be reasons why you may want to override this method, like when
   * the id of the parent doesn't exactly match up to the key on the child.
   *
   * @name RethinkDBAdapter#makeHasManyForeignKey
   * @method
   * @return {*}
   */
  makeHasManyForeignKey: function makeHasManyForeignKey(Resource, def, record) {
    return def.getForeignKey(record);
  },


  /**
   * TODO
   *
   * @name RethinkDBAdapter#loadHasMany
   * @method
   * @return {Promise}
   */
  loadHasMany: function loadHasMany(Resource, def, records, __opts) {
    var self = this;
    var singular = false;

    if (isObject(records) && !isArray(records)) {
      singular = true;
      records = [records];
    }
    var IDs = records.map(function (record) {
      return self.makeHasManyForeignKey(Resource, def, record);
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
            if (get(relatedItem, def.foreignKey) === record[Resource.idAttribute]) {
              attached.push(relatedItem);
            }
          });
        }
        def.setLocalField(record, attached);
      });
    });
  },


  /**
   * TODO
   *
   * @name RethinkDBAdapter#loadHasOne
   * @method
   * @return {Promise}
   */
  loadHasOne: function loadHasOne(Resource, def, records, __opts) {
    if (isObject(records) && !isArray(records)) {
      records = [records];
    }
    return this.loadHasMany(Resource, def, records, __opts).then(function () {
      records.forEach(function (record) {
        var relatedData = def.getLocalField(record);
        if (isArray(relatedData) && relatedData.length) {
          def.setLocalField(record, relatedData[0]);
        }
      });
    });
  },


  /**
   * TODO
   *
   * @name RethinkDBAdapter#makeBelongsToForeignKey
   * @method
   * @return {*}
   */
  makeBelongsToForeignKey: function makeBelongsToForeignKey(Resource, def, record) {
    return def.getForeignKey(record);
  },


  /**
   * TODO
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
   * @param {boolean} [opts.raw=false] TODO
   * @param {string[]} [opts.with=[]] TODO
   * @return {Promise}
   */
  find: function find(mapper, id, opts) {
    var self = this;
    var record = undefined,
        op = undefined;
    opts || (opts = {});
    opts.with || (opts.with = []);

    var table = mapper.table || underscore(mapper.name);
    var relationList = mapper.relationList || [];
    var tasks = [self.waitForTable(table, opts)];

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
      return resolve(self[op](mapper, id, opts)).then(function () {
        op = opts.op = 'find';
        self.dbg(op, id, opts);
        return self.selectTable(mapper, opts).get(id).run();
      });
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
        return self.getRaw(opts) ? {
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
   * @param {boolean} [opts.raw=false] TODO
   * @param {string[]} [opts.with=[]] TODO
   * @return {Promise}
   */
  findAll: function findAll(mapper, query, opts) {
    var self = this;
    opts || (opts = {});
    opts.with || (opts.with = []);

    var records = [];
    var op = undefined;
    var table = mapper.table || underscore(mapper.name);
    var relationList = mapper.relationList || [];
    var tasks = [self.waitForTable(table, opts)];

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
      return self.filterSequence(self.selectTable(mapper, opts), query).run();
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
        return self.getRaw(opts) ? {
          data: records,
          found: records.length
        } : records;
      });
    });
  },


  /**
   * TODO
   *
   * @name RethinkDBAdapter#getRaw
   * @method
   */
  getRaw: function getRaw(opts) {
    opts || (opts = {});
    return !!(isUndefined(opts.raw) ? this.raw : opts.raw);
  },


  /**
   * TODO
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
   * @param {boolean} [opts.raw=false] TODO
   * @return {Promise}
   */
  update: function update(mapper, id, props, opts) {
    var self = this;
    props || (props = {});
    opts || (opts = {});
    var op = undefined;

    return self.waitForTable(mapper.table || underscore(mapper.name), opts).then(function () {
      // beforeUpdate lifecycle hook
      op = opts.op = 'beforeUpdate';
      return resolve(self[op](mapper, id, props, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      return self.selectTable(mapper, opts).get(id).update(_props, { returnChanges: true }).run();
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
        return self.getRaw(opts) ? result : result.data;
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
   * @param {boolean} [opts.raw=false] TODO
   * @return {Promise}
   */
  updateAll: function updateAll(mapper, props, query, opts) {
    var self = this;
    props || (props = {});
    query || (query = {});
    opts || (opts = {});
    var op = undefined;

    return self.waitForTable(mapper.table || underscore(mapper.name), opts).then(function () {
      // beforeUpdateAll lifecycle hook
      op = opts.op = 'beforeUpdateAll';
      return resolve(self[op](mapper, props, query, opts));
    }).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      _props = isUndefined(_props) ? props : _props;
      return self.filterSequence(self.selectTable(mapper, opts), query).update(_props, { returnChanges: true }).run();
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
        return self.getRaw(opts) ? result : result.data;
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
   * @param {boolean} [opts.raw=false] TODO
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

    return self.waitForTable(mapper.table || underscore(mapper.name), opts).then(function () {
      // beforeUpdateMany lifecycle hook
      op = opts.op = 'beforeUpdateMany';
      return resolve(self[op](mapper, records, opts));
    }).then(function (_records) {
      // Allow for re-assignment from lifecycle hook
      _records = isUndefined(_records) ? records : _records;
      return self.selectTable(mapper, opts).insert(_records, { returnChanges: true, conflict: 'update' }).run();
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
        return self.getRaw(opts) ? result : result.data;
      });
    });
  },
  waitForTable: function waitForTable(table, options) {
    var _this = this;

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