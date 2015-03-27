import rethinkdbdash from 'rethinkdbdash';
import JSData from 'js-data';
let { DSUtils } = JSData;
let { Promise: P, contains, forOwn, deepMixIn, forEach, isObject, isArray, isString, removeCircular } = DSUtils;

import keys from 'mout/object/keys';
import isEmpty from 'mout/lang/isEmpty';
import upperCase from 'mout/string/upperCase';
import underscore from 'mout/string/underscore';
import omit from 'mout/object/omit';

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

  selectTable(resourceConfig, options) {
    return this.r.db(options.db || this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name));
  }

  filterSequence(sequence, params) {
    let r = this.r;
    params = params || {};
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

    let query = sequence;

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

  waitForDb(options) {
    options = options || {};
    let db = options.db || this.defaults.db;
    if (!this.databases[db]) {
      this.databases[db] = this.r.branch(this.r.dbList().contains(db), true, this.r.dbCreate(db)).run();
    }
    return this.databases[db];
  }

  waitForTable(table, options) {
    options = options || {};
    let db = options.db || this.defaults.db;
    return this.waitForDb(options).then(() => {
      this.tables[db] = this.tables[db] || {};
      if (!this.tables[db][table]) {
        this.tables[db][table] = this.r.branch(this.r.db(db).tableList().contains(table), true, this.r.db(db).tableCreate(table)).run();
      }
      return this.tables[db][table];
    });
  }

  waitForIndex(table, index, options) {
    options = options || {};
    let db = options.db || this.defaults.db;
    return this.waitForDb(options).then(() => this.waitForTable(table, options)).then(() => {
      this.indices[db] = this.indices[db] || {};
      this.indices[db][table] = this.indices[db][table] || {};
      if (!this.tables[db][table][index]) {
        this.tables[db][table][index] = this.r.branch(this.r.db(db).table(table).indexList().contains(index), true, this.r.db(db).table(table).indexCreate(index)).run().then(() => {
          return this.r.db(db).table(table).indexWait(index).run();
        });
      }
      return this.tables[db][table][index];
    });
  }

  find(resourceConfig, id, options) {
    let newModels = {};
    let models = {};
    let merge = {};
    options = options || {};
    let table = resourceConfig.table || underscore(resourceConfig.name);
    let tasks = [this.waitForTable(table, options)];
    forEach(resourceConfig.relationList, def => {
      let relationName = def.relation;
      let relationDef = resourceConfig.getResource(relationName);
      if (!relationDef) {
        throw new JSData.DSErrors.NER(relationName);
      } else if (!options.with || !contains(options.with, relationName)) {
        return;
      }
      if (def.foreignKey) {
        tasks.push(this.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, options));
      } else if (def.localKey) {
        tasks.push(this.waitForIndex(resourceConfig.table || underscore(resourceConfig.name), def.localKey, options));
      }
    });
    return P.all(tasks).then(() => {
      return this.r.do(this.r.table(table).get(id), doc => {
        forEach(resourceConfig.relationList, def => {
          let relationName = def.relation;
          models[relationName] = resourceConfig.getResource(relationName);
          if (!options.with || !contains(options.with, relationName)) {
            return;
          }
          if (!models[relationName]) {
            throw new JSData.DSErrors.NER(relationName);
          }
          let localKey = def.localKey;
          let localField = def.localField;
          let foreignKey = def.foreignKey;
          if (def.type === 'belongsTo') {
            merge[localField] = this.r.table(models[relationName].table || underscore(models[relationName].name)).get(doc(localKey).default(''));
            newModels[localField] = {
              modelName: relationName,
              relation: 'belongsTo'
            };
          } else if (def.type === 'hasMany') {
            merge[localField] = this.r.table(models[relationName].table || underscore(models[relationName].name)).getAll(id, { index: foreignKey }).coerceTo('ARRAY');

            newModels[localField] = {
              modelName: relationName,
              relation: 'hasMany'
            };
          } else if (def.type === 'hasOne') {
            merge[localField] = this.r.table(models[relationName].table || underscore(models[relationName].name));

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
    options = options || {};
    let table = resourceConfig.table || underscore(resourceConfig.name);
    let tasks = [this.waitForTable(table, options)];
    let models = {};
    let merge = {};
    let newModels = {};
    forEach(resourceConfig.relationList, def => {
      let relationName = def.relation;
      let relationDef = resourceConfig.getResource(relationName);
      if (!relationDef) {
        throw new JSData.DSErrors.NER(relationName);
      } else if (!options.with || !contains(options.with, relationName)) {
        return;
      }
      if (def.foreignKey) {
        tasks.push(this.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, options));
      } else if (def.localKey) {
        tasks.push(this.waitForIndex(resourceConfig.table || underscore(resourceConfig.name), def.localKey, options));
      }
    });
    return P.all(tasks).then(() => {
      let query = this.filterSequence(this.selectTable(resourceConfig, options), params);
      if (options.with && options.with.length) {
        query = query.map(doc => {
          let id = doc(resourceConfig.idAttribute);
          forEach(resourceConfig.relationList, def => {
            let relationName = def.relation;
            models[relationName] = resourceConfig.getResource(relationName);
            if (!options.with || !contains(options.with, relationName)) {
              return;
            }
            if (!models[relationName]) {
              throw new JSData.DSErrors.NER(relationName);
            }
            let localKey = def.localKey;
            let localField = def.localField;
            let foreignKey = def.foreignKey;
            if (def.type === 'belongsTo') {
              merge[localField] = this.r.table(models[relationName].table || underscore(models[relationName].name)).get(doc(localKey).default(''));
              newModels[localField] = {
                modelName: relationName,
                relation: 'belongsTo'
              };
            } else if (def.type === 'hasMany') {
              merge[localField] = this.r.table(models[relationName].table || underscore(models[relationName].name)).getAll(id, { index: foreignKey }).coerceTo('ARRAY');

              newModels[localField] = {
                modelName: relationName,
                relation: 'hasMany'
              };
            } else if (def.type === 'hasOne') {
              merge[localField] = this.r.table(models[relationName].table || underscore(models[relationName].name));

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
        });
      }
      return query.run();
    });
  }

  create(resourceConfig, attrs, options) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    options = options || {};
    return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return this.r.db(options.db || this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).insert(attrs, { returnChanges: true }).run();
    }).then(cursor => cursor.changes[0].new_val);
  }

  update(resourceConfig, id, attrs, options) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    options = options || {};
    return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return this.r.db(options.db || this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).get(id).update(attrs, { returnChanges: true }).run();
    }).then(cursor => {
      return cursor.changes[0].new_val;
    });
  }

  updateAll(resourceConfig, attrs, params, options) {
    attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
    options = options || {};
    params = params || {};
    return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return this.filterSequence(this.selectTable(resourceConfig, options), params).update(attrs, { returnChanges: true }).run();
    }).then(cursor => {
      let items = [];
      cursor.changes.forEach(change => items.push(change.new_val));
      return items;
    });
  }

  destroy(resourceConfig, id, options) {
    options = options || {};
    return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return this.r.db(options.db || this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).get(id).delete().run();
    }).then(() => undefined);
  }

  destroyAll(resourceConfig, params, options) {
    options = options || {};
    params = params || {};
    return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(() => {
      return this.filterSequence(this.selectTable(resourceConfig, options), params).delete().run();
    }).then(() => undefined);
  }
}

export default DSRethinkDBAdapter;
