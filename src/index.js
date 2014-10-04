var JSData, rethinkdbdash;

try {
  JSData = require('js-data');
} catch (e) {
}

try {
  rethinkdbdash = require('rethinkdbdash');
} catch (e) {
}

if (!JSData) {
  try {
    JSData = window.JSData;
  } catch (e) {
  }
}

if (!rethinkdbdash) {
  try {
    rethinkdbdash = window.rethinkdbdash;
  } catch (e) {
  }
}

if (!JSData) {
  throw new Error('js-data must be loaded!');
} else if (!rethinkdbdash) {
  throw new Error('rethinkdbdash must be loaded!');
}

var DSUtils = JSData.DSUtils;

function Defaults() {

}

Defaults.prototype.host = 'localhost';
Defaults.prototype.port = 28015;
Defaults.prototype.authKey = '';
Defaults.prototype.db = 'test';
Defaults.prototype.min = 10;
Defaults.prototype.max = 50;
Defaults.prototype.bufferSize = 10;

var reserved = [
  'orderBy',
  'sort',
  'limit',
  'offset',
  'skip',
  'where'
];

function filterQuery(resourceConfig, params) {
  var r = this.r;
  params = params || {};
  params.where = params.where || {};
  params.orderBy = params.orderBy || params.sort;
  params.skip = params.skip || params.offset;

  var keys = Object.keys(params);
  keys.forEach(function (k) {
    var v = params[k];
    if (!DSUtils.contains(reserved, k)) {
      if (DSUtils.isObject(v)) {
        params.where[k] = v;
      } else {
        params.where[k] = {
          '==': v
        };
      }
      delete params[k];
    }
  });

  var query = r.db(this.defaults.db).table(resourceConfig.endpoint);
  var subQuery;

  DSUtils.forOwn(params.where, function (criteria, field) {
    if (!DSUtils.isObject(criteria)) {
      params.where[field] = {
        '==': criteria
      };
    }
    DSUtils.forOwn(criteria, function (v, op) {
      if (op === '==' || op === '===') {
        subQuery = subQuery ? subQuery.and(r.row(field).eq(v)) : r.row(field).eq(v);
      } else if (op === '!=' || op === '!==') {
        subQuery = subQuery ? subQuery.and(r.row(field).ne(v)) : r.row(field).ne(v);
      } else if (op === '>') {
        subQuery = subQuery ? subQuery.and(r.row(field).gt(v)) : r.row(field).gt(v);
      } else if (op === '>=') {
        subQuery = subQuery ? subQuery.and(r.row(field).ge(v)) : r.row(field).ge(v);
      } else if (op === '<') {
        subQuery = subQuery ? subQuery.and(r.row(field).lt(v)) : r.row(field).lt(v);
      } else if (op === '<=') {
        subQuery = subQuery ? subQuery.and(r.row(field).le(v)) : r.row(field).le(v);
      } else if (op === 'in') {
        subQuery = subQuery ? subQuery.and(r.row(field).contains(v)) : r.row(field).contains(v);
      } else if (op === 'notIn') {
        subQuery = subQuery ? subQuery.and(r.row(field).contains(v).not()) : r.row(field).contains(v).not();
      } else if (op === '|==' || op === '|===') {
        subQuery = subQuery ? subQuery.or(r.row(field).eq(v)) : r.row(field).eq(v);
      } else if (op === '|!=' || op === '|!==') {
        subQuery = subQuery ? subQuery.or(r.row(field).ne(v)) : r.row(field).ne(v);
      } else if (op === '|>') {
        subQuery = subQuery ? subQuery.or(r.row(field).gt(v)) : r.row(field).gt(v);
      } else if (op === '|>=') {
        subQuery = subQuery ? subQuery.or(r.row(field).ge(v)) : r.row(field).ge(v);
      } else if (op === '|<') {
        subQuery = subQuery ? subQuery.or(r.row(field).lt(v)) : r.row(field).lt(v);
      } else if (op === '|<=') {
        subQuery = subQuery ? subQuery.or(r.row(field).le(v)) : r.row(field).le(v);
      } else if (op === '|in') {
        subQuery = subQuery ? subQuery.or(r.row(field).contains(v)) : r.row(field).contains(v);
      } else if (op === '|notIn') {
        subQuery = subQuery ? subQuery.or(r.row(field).contains(v).not()) : r.row(field).contains(v).not();
      }
    });
  });

  if (subQuery) {
    query = query.filter(subQuery);
  }

  if (params.orderBy) {
    if (utils.isString(params.orderBy)) {
      params.orderBy = [
        [params.orderBy, 'asc']
      ];
    }
    for (var i = 0; i < params.orderBy.length; i++) {
      if (utils.isString(params.orderBy[i])) {
        params.orderBy[i] = [params.orderBy[i], 'asc'];
      }
      query = utils.upperCase(params.orderBy[i][1]) === 'DESC' ? query.orderBy(r.desc(params.orderBy[i][0])) : query.orderBy(params.orderBy[i][0]);
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

function DSRethinkDBAdapter(options) {
  options = options || {};
  this.defaults = new Defaults();
  DSUtils.deepMixIn(this.defaults, options);
  this.r = rethinkdbdash(this.defaults);
}

var dsRethinkDBAdapterPrototype = DSRethinkDBAdapter.prototype;

dsRethinkDBAdapterPrototype.find = function find(resourceConfig, id) {
  return this.r.db(this.defaults.db).table(resourceConfig.endpoint).get(id).run().then(function (item) {
    if (!item) {
      throw new Error('Not Found!');
    } else {
      return item;
    }
  });
};

dsRethinkDBAdapterPrototype.findAll = function (resourceConfig, params) {
  return filterQuery.call(this, resourceConfig, params).run();
};

dsRethinkDBAdapterPrototype.create = function (resourceConfig, attrs) {
  return this.r.db(this.defaults.db).table(resourceConfig.endpoint).insert(attrs, { returnChanges: true }).run().then(function (cursor) {
    return cursor.changes[0].new_val;
  });
};

dsRethinkDBAdapterPrototype.update = function (resourceConfig, id, attrs) {
  return this.r.db(this.defaults.db).table(resourceConfig.endpoint).get(id).update(attrs, { returnChanges: true }).run().then(function (cursor) {
    return cursor.changes[0].new_val;
  });
};

dsRethinkDBAdapterPrototype.updateAll = function (resourceConfig, attrs, params) {
  params = params || {};
  return filterQuery.call(this, resourceConfig, params).update(attrs, { returnChanges: true }).run().then(function (cursor) {
    var items = [];
    cursor.changes.forEach(function (change) {
      items.push(change.new_val);
    });
    return items;
  });
};

dsRethinkDBAdapterPrototype.destroy = function (resourceConfig, id) {
  return this.r.db(this.defaults.db).table(resourceConfig.endpoint).get(id).delete().run().then(function () {
    return undefined;
  });
};

dsRethinkDBAdapterPrototype.destroyAll = function (resourceConfig, params) {
  params = params || {};
  return filterQuery.call(this, resourceConfig, params).delete().run().then(function () {
    return undefined;
  });
};

module.exports = DSRethinkDBAdapter;
