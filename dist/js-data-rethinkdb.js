'use strict';

var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
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
var JSData = require('js-data');
var DSUtils = JSData.DSUtils;
var upperCase = DSUtils.upperCase;
var contains = DSUtils.contains;
var forOwn = DSUtils.forOwn;
var isEmpty = DSUtils.isEmpty;
var keys = DSUtils.keys;
var deepMixIn = DSUtils.deepMixIn;
var forEach = DSUtils.forEach;
var isObject = DSUtils.isObject;
var isString = DSUtils.isString;
var removeCircular = DSUtils.removeCircular;
var omit = DSUtils.omit;


var underscore = require('mout/string/underscore');

var reserved = ['orderBy', 'sort', 'limit', 'offset', 'skip', 'where'];

var addHiddenPropsToTarget = function addHiddenPropsToTarget(target, props) {
  DSUtils.forOwn(props, function (value, key) {
    props[key] = {
      writable: true,
      value: value
    };
  });
  Object.defineProperties(target, props);
};

var fillIn = function fillIn(dest, src) {
  DSUtils.forOwn(src, function (value, key) {
    if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
      dest[key] = value;
    }
  });
};

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

var Defaults = function Defaults() {
  babelHelpers.classCallCheck(this, Defaults);
};

addHiddenPropsToTarget(Defaults.prototype, {
  host: 'localhost',
  port: 28015,
  authKey: '',
  db: 'test',
  min: 10,
  max: 50,
  bufferSize: 10
});

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

  self.defaults = new Defaults();
  deepMixIn(self.defaults, opts);
  fillIn(self, opts);
  self.r = rethinkdbdash(self.defaults);
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
  selectTable: function selectTable(Resource, opts) {
    return this.r.db(opts.db || this.defaults.db).table(Resource.table || underscore(Resource.name));
  },
  filterSequence: function filterSequence(sequence, params) {
    var r = this.r;
    params = params || {};
    params.where = params.where || {};
    params.orderBy = params.orderBy || params.sort;
    params.skip = params.skip || params.offset;

    forEach(keys(params), function (k) {
      var v = params[k];
      if (!contains(reserved, k)) {
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

    if (!isEmpty(params.where)) {
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
            }
          });
        });
        return subQuery;
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
        query = upperCase(params.orderBy[i][1]) === 'DESC' ? query.orderBy(r.desc(params.orderBy[i][0])) : query.orderBy(params.orderBy[i][0]);
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
    opts = opts || {};
    var db = opts.db || self.defaults.db;
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
   * @param {Object} Resource The Resource.
   * @param {Object} props The record to be created.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  create: function create(Resource, props, opts) {
    var self = this;
    props = removeCircular(omit(props, Resource.relationFields || []));
    opts || (opts = {});

    return self.waitForTable(Resource.table || underscore(Resource.name), opts).then(function () {
      return self.selectTable(Resource, opts).insert(props, { returnChanges: true }).run();
    }).then(function (cursor) {
      self._handleErrors(cursor);
      return cursor.changes[0].new_val;
    });
  },


  /**
   * Destroy the record with the given primary key.
   *
   * @name RethinkDBAdapter#destroy
   * @method
   * @param {Object} Resource The Resource.
   * @param {(string|number)} id Primary key of the record to destroy.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  destroy: function destroy(Resource, id, opts) {
    var self = this;
    opts || (opts = {});

    return self.waitForTable(Resource.table || underscore(Resource.name), opts).then(function () {
      return self.selectTable(Resource, opts).get(id).delete().run();
    }).then(function () {
      return undefined;
    });
  },


  /**
   * Destroy the records that match the selection query.
   *
   * @name RethinkDBAdapter#destroyAll
   * @method
   * @param {Object} Resource the Resource.
   * @param {Object} [query] Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  destroyAll: function destroyAll(Resource, query, opts) {
    var self = this;
    query || (query = {});
    opts || (opts = {});

    return self.waitForTable(Resource.table || underscore(Resource.name), opts).then(function () {
      return self.filterSequence(self.selectTable(Resource, opts), query).delete().run();
    }).then(function () {
      return undefined;
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
    return DSUtils.get(record, Resource.idAttribute);
  },


  /**
   * TODO
   *
   * @name RethinkDBAdapter#loadHasMany
   * @method
   * @return {Promise}
   */
  loadHasMany: function loadHasMany(Resource, def, records, __options) {
    var self = this;
    var singular = false;

    if (DSUtils.isObject(records) && !DSUtils.isArray(records)) {
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
    return self.findAll(Resource.getResource(def.relation), query, __options).then(function (relatedItems) {
      records.forEach(function (record) {
        var attached = [];
        // avoid unneccesary iteration when we only have one record
        if (singular) {
          attached = relatedItems;
        } else {
          relatedItems.forEach(function (relatedItem) {
            if (DSUtils.get(relatedItem, def.foreignKey) === record[Resource.idAttribute]) {
              attached.push(relatedItem);
            }
          });
        }
        DSUtils.set(record, def.localField, attached);
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
  loadHasOne: function loadHasOne(Resource, def, records, __options) {
    if (DSUtils.isObject(records) && !DSUtils.isArray(records)) {
      records = [records];
    }
    return this.loadHasMany(Resource, def, records, __options).then(function () {
      records.forEach(function (record) {
        var relatedData = DSUtils.get(record, def.localField);
        if (DSUtils.isArray(relatedData) && relatedData.length) {
          DSUtils.set(record, def.localField, relatedData[0]);
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
    return DSUtils.get(record, def.localKey);
  },


  /**
   * TODO
   *
   * @name RethinkDBAdapter#loadBelongsTo
   * @method
   * @return {Promise}
   */
  loadBelongsTo: function loadBelongsTo(Resource, def, records, __options) {
    var self = this;
    var relationDef = Resource.getResource(def.relation);

    if (DSUtils.isObject(records) && !DSUtils.isArray(records)) {
      var _ret = function () {
        var record = records;
        return {
          v: self.find(relationDef, self.makeBelongsToForeignKey(Resource, def, record), __options).then(function (relatedItem) {
            DSUtils.set(record, def.localField, relatedItem);
          })
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
    } else {
      var _keys = records.map(function (record) {
        return self.makeBelongsToForeignKey(Resource, def, record);
      }).filter(function (key) {
        return key;
      });
      return self.findAll(relationDef, {
        where: babelHelpers.defineProperty({}, relationDef.idAttribute, {
          'in': _keys
        })
      }, __options).then(function (relatedItems) {
        records.forEach(function (record) {
          relatedItems.forEach(function (relatedItem) {
            if (relatedItem[relationDef.idAttribute] === record[def.localKey]) {
              DSUtils.set(record, def.localField, relatedItem);
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
   * @param {Object} Resource The Resource.
   * @param {(string|number)} id Primary key of the record to retrieve.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with=[]] TODO
   * @return {Promise}
   */
  find: function find(Resource, id, opts) {
    var self = this;
    opts || (opts = {});
    opts.with || (opts.with = []);

    var instance = undefined;
    var table = Resource.table || underscore(Resource.name);
    var relationList = Resource.relationList || [];
    var tasks = [self.waitForTable(table, opts)];

    relationList.forEach(function (def) {
      var relationName = def.relation;
      var relationDef = Resource.getResource(relationName);
      if (!relationDef) {
        throw new JSData.DSErrors.NER(relationName);
      } else if (!opts.with || !contains(opts.with, relationName)) {
        return;
      }
      if (def.foreignKey) {
        tasks.push(self.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts));
      } else if (def.localKey) {
        tasks.push(self.waitForIndex(Resource.table || underscore(Resource.name), def.localKey, opts));
      }
    });
    return DSUtils.Promise.all(tasks).then(function () {
      return self.selectTable(Resource, opts).get(id).run();
    }).then(function (_instance) {
      if (!_instance) {
        throw new Error('Not Found!');
      }
      instance = _instance;
      var tasks = [];

      relationList.forEach(function (def) {
        var relationName = def.relation;
        var relationDef = Resource.getResource(relationName);
        var containedName = null;
        if (opts.with.indexOf(relationName) !== -1) {
          containedName = relationName;
        } else if (opts.with.indexOf(def.localField) !== -1) {
          containedName = def.localField;
        }
        if (containedName) {
          (function () {
            var __options = DSUtils.deepMixIn({}, opts.orig ? opts.orig() : opts);
            __options.with = opts.with.slice();
            __options = DSUtils._(relationDef, __options);
            DSUtils.remove(__options.with, containedName);
            __options.with.forEach(function (relation, i) {
              if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                __options.with[i] = relation.substr(containedName.length + 1);
              } else {
                __options.with[i] = '';
              }
            });

            var task = undefined;

            if (def.foreignKey && (def.type === 'hasOne' || def.type === 'hasMany')) {
              if (def.type === 'hasOne') {
                task = self.loadHasOne(Resource, def, instance, __options);
              } else {
                task = self.loadHasMany(Resource, def, instance, __options);
              }
            } else if (def.type === 'hasMany' && def.localKeys) {
              var localKeys = [];
              var itemKeys = instance[def.localKeys] || [];
              itemKeys = DSUtils.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
              localKeys = localKeys.concat(itemKeys || []);
              task = self.findAll(Resource.getResource(relationName), {
                where: babelHelpers.defineProperty({}, relationDef.idAttribute, {
                  'in': unique(localKeys).filter(function (x) {
                    return x;
                  })
                })
              }, __options).then(function (relatedItems) {
                DSUtils.set(instance, def.localField, relatedItems);
                return relatedItems;
              });
            } else if (def.type === 'belongsTo' || def.type === 'hasOne' && def.localKey) {
              task = self.loadBelongsTo(Resource, def, instance, __options);
            }

            if (task) {
              tasks.push(task);
            }
          })();
        }
      });

      return DSUtils.Promise.all(tasks);
    }).then(function () {
      return instance;
    });
  },


  /**
   * Retrieve the records that match the selection query.
   *
   * @name RethinkDBAdapter#findAll
   * @method
   * @param {Object} Resource The Resource.
   * @param {Object} query Selection query.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with=[]] TODO
   * @return {Promise}
   */
  findAll: function findAll(Resource, query, opts) {
    var self = this;
    opts || (opts = {});
    opts.with || (opts.with = []);

    var items = null;
    var table = Resource.table || underscore(Resource.name);
    var relationList = Resource.relationList || [];
    var tasks = [self.waitForTable(table, opts)];

    relationList.forEach(function (def) {
      var relationName = def.relation;
      var relationDef = Resource.getResource(relationName);
      if (!relationDef) {
        throw new JSData.DSErrors.NER(relationName);
      } else if (!opts.with || !contains(opts.with, relationName)) {
        return;
      }
      if (def.foreignKey) {
        tasks.push(self.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts));
      } else if (def.localKey) {
        tasks.push(self.waitForIndex(Resource.table || underscore(Resource.name), def.localKey, opts));
      }
    });
    return DSUtils.Promise.all(tasks).then(function () {
      return self.filterSequence(self.selectTable(Resource, opts), query).run();
    }).then(function (_items) {
      items = _items;
      var tasks = [];
      var relationList = Resource.relationList || [];
      relationList.forEach(function (def) {
        var relationName = def.relation;
        var relationDef = Resource.getResource(relationName);
        var containedName = null;
        if (opts.with.indexOf(relationName) !== -1) {
          containedName = relationName;
        } else if (opts.with.indexOf(def.localField) !== -1) {
          containedName = def.localField;
        }
        if (containedName) {
          (function () {
            var __options = DSUtils.deepMixIn({}, opts.orig ? opts.orig() : opts);
            __options.with = opts.with.slice();
            __options = DSUtils._(relationDef, __options);
            DSUtils.remove(__options.with, containedName);
            __options.with.forEach(function (relation, i) {
              if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                __options.with[i] = relation.substr(containedName.length + 1);
              } else {
                __options.with[i] = '';
              }
            });

            var task = undefined;

            if (def.foreignKey && (def.type === 'hasOne' || def.type === 'hasMany')) {
              if (def.type === 'hasMany') {
                task = self.loadHasMany(Resource, def, items, __options);
              } else {
                task = self.loadHasOne(Resource, def, items, __options);
              }
            } else if (def.type === 'hasMany' && def.localKeys) {
              (function () {
                var localKeys = [];
                items.forEach(function (item) {
                  var itemKeys = item[def.localKeys] || [];
                  itemKeys = DSUtils.isArray(itemKeys) ? itemKeys : Object.keys(itemKeys);
                  localKeys = localKeys.concat(itemKeys || []);
                });
                task = self.findAll(Resource.getResource(relationName), {
                  where: babelHelpers.defineProperty({}, relationDef.idAttribute, {
                    'in': unique(localKeys).filter(function (x) {
                      return x;
                    })
                  })
                }, __options).then(function (relatedItems) {
                  items.forEach(function (item) {
                    var attached = [];
                    var itemKeys = item[def.localKeys] || [];
                    itemKeys = DSUtils.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
                    relatedItems.forEach(function (relatedItem) {
                      if (itemKeys && itemKeys.indexOf(relatedItem[relationDef.idAttribute]) !== -1) {
                        attached.push(relatedItem);
                      }
                    });
                    DSUtils.set(item, def.localField, attached);
                  });
                  return relatedItems;
                });
              })();
            } else if (def.type === 'belongsTo' || def.type === 'hasOne' && def.localKey) {
              task = self.loadBelongsTo(Resource, def, items, __options);
            }

            if (task) {
              tasks.push(task);
            }
          })();
        }
      });
      return DSUtils.Promise.all(tasks);
    }).then(function () {
      return items;
    });
  },


  /**
   * Apply the given update to the record with the specified primary key.
   *
   * @name RethinkDBAdapter#update
   * @method
   * @param {Object} Resource The Resource.
   * @param {(string|number)} id The primary key of the record to be updated.
   * @param {Object} props The update to apply to the record.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  update: function update(resourceConfig, id, attrs, options) {
    var _this = this;

    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    options = options || {};
    return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(function () {
      return _this.r.db(options.db || _this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).get(id).update(attrs, { returnChanges: true }).run();
    }).then(function (cursor) {
      _this._handleErrors(cursor);
      if (cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
        return cursor.changes[0].new_val;
      } else {
        return _this.selectTable(resourceConfig, options).get(id).run();
      }
    });
  },


  /**
   * Apply the given update to all records that match the selection query.
   *
   * @name RethinkDBAdapter#updateAll
   * @method
   * @param {Object} Resource The Resource.
   * @param {Object} props The update to apply to the selected records.
   * @param {Object} [query] Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  updateAll: function updateAll(resourceConfig, attrs, params, options) {
    var _this2 = this;

    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    options = options || {};
    params = params || {};
    return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(function () {
      return _this2.filterSequence(_this2.selectTable(resourceConfig, options), params).update(attrs, { returnChanges: true }).run();
    }).then(function (cursor) {
      _this2._handleErrors(cursor);
      if (cursor && cursor.changes && cursor.changes.length) {
        var _ret5 = function () {
          var items = [];
          cursor.changes.forEach(function (change) {
            return items.push(change.new_val);
          });
          return {
            v: items
          };
        }();

        if ((typeof _ret5 === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret5)) === "object") return _ret5.v;
      } else {
        return _this2.filterSequence(_this2.selectTable(resourceConfig, options), params).run();
      }
    });
  },
  waitForTable: function waitForTable(table, options) {
    var _this3 = this;

    options = options || {};
    var db = options.db || this.defaults.db;
    return this.waitForDb(options).then(function () {
      _this3.tables[db] = _this3.tables[db] || {};
      if (!_this3.tables[db][table]) {
        _this3.tables[db][table] = _this3.r.branch(_this3.r.db(db).tableList().contains(table), true, _this3.r.db(db).tableCreate(table)).run();
      }
      return _this3.tables[db][table];
    });
  },
  waitForIndex: function waitForIndex(table, index, options) {
    var _this4 = this;

    options = options || {};
    var db = options.db || this.defaults.db;
    return this.waitForDb(options).then(function () {
      return _this4.waitForTable(table, options);
    }).then(function () {
      _this4.indices[db] = _this4.indices[db] || {};
      _this4.indices[db][table] = _this4.indices[db][table] || {};
      if (!_this4.tables[db][table][index]) {
        _this4.tables[db][table][index] = _this4.r.branch(_this4.r.db(db).table(table).indexList().contains(index), true, _this4.r.db(db).table(table).indexCreate(index)).run().then(function () {
          return _this4.r.db(db).table(table).indexWait(index).run();
        });
      }
      return _this4.tables[db][table][index];
    });
  }
});

module.exports = RethinkDBAdapter;
//# sourceMappingURL=js-data-rethinkdb.js.map