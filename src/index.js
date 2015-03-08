let rethinkdbdash = require('rethinkdbdash');
let contains = require('mout/array/contains');
let forOwn = require('mout/object/forOwn');
let keys = require('mout/object/keys');
let deepMixIn = require('mout/object/deepMixIn');
let forEach = require('mout/array/forEach');
let isObject = require('mout/lang/isObject');
let isArray = require('mout/lang/isArray');
let isEmpty = require('mout/lang/isEmpty');
let isString = require('mout/lang/isString');
let upperCase = require('mout/string/upperCase');
let underscore = require('mout/string/underscore');
let JSData = require('js-data');
let P = JSData.DSUtils.Promise;


class Defaults {

}

Defaults.prototype.host = 'localhost';
Defaults.prototype.port = 28015;
Defaults.prototype.authKey = '';
Defaults.prototype.db = 'test';
Defaults.prototype.min = 10;
Defaults.prototype.max = 50;
Defaults.prototype.bufferSize = 10;

let reserved = [
  'orderBy',
  'sort',
  'limit',
  'offset',
  'skip',
  'where'
];

function filterQuery(resourceConfig, params, options) {
  let r = this.r;
  params = params || {};
  options = options || {};
  params.where = params.where || {};
  params.orderBy = params.orderBy || params.sort;
  params.skip = params.skip || params.offset;

  forEach(keys(params), k => {
    let v = params[k];
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

  let query = r.db(options.db || this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name));

  if (!isEmpty(params.where)) {
    query = query.filter(row => {
      let subQuery;
      forOwn(params.where, (criteria, field) => {
        if (!isObject(criteria)) {
          params.where[field] = {
            '==': criteria
          };
        }
        forOwn(criteria, (v, op) => {
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
      params.orderBy = [
        [params.orderBy, 'asc']
      ];
    }
    for (var i = 0; i < params.orderBy.length; i++) {
      if (isString(params.orderBy[i])) {
        params.orderBy[i] = [params.orderBy[i], 'asc'];
      }
      query = upperCase(params.orderBy[i][1]) === 'DESC' ? query.orderBy(r.desc(params.orderBy[i][0])) : query.orderBy(params.orderBy[i][0]);
    }
  }

  if (params.skip) {
    query = query.skip(params.skip);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  return query;
}

class DSRethinkDBAdapter {
  constructor(options) {
    options = options || {};
    this.defaults = new Defaults();
    deepMixIn(this.defaults, options);
    this.r = rethinkdbdash(this.defaults);
    this.databases = {};
    this.tables = {};
    this.indices = {};
  }

  waitForDb(options) {
    let _this = this;
    options = options || {};
    let db = options.db || _this.defaults.db;
    if (!_this.databases[db]) {
      _this.databases[db] = _this.r.branch(_this.r.dbList().contains(db), true, _this.r.dbCreate(db)).run();
    }
    return _this.databases[db];
  }

  waitForTable(table, options) {
    let _this = this;
    options = options || {};
    let db = options.db || _this.defaults.db;
    return _this.waitForDb(options).then(() => {
      _this.tables[db] = _this.tables[db] || {};
      if (!_this.tables[db][table]) {
        _this.tables[db][table] = _this.r.branch(_this.r.db(db).tableList().contains(table), true, _this.r.db(db).tableCreate(table)).run();
      }
      return _this.tables[db][table];
    });
  }

  waitForIndex(table, index, options) {
    let _this = this;
    options = options || {};
    let db = options.db || _this.defaults.db;
    return _this.waitForDb(options).then(() => _this.waitForTable(table, options)).then(() => {
      _this.indices[db] = _this.indices[db] || {};
      _this.indices[db][table] = _this.indices[db][table] || {};
      if (!_this.tables[db][table][index]) {
        _this.tables[db][table][index] = _this.r.branch(_this.r.db(db).table(table).indexList().contains(index), true, _this.r.db(db).table(table).indexCreate(index)).run().then(() => {
          return _this.r.db(db).table(table).indexWait(index).run();
        });
      }
      return _this.tables[db][table][index];
    });
  }

  find(resourceConfig, id, options) {
    let _this = this;
    let newModels = {};
    let models = {};
    let merge = {};
    options = options || {};
    let table = resourceConfig.table || underscore(resourceConfig.name);
    let tasks = [_this.waitForTable(table, options)];
    forEach(resourceConfig.relationList, def => {
      let relationName = def.relation;
      let relationDef = resourceConfig.getResource(relationName);
      if (!relationDef) {
        throw new JSData.DSErrors.NER(relationName);
      }
      if (def.foreignKey) {
        tasks.push(_this.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, options));
      } else if (def.localKey) {
        tasks.push(_this.waitForIndex(resourceConfig.table || underscore(resourceConfig.name), def.localKey, options));
      }
    });
    return P.all(tasks).then(() => {
      return _this.r.do(_this.r.table(table).get(id), doc => {
        forEach(resourceConfig.relationList, def => {
          let relationName = def.relation;
          models[relationName] = resourceConfig.getResource(relationName);
          if (!options.with || !options.with.length || !contains(options.with, relationName)) {
            return;
          }
          if (!models[relationName]) {
            throw new JSData.DSErrors.NER(relationName);
          }
          let localKey = def.localKey;
          let localField = def.localField;
          let foreignKey = def.foreignKey;
          if (def.type === 'belongsTo') {
            merge[localField] = _this.r.table(models[relationName].table || underscore(models[relationName].name)).get(doc(localKey).default(''));
            newModels[localField] = {
              modelName: relationName,
              relation: 'belongsTo'
            };
          } else if (def.type === 'hasMany') {
            merge[localField] = _this.r.table(models[relationName].table || underscore(models[relationName].name)).getAll(id, { index: foreignKey }).coerceTo('ARRAY');

            newModels[localField] = {
              modelName: relationName,
              relation: 'hasMany'
            };
          } else if (def.type === 'hasOne') {
            merge[localField] = _this.r.table(models[relationName].table || underscore(models[relationName].name));

            if (localKey) {
              merge[localField] = merge[localField].get(localKey);
            } else {
              merge[localField] = merge[localField].getAll(id, { index: foreignKey }).coerceTo('ARRAY');
            }

            newModels[localField] = {
              modelName: relationName,
              relation: 'hasOne'
            };
          }
        });

        if (!isEmpty(merge)) {
          return doc.merge(merge);
        }
        return doc;
      }).run();
    }).then(item => {
      if (!item) {
        return P.reject(new Error('Not Found!'));
      } else {
        forOwn(item, (localValue, localKey) => {
          if (localKey in newModels) {
            if (isObject(localValue)) {
              item[localKey] = item[localKey];
            } else if (isArray(localValue)) {
              if (newModels[localKey].relation === 'hasOne' && localValue.length) {
                item[localKey] = localValue[0];
              } else {
                item[localKey] = localValue;
              }
            }
          }
        });
        return item;
      }
    });
  }

  findAll(resourceConfig, params, options) {
    let _this = this;
    options = options || {};
    return _this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return filterQuery.call(_this, resourceConfig, params, options).run();
    });
  }

  create(resourceConfig, attrs, options) {
    let _this = this;
    options = options || {};
    return _this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return _this.r.db(options.db || _this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).insert(attrs, { returnChanges: true }).run();
    }).then(cursor => cursor.changes[0].new_val);
  }

  update(resourceConfig, id, attrs, options) {
    let _this = this;
    options = options || {};
    return _this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return _this.r.db(options.db || _this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).get(id).update(attrs, { returnChanges: true }).run();
    }).then(cursor => {
      return cursor.changes[0].new_val;
    });
  }

  updateAll(resourceConfig, attrs, params, options) {
    let _this = this;
    options = options || {};
    params = params || {};
    return _this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return filterQuery.call(_this, resourceConfig, params, options).update(attrs, { returnChanges: true }).run();
    }).then(cursor => {
      let items = [];
      cursor.changes.forEach(change => items.push(change.new_val));
      return items;
    });
  }

  destroy(resourceConfig, id, options) {
    let _this = this;
    options = options || {};
    return _this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return _this.r.db(options.db || _this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).get(id).delete().run();
    }).then(() => undefined);
  }

  destroyAll(resourceConfig, params, options) {
    let _this = this;
    options = options || {};
    params = params || {};
    return _this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return filterQuery.call(_this, resourceConfig, params, options).delete().run();
    }).then(() => undefined);
  }
}

export default DSRethinkDBAdapter;
