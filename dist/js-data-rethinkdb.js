module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var rethinkdbdash = __webpack_require__(1);
	var JSData = __webpack_require__(2);
	var DSUtils = JSData.DSUtils;
	var upperCase = DSUtils.upperCase;
	var contains = DSUtils.contains;
	var forOwn = DSUtils.forOwn;
	var isEmpty = DSUtils.isEmpty;
	var keys = DSUtils.keys;
	var deepMixIn = DSUtils.deepMixIn;
	var forEach = DSUtils.forEach;
	var isObject = DSUtils.isObject;
	var isArray = DSUtils.isArray;
	var isString = DSUtils.isString;
	var removeCircular = DSUtils.removeCircular;
	var omit = DSUtils.omit;

	var underscore = __webpack_require__(3);

	var Defaults = function Defaults() {
	  _classCallCheck(this, Defaults);
	};

	Defaults.prototype.host = 'localhost';
	Defaults.prototype.port = 28015;
	Defaults.prototype.authKey = '';
	Defaults.prototype.db = 'test';
	Defaults.prototype.min = 10;
	Defaults.prototype.max = 50;
	Defaults.prototype.bufferSize = 10;

	var reserved = ['orderBy', 'sort', 'limit', 'offset', 'skip', 'where'];

	var DSRethinkDBAdapter = (function () {
	  function DSRethinkDBAdapter(options) {
	    _classCallCheck(this, DSRethinkDBAdapter);

	    options = options || {};
	    this.defaults = new Defaults();
	    deepMixIn(this.defaults, options);
	    this.r = rethinkdbdash(this.defaults);
	    this.databases = {};
	    this.tables = {};
	    this.indices = {};
	  }

	  _createClass(DSRethinkDBAdapter, [{
	    key: 'selectTable',
	    value: function selectTable(resourceConfig, options) {
	      return this.r.db(options.db || this.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name));
	    }
	  }, {
	    key: 'filterSequence',
	    value: function filterSequence(sequence, params) {
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
	                subQuery = subQuery ? subQuery.and(row(field)['default'](null).eq(v)) : row(field)['default'](null).eq(v);
	              } else if (op === '!=' || op === '!==') {
	                subQuery = subQuery ? subQuery.and(row(field)['default'](null).ne(v)) : row(field)['default'](null).ne(v);
	              } else if (op === '>') {
	                subQuery = subQuery ? subQuery.and(row(field)['default'](null).gt(v)) : row(field)['default'](null).gt(v);
	              } else if (op === '>=') {
	                subQuery = subQuery ? subQuery.and(row(field)['default'](null).ge(v)) : row(field)['default'](null).ge(v);
	              } else if (op === '<') {
	                subQuery = subQuery ? subQuery.and(row(field)['default'](null).lt(v)) : row(field)['default'](null).lt(v);
	              } else if (op === '<=') {
	                subQuery = subQuery ? subQuery.and(row(field)['default'](null).le(v)) : row(field)['default'](null).le(v);
	              } else if (op === 'isectEmpty') {
	                subQuery = subQuery ? subQuery.and(row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().eq(0)) : row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().eq(0);
	              } else if (op === 'isectNotEmpty') {
	                subQuery = subQuery ? subQuery.and(row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().ne(0)) : row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().ne(0);
	              } else if (op === 'in') {
	                subQuery = subQuery ? subQuery.and(r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null))) : r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null));
	              } else if (op === 'notIn') {
	                subQuery = subQuery ? subQuery.and(r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null)).not()) : r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null)).not();
	              } else if (op === '|==' || op === '|===') {
	                subQuery = subQuery ? subQuery.or(row(field)['default'](null).eq(v)) : row(field)['default'](null).eq(v);
	              } else if (op === '|!=' || op === '|!==') {
	                subQuery = subQuery ? subQuery.or(row(field)['default'](null).ne(v)) : row(field)['default'](null).ne(v);
	              } else if (op === '|>') {
	                subQuery = subQuery ? subQuery.or(row(field)['default'](null).gt(v)) : row(field)['default'](null).gt(v);
	              } else if (op === '|>=') {
	                subQuery = subQuery ? subQuery.or(row(field)['default'](null).ge(v)) : row(field)['default'](null).ge(v);
	              } else if (op === '|<') {
	                subQuery = subQuery ? subQuery.or(row(field)['default'](null).lt(v)) : row(field)['default'](null).lt(v);
	              } else if (op === '|<=') {
	                subQuery = subQuery ? subQuery.or(row(field)['default'](null).le(v)) : row(field)['default'](null).le(v);
	              } else if (op === '|isectEmpty') {
	                subQuery = subQuery ? subQuery.or(row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().eq(0)) : row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().eq(0);
	              } else if (op === '|isectNotEmpty') {
	                subQuery = subQuery ? subQuery.or(row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().ne(0)) : row(field)['default']([]).setIntersection(r.expr(v)['default']([])).count().ne(0);
	              } else if (op === '|in') {
	                subQuery = subQuery ? subQuery.or(r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null))) : r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null));
	              } else if (op === '|notIn') {
	                subQuery = subQuery ? subQuery.or(r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null)).not()) : r.expr(v)['default'](r.expr([])).contains(row(field)['default'](null)).not();
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
	        query = query.skip(params.skip);
	      }

	      if (params.limit) {
	        query = query.limit(params.limit);
	      }

	      return query;
	    }
	  }, {
	    key: 'waitForDb',
	    value: function waitForDb(options) {
	      options = options || {};
	      var db = options.db || this.defaults.db;
	      if (!this.databases[db]) {
	        this.databases[db] = this.r.branch(this.r.dbList().contains(db), true, this.r.dbCreate(db)).run();
	      }
	      return this.databases[db];
	    }
	  }, {
	    key: 'waitForTable',
	    value: function waitForTable(table, options) {
	      var _this = this;

	      options = options || {};
	      var db = options.db || this.defaults.db;
	      return this.waitForDb(options).then(function () {
	        _this.tables[db] = _this.tables[db] || {};
	        if (!_this.tables[db][table]) {
	          _this.tables[db][table] = _this.r.branch(_this.r.db(db).tableList().contains(table), true, _this.r.db(db).tableCreate(table)).run();
	        }
	        return _this.tables[db][table];
	      });
	    }
	  }, {
	    key: 'waitForIndex',
	    value: function waitForIndex(table, index, options) {
	      var _this2 = this;

	      options = options || {};
	      var db = options.db || this.defaults.db;
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
	  }, {
	    key: 'find',
	    value: function find(resourceConfig, id, options) {
	      var _this3 = this;

	      var newModels = {};
	      var models = {};
	      var merge = {};
	      options = options || {};
	      var table = resourceConfig.table || underscore(resourceConfig.name);
	      var tasks = [this.waitForTable(table, options)];
	      forEach(resourceConfig.relationList, function (def) {
	        var relationName = def.relation;
	        var relationDef = resourceConfig.getResource(relationName);
	        if (!relationDef) {
	          throw new JSData.DSErrors.NER(relationName);
	        } else if (!options['with'] || !contains(options['with'], relationName)) {
	          return;
	        }
	        if (def.foreignKey) {
	          tasks.push(_this3.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, options));
	        } else if (def.localKey) {
	          tasks.push(_this3.waitForIndex(resourceConfig.table || underscore(resourceConfig.name), def.localKey, options));
	        }
	      });
	      return DSUtils.Promise.all(tasks).then(function () {
	        return _this3.r['do'](_this3.r.table(table).get(id), function (doc) {
	          forEach(resourceConfig.relationList, function (def) {
	            var relationName = def.relation;
	            models[relationName] = resourceConfig.getResource(relationName);
	            if (!options['with'] || !contains(options['with'], relationName)) {
	              return;
	            }
	            if (!models[relationName]) {
	              throw new JSData.DSErrors.NER(relationName);
	            }
	            var localKey = def.localKey;
	            var localField = def.localField;
	            var foreignKey = def.foreignKey;
	            if (def.type === 'belongsTo') {
	              merge[localField] = _this3.r.table(models[relationName].table || underscore(models[relationName].name)).get(doc(localKey)['default'](''));
	              newModels[localField] = {
	                modelName: relationName,
	                relation: 'belongsTo'
	              };
	            } else if (def.type === 'hasMany') {
	              merge[localField] = _this3.r.table(models[relationName].table || underscore(models[relationName].name)).getAll(id, { index: foreignKey }).coerceTo('ARRAY');

	              newModels[localField] = {
	                modelName: relationName,
	                relation: 'hasMany'
	              };
	            } else if (def.type === 'hasOne') {
	              merge[localField] = _this3.r.table(models[relationName].table || underscore(models[relationName].name));

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
	      }).then(function (item) {
	        if (!item) {
	          return DSUtils.Promise.reject(new Error('Not Found!'));
	        } else {
	          forOwn(item, function (localValue, localKey) {
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
	  }, {
	    key: 'findAll',
	    value: function findAll(resourceConfig, params, options) {
	      var _this4 = this;

	      options = options || {};
	      var table = resourceConfig.table || underscore(resourceConfig.name);
	      var tasks = [this.waitForTable(table, options)];
	      var models = {};
	      var merge = {};
	      var newModels = {};
	      forEach(resourceConfig.relationList, function (def) {
	        var relationName = def.relation;
	        var relationDef = resourceConfig.getResource(relationName);
	        if (!relationDef) {
	          throw new JSData.DSErrors.NER(relationName);
	        } else if (!options['with'] || !contains(options['with'], relationName)) {
	          return;
	        }
	        if (def.foreignKey) {
	          tasks.push(_this4.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, options));
	        } else if (def.localKey) {
	          tasks.push(_this4.waitForIndex(resourceConfig.table || underscore(resourceConfig.name), def.localKey, options));
	        }
	      });
	      return DSUtils.Promise.all(tasks).then(function () {
	        var query = _this4.filterSequence(_this4.selectTable(resourceConfig, options), params);
	        if (options['with'] && options['with'].length) {
	          query = query.map(function (doc) {
	            var id = doc(resourceConfig.idAttribute);
	            forEach(resourceConfig.relationList, function (def) {
	              var relationName = def.relation;
	              models[relationName] = resourceConfig.getResource(relationName);
	              if (!options['with'] || !contains(options['with'], relationName)) {
	                return;
	              }
	              if (!models[relationName]) {
	                throw new JSData.DSErrors.NER(relationName);
	              }
	              var localKey = def.localKey;
	              var localField = def.localField;
	              var foreignKey = def.foreignKey;
	              if (def.type === 'belongsTo') {
	                merge[localField] = _this4.r.table(models[relationName].table || underscore(models[relationName].name)).get(doc(localKey)['default'](''));
	                newModels[localField] = {
	                  modelName: relationName,
	                  relation: 'belongsTo'
	                };
	              } else if (def.type === 'hasMany') {
	                merge[localField] = _this4.r.table(models[relationName].table || underscore(models[relationName].name)).getAll(id, { index: foreignKey }).coerceTo('ARRAY');

	                newModels[localField] = {
	                  modelName: relationName,
	                  relation: 'hasMany'
	                };
	              } else if (def.type === 'hasOne') {
	                merge[localField] = _this4.r.table(models[relationName].table || underscore(models[relationName].name));

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
	  }, {
	    key: 'create',
	    value: function create(resourceConfig, attrs, options) {
	      var _this5 = this;

	      attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
	      options = options || {};
	      return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(function () {
	        return _this5.r.db(options.db || _this5.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).insert(attrs, { returnChanges: true }).run();
	      }).then(function (cursor) {
	        _this5._handleErrors(cursor);
	        return cursor.changes[0].new_val;
	      });
	    }
	  }, {
	    key: 'update',
	    value: function update(resourceConfig, id, attrs, options) {
	      var _this6 = this;

	      attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
	      options = options || {};
	      return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(function () {
	        return _this6.r.db(options.db || _this6.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).get(id).update(attrs, { returnChanges: true }).run();
	      }).then(function (cursor) {
	        _this6._handleErrors(cursor);
	        if (cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
	          return cursor.changes[0].new_val;
	        } else {
	          return _this6.selectTable(resourceConfig, options).get(id).run();
	        }
	      });
	    }
	  }, {
	    key: 'updateAll',
	    value: function updateAll(resourceConfig, attrs, params, options) {
	      var _this7 = this;

	      attrs = removeCircular(omit(attrs, resourceConfig.relationFields || []));
	      options = options || {};
	      params = params || {};
	      return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(function () {
	        return _this7.filterSequence(_this7.selectTable(resourceConfig, options), params).update(attrs, { returnChanges: true }).run();
	      }).then(function (cursor) {
	        _this7._handleErrors(cursor);
	        if (cursor && cursor.changes && cursor.changes.length) {
	          var _ret = (function () {
	            var items = [];
	            cursor.changes.forEach(function (change) {
	              return items.push(change.new_val);
	            });
	            return {
	              v: items
	            };
	          })();

	          if (typeof _ret === 'object') return _ret.v;
	        } else {
	          return _this7.filterSequence(_this7.selectTable(resourceConfig, options), params).run();
	        }
	      });
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy(resourceConfig, id, options) {
	      var _this8 = this;

	      options = options || {};
	      return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(function () {
	        return _this8.r.db(options.db || _this8.defaults.db).table(resourceConfig.table || underscore(resourceConfig.name)).get(id)['delete']().run();
	      }).then(function () {
	        return undefined;
	      });
	    }
	  }, {
	    key: 'destroyAll',
	    value: function destroyAll(resourceConfig, params, options) {
	      var _this9 = this;

	      options = options || {};
	      params = params || {};
	      return this.waitForTable(resourceConfig.table || underscore(resourceConfig.name), options).then(function () {
	        return _this9.filterSequence(_this9.selectTable(resourceConfig, options), params)['delete']().run();
	      }).then(function () {
	        return undefined;
	      });
	    }
	  }, {
	    key: '_handleErrors',
	    value: function _handleErrors(cursor) {
	      if (cursor && cursor.errors > 0) {
	        if (cursor.first_error) {
	          throw new Error(cursor.first_error);
	        }
	        throw new Error('Unknown RethinkDB Error');
	      }
	    }
	  }]);

	  return DSRethinkDBAdapter;
	})();

	module.exports = DSRethinkDBAdapter;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("rethinkdbdash");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("js-data");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("mout/string/underscore");

/***/ }
/******/ ]);