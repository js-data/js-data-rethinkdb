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
var deepMixIn = DSUtils.deepMixIn;
var forEach = DSUtils.forEach;

function Defaults() {

}

function DSRethinkDBAdapter(options) {
  var _this = this;
  options = options || {};
  _this.defaults = new Defaults();
  deepMixIn(_this.defaults, options);
  _this.r = rethinkdbdash(options);
}

var dsRethinkDBAdapterPrototype = DSRethinkDBAdapter.prototype;

dsRethinkDBAdapterPrototype.find = function find(resourceConfig, id) {
  return this.r.table(resourceConfig.endpoint).get(id).run().then(function (item) {
    if (!item) {
      throw new Error('Not Found!');
    } else {
      return item;
    }
  });
};

dsRethinkDBAdapterPrototype.findAll = function (resourceConfig, params) {
  params = params || {};
  return this.r.table(resourceConfig.endpoint).filter(params).run();
};

dsRethinkDBAdapterPrototype.create = function (resourceConfig, attrs) {
  return this.r.table(resourceConfig.endpoint).insert(attrs, { returnChanges: true }).run().then(function (cursor) {
    return cursor.changes[0].new_val;
  });
};

dsRethinkDBAdapterPrototype.update = function (resourceConfig, id, attrs) {
  return this.r.table(resourceConfig.endpoint).get(id).update(attrs, { returnChanges: true }).run().then(function (cursor) {
    return cursor.changes[0].new_val;
  });
};

dsRethinkDBAdapterPrototype.updateAll = function (resourceConfig, attrs, params) {
  var _this = this;
  params = params || {};
  return _this.r.table(resourceConfig.endpoint).filter(params).update(attrs, { returnChanges: true }).run().then(function (cursor) {
    var items = [];
    DSUtils.forEach(cursor.changes, function (change) {
      items.push(change.new_val);
    });
    return items;
  });
};

dsRethinkDBAdapterPrototype.destroy = function (resourceConfig, id) {
  return this.r.table(resourceConfig.endpoint).get(id).delete().run().then(function () {
    return undefined;
  });
};

dsRethinkDBAdapterPrototype.destroyAll = function (resourceConfig, params) {
  params = params || {};
  return this.r.table(resourceConfig.endpoint).filter(params).delete().run().then(function () {
    return undefined;
  });
};

module.exports = DSRethinkDBAdapter;
