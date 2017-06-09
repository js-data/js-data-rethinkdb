import {utils} from 'js-data'
import {
  Adapter,
  reserved
} from 'js-data-adapter'
import rethinkdbdash from 'rethinkdbdash'
import underscore from 'mout/string/underscore'

const __super__ = Adapter.prototype

const R_OPTS_DEFAULTS = {
  db: 'test'
}
const INSERT_OPTS_DEFAULTS = {}
const UPDATE_OPTS_DEFAULTS = {}
const DELETE_OPTS_DEFAULTS = {}
const RUN_OPTS_DEFAULTS = {}

var getRowField = function (row, field) {
  if (field.indexOf('.') === -1) {
    return row(field)
  }
  let fields = field.split('.')
  let resultRow = row(fields[ 0 ])
  for (let i = 1; i < fields.length; i++) {
    resultRow = resultRow(fields[ i ])
  }
  return resultRow
}

const equal = function (r, row, field, value) {
  return getRowField(field).default(null).eq(value)
}

const notEqual = function (r, row, field, value) {
  return getRowField(field).default(null).ne(value)
}

/**
 * Default predicate functions for the filtering operators.
 *
 * @name module:js-data-rethinkdb.OPERATORS
 * @property {function} = Equality operator.
 * @property {function} == Equality operator.
 * @property {function} != Inequality operator.
 * @property {function} > "Greater than" operator.
 * @property {function} >= "Greater than or equal to" operator.
 * @property {function} < "Less than" operator.
 * @property {function} <= "Less than or equal to" operator.
 * @property {function} isectEmpty Operator to test that the intersection
 * between two arrays is empty.
 * @property {function} isectNotEmpty Operator to test that the intersection
 * between two arrays is NOT empty.
 * @property {function} in Operator to test whether a value is found in the
 * provided array.
 * @property {function} notIn Operator to test whether a value is NOT found in
 * the provided array.
 * @property {function} contains Operator to test whether an array contains the
 * provided value.
 * @property {function} notContains Operator to test whether an array does NOT
 * contain the provided value.
 */
export const OPERATORS = {
  '=': equal,
  '==': equal,
  '===': equal,
  '!=': notEqual,
  '!==': notEqual,
  '>': function (r, row, field, value) {
    return getRowField(field).default(null).gt(value)
  },
  '>=': function (r, row, field, value) {
    return getRowField(field).default(null).ge(value)
  },
  '<': function (r, row, field, value) {
    return getRowField(field).default(null).lt(value)
  },
  '<=': function (r, row, field, value) {
    return getRowField(field).default(null).le(value)
  },
  'isectEmpty': function (r, row, field, value) {
    return getRowField(field).default([]).setIntersection(r.expr(value).default([])).count().eq(0)
  },
  'isectNotEmpty': function (r, row, field, value) {
    return getRowField(field).default([]).setIntersection(r.expr(value).default([])).count().ne(0)
  },
  'in': function (r, row, field, value) {
    return r.expr(value).default(r.expr([])).contains(getRowField(field).default(null))
  },
  'notIn': function (r, row, field, value) {
    return r.expr(value).default(r.expr([])).contains(getRowField(field).default(null)).not()
  },
  'contains': function (r, row, field, value) {
    return getRowField(field).default([]).contains(value)
  },
  'notContains': function (r, row, field, value) {
    return getRowField(field).default([]).contains(value).not()
  }
}

Object.freeze(OPERATORS)

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
 * @param {object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Adapter#debug}.
 * @param {object} [opts.deleteOpts={}] See {@link RethinkDBAdapter#deleteOpts}.
 * @param {object} [opts.insertOpts={}] See {@link RethinkDBAdapter#insertOpts}.
 * @param {object} [opts.operators={@link module:js-data-rethinkdb.OPERATORS}] See {@link RethinkDBAdapter#operators}.
 * @param {object} [opts.r] See {@link RethinkDBAdapter#r}.
 * @param {boolean} [opts.raw=false] See {@link Adapter#raw}.
 * @param {object} [opts.rOpts={}] See {@link RethinkDBAdapter#rOpts}.
 * @param {object} [opts.runOpts={}] See {@link RethinkDBAdapter#runOpts}.
 * @param {object} [opts.updateOpts={}] See {@link RethinkDBAdapter#updateOpts}.
 */
export function RethinkDBAdapter (opts) {
  utils.classCallCheck(this, RethinkDBAdapter)
  opts || (opts = {})

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
     * @type {object}
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
  })

  Adapter.call(this, opts)

  /**
   * Default options to pass to r#insert.
   *
   * @name RethinkDBAdapter#insertOpts
   * @type {object}
   * @default {}
   */
  this.insertOpts || (this.insertOpts = {})
  utils.fillIn(this.insertOpts, INSERT_OPTS_DEFAULTS)

  /**
   * Default options to pass to r#update.
   *
   * @name RethinkDBAdapter#updateOpts
   * @type {object}
   * @default {}
   */
  this.updateOpts || (this.updateOpts = {})
  utils.fillIn(this.updateOpts, UPDATE_OPTS_DEFAULTS)

  /**
   * Default options to pass to r#delete.
   *
   * @name RethinkDBAdapter#deleteOpts
   * @type {object}
   * @default {}
   */
  this.deleteOpts || (this.deleteOpts = {})
  utils.fillIn(this.deleteOpts, DELETE_OPTS_DEFAULTS)

  /**
   * Default options to pass to r#run.
   *
   * @name RethinkDBAdapter#runOpts
   * @type {object}
   * @default {}
   */
  this.runOpts || (this.runOpts = {})
  utils.fillIn(this.runOpts, RUN_OPTS_DEFAULTS)

  /**
   * Override the default predicate functions for the specified operators.
   *
   * @name RethinkDBAdapter#operators
   * @type {object}
   * @default {}
   */
  this.operators || (this.operators = {})
  utils.fillIn(this.operators, OPERATORS)

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
   * @type {object}
   */
  this.rOpts || (this.rOpts = {})
  utils.fillIn(this.rOpts, R_OPTS_DEFAULTS)

  this.r || (this.r = rethinkdbdash(this.rOpts))
}

Adapter.extend({
  constructor: RethinkDBAdapter,

  _handleErrors (cursor) {
    if (cursor && cursor.errors > 0) {
      if (cursor.first_error) {
        throw new Error(cursor.first_error)
      }
      throw new Error('Unknown RethinkDB Error')
    }
  },

  _count (mapper, query, opts) {
    opts || (opts = {})
    query || (query = {})

    return this.filterSequence(this.selectTable(mapper, opts), query)
      .count()
      .run(this.getOpt('runOpts', opts))
      .then((count) => [count, {}])
  },

  _create (mapper, props, opts) {
    props || (props = {})
    opts || (opts = {})

    const insertOpts = this.getOpt('insertOpts', opts)
    insertOpts.returnChanges = true

    return this.selectTable(mapper, opts)
      .insert(props, insertOpts)
      .run(this.getOpt('runOpts', opts))
      .then((cursor) => {
        this._handleErrors(cursor)
        let record
        if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
          record = cursor.changes[0].new_val
        }
        return [record, cursor]
      })
  },

  _createMany (mapper, props, opts) {
    props || (props = {})
    opts || (opts = {})

    const insertOpts = this.getOpt('insertOpts', opts)
    insertOpts.returnChanges = true

    return this.selectTable(mapper, opts)
      .insert(props, insertOpts)
      .run(this.getOpt('runOpts', opts))
      .then((cursor) => {
        this._handleErrors(cursor)
        let records = []
        if (cursor && cursor.changes && cursor.changes.length && cursor.changes) {
          records = cursor.changes.map((change) => change.new_val)
        }
        return [records, cursor]
      })
  },

  _destroy (mapper, id, opts) {
    opts || (opts = {})

    return this.selectTable(mapper, opts)
      .get(id)
      .delete(this.getOpt('deleteOpts', opts))
      .run(this.getOpt('runOpts', opts))
      .then((cursor) => {
        this._handleErrors(cursor)
        return [undefined, cursor]
      })
  },

  _destroyAll (mapper, query, opts) {
    query || (query = {})
    opts || (opts = {})

    return this.filterSequence(this.selectTable(mapper, opts), query)
      .delete(this.getOpt('deleteOpts', opts))
      .run(this.getOpt('runOpts', opts))
      .then((cursor) => {
        this._handleErrors(cursor)
        return [undefined, cursor]
      })
  },

  _find (mapper, id, opts) {
    opts || (opts = {})

    return this._pluck(mapper, this.selectTable(mapper, opts).get(id), opts)
      .run(this.getOpt('runOpts', opts))
      .then((record) => [record, {}])
  },

  _findAll (mapper, query, opts) {
    opts || (opts = {})
    query || (query = {})

    return this._pluck(mapper, this.filterSequence(this.selectTable(mapper, opts), query), opts)
      .run(this.getOpt('runOpts', opts))
      .then((records) => [records, {}])
  },

  _pluck (mapper, rql, opts) {
    if (utils.isString(opts.fields)) {
      opts.fields = [opts.fields]
    }
    if (utils.isArray(opts.fields)) {
      return rql.pluck(...opts.fields)
    }
    return rql
  },

  _sum (mapper, field, query, opts) {
    if (!utils.isString(field)) {
      throw new Error('field must be a string!')
    }
    opts || (opts = {})
    query || (query = {})

    return this.filterSequence(this.selectTable(mapper, opts), query)
      .sum(field)
      .run(this.getOpt('runOpts', opts))
      .then((sum) => [sum, {}])
  },

  _update (mapper, id, props, opts) {
    props || (props = {})
    opts || (opts = {})

    const updateOpts = this.getOpt('updateOpts', opts)
    updateOpts.returnChanges = true

    return this.selectTable(mapper, opts)
      .get(id)
      .update(props, updateOpts)
      .run(this.getOpt('runOpts', opts))
      .then((cursor) => {
        this._handleErrors(cursor)
        if (cursor.skipped) {
          throw new Error('Not Found')
        } else if (cursor && cursor.changes && cursor.changes.length && cursor.changes[0].new_val) {
          return [cursor.changes[0].new_val, cursor]
        } else {
          return this._find(mapper, id, opts)
        }
      })
  },

  _updateAll (mapper, props, query, opts) {
    props || (props = {})
    query || (query = {})
    opts || (opts = {})

    const updateOpts = this.getOpt('updateOpts', opts)
    updateOpts.returnChanges = true

    return this.filterSequence(this.selectTable(mapper, opts), query)
      .update(props, updateOpts)
      .run(this.getOpt('runOpts', opts))
      .then((cursor) => {
        let records = []
        this._handleErrors(cursor)
        if (cursor && cursor.changes && cursor.changes.length) {
          records = cursor.changes.map((change) => change.new_val)
        }
        return [records, cursor]
      })
  },

  _updateMany (mapper, records, opts) {
    records || (records = [])
    opts || (opts = {})

    const insertOpts = this.getOpt('insertOpts', opts)
    insertOpts.returnChanges = true
    insertOpts.conflict = 'update'

    return this.selectTable(mapper, opts)
      .insert(records, insertOpts)
      .run(this.getOpt('runOpts', opts))
      .then((cursor) => {
        records = []
        this._handleErrors(cursor)
        if (cursor && cursor.changes && cursor.changes.length) {
          records = cursor.changes.map((change) => change.new_val)
        }
        return [records, cursor]
      })
  },

  _applyWhereFromObject (where) {
    const fields = []
    const ops = []
    const predicates = []
    utils.forOwn(where, (clause, field) => {
      if (!utils.isObject(clause)) {
        clause = {
          '==': clause
        }
      }
      utils.forOwn(clause, (expr, op) => {
        fields.push(field)
        ops.push(op)
        predicates.push(expr)
      })
    })
    return {
      fields,
      ops,
      predicates
    }
  },

  _applyWhereFromArray (where) {
    const groups = []
    where.forEach((_where, i) => {
      if (utils.isString(_where)) {
        return
      }
      const prev = where[i - 1]
      const parser = utils.isArray(_where) ? this._applyWhereFromArray : this._applyWhereFromObject
      const group = parser.call(this, _where)
      if (prev === 'or') {
        group.isOr = true
      }
      groups.push(group)
    })
    groups.isArray = true
    return groups
  },

  _testObjectGroup (rql, group, row, opts) {
    let i
    const r = this.r
    const fields = group.fields
    const ops = group.ops
    const predicates = group.predicates
    const len = ops.length
    for (i = 0; i < len; i++) {
      let op = ops[i]
      const isOr = op.charAt(0) === '|'
      op = isOr ? op.substr(1) : op
      const predicateFn = this.getOperator(op, opts)
      if (predicateFn) {
        const predicateResult = predicateFn(r, row, fields[i], predicates[i])
        if (isOr) {
          rql = rql ? rql.or(predicateResult) : predicateResult
        } else {
          rql = rql ? rql.and(predicateResult) : predicateResult
        }
      } else {
        throw new Error(`Operator ${op} not supported!`)
      }
    }
    return rql
  },

  _testArrayGroup (rql, groups, row, opts) {
    let i
    const len = groups.length
    for (i = 0; i < len; i++) {
      const group = groups[i]
      let subQuery
      if (group.isArray) {
        subQuery = this._testArrayGroup(rql, group, row, opts)
      } else {
        subQuery = this._testObjectGroup(null, group, row, opts)
      }
      if (groups[i - 1]) {
        if (group.isOr) {
          rql = rql.or(subQuery)
        } else {
          rql = rql.and(subQuery)
        }
      } else {
        rql = rql ? rql.and(subQuery) : subQuery
      }
    }
    return rql
  },

  /**
   * Apply the specified selection query to the provided RQL sequence.
   *
   * @name RethinkDBAdapter#filterSequence
   * @method
   * @param {object} mapper The mapper.
   * @param {object} [query] Selection query.
   * @param {object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.operators] Override the default predicate functions
   * for specified operators.
   */
  filterSequence (sequence, query, opts) {
    const r = this.r

    query = utils.plainCopy(query || {})
    opts || (opts = {})
    opts.operators || (opts.operators = {})
    query.where || (query.where = {})
    query.orderBy || (query.orderBy = query.sort)
    query.orderBy || (query.orderBy = [])
    query.skip || (query.skip = query.offset)

    // Transform non-keyword properties to "where" clause configuration
    utils.forOwn(query, (config, keyword) => {
      if (reserved.indexOf(keyword) === -1) {
        if (utils.isObject(config)) {
          query.where[keyword] = config
        } else {
          query.where[keyword] = {
            '==': config
          }
        }
        delete query[keyword]
      }
    })

    let rql = sequence

    // Filter
    let groups

    if (utils.isObject(query.where) && Object.keys(query.where).length !== 0) {
      groups = this._applyWhereFromArray([query.where])
    } else if (utils.isArray(query.where)) {
      groups = this._applyWhereFromArray(query.where)
    }

    if (groups) {
      rql = rql.filter((row) => this._testArrayGroup(null, groups, row, opts) || true)
    }

    // Sort
    if (query.orderBy) {
      if (utils.isString(query.orderBy)) {
        query.orderBy = [
          [query.orderBy, 'asc']
        ]
      }
      for (var i = 0; i < query.orderBy.length; i++) {
        if (utils.isString(query.orderBy[i])) {
          query.orderBy[i] = [query.orderBy[i], 'asc']
        }
        rql = (query.orderBy[i][1] || '').toUpperCase() === 'DESC' ? rql.orderBy(r.desc(query.orderBy[i][0])) : rql.orderBy(query.orderBy[i][0])
      }
    }

    // Offset
    if (query.skip) {
      rql = rql.skip(+query.skip)
    }

    // Limit
    if (query.limit) {
      rql = rql.limit(+query.limit)
    }

    return rql
  },

  selectDb (opts) {
    return this.r.db(utils.isUndefined(opts.db) ? this.rOpts.db : opts.db)
  },

  selectTable (mapper, opts) {
    return this.selectDb(opts).table(mapper.table || underscore(mapper.name))
  },

  waitForDb (opts) {
    opts || (opts = {})
    const db = utils.isUndefined(opts.db) ? this.rOpts.db : opts.db
    if (!this.databases[db]) {
      this.databases[db] = this.r.branch(
        this.r.dbList().contains(db),
        true,
        this.r.dbCreate(db)
      ).run()
    }
    return this.databases[db]
  },

  waitForTable (mapper, opts) {
    opts || (opts = {})
    const table = utils.isString(mapper) ? mapper : (mapper.table || underscore(mapper.name))
    let db = utils.isUndefined(opts.db) ? this.rOpts.db : opts.db
    return this.waitForDb(opts).then(() => {
      this.tables[db] = this.tables[db] || {}
      if (!this.tables[db][table]) {
        this.tables[db][table] = this.r.branch(this.r.db(db).tableList().contains(table), true, this.r.db(db).tableCreate(table)).run()
      }
      return this.tables[db][table]
    })
  },

  waitForIndex (table, index, opts) {
    opts || (opts = {})
    let db = utils.isUndefined(opts.db) ? this.rOpts.db : opts.db
    return this.waitForDb(opts).then(() => this.waitForTable(table, opts)).then(() => {
      this.indices[db] = this.indices[db] || {}
      this.indices[db][table] = this.indices[db][table] || {}
      if (!this.tables[db][table][index]) {
        this.tables[db][table][index] = this.r.branch(this.r.db(db).table(table).indexList().contains(index), true, this.r.db(db).table(table).indexCreate(index)).run().then(() => {
          return this.r.db(db).table(table).indexWait(index).run()
        })
      }
      return this.tables[db][table][index]
    })
  },

  /**
   * Return the number of records that match the selection query.
   *
   * @name RethinkDBAdapter#count
   * @method
   * @param {object} mapper the mapper.
   * @param {object} [query] Selection query.
   * @param {object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  count (mapper, query, opts) {
    opts || (opts = {})
    query || (query = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.count.call(this, mapper, query, opts))
  },

  /**
   * Create a new record.
   *
   * @name RethinkDBAdapter#create
   * @method
   * @param {object} mapper The mapper.
   * @param {object} props The record to be created.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.insertOpts] Options to pass to r#insert.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  create (mapper, props, opts) {
    props || (props = {})
    opts || (opts = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.create.call(this, mapper, props, opts))
  },

  /**
   * Create multiple records in a single batch.
   *
   * @name RethinkDBAdapter#createMany
   * @method
   * @param {object} mapper The mapper.
   * @param {object} props The records to be created.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.insertOpts] Options to pass to r#insert.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  createMany (mapper, props, opts) {
    props || (props = {})
    opts || (opts = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.createMany.call(this, mapper, props, opts))
  },

  /**
   * Destroy the record with the given primary key.
   *
   * @name RethinkDBAdapter#destroy
   * @method
   * @param {object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to destroy.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.deleteOpts] Options to pass to r#delete.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  destroy (mapper, id, opts) {
    opts || (opts = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.destroy.call(this, mapper, id, opts))
  },

  /**
   * Destroy the records that match the selection query.
   *
   * @name RethinkDBAdapter#destroyAll
   * @method
   * @param {object} mapper the mapper.
   * @param {object} [query] Selection query.
   * @param {object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.deleteOpts] Options to pass to r#delete.
   * @param {object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  destroyAll (mapper, query, opts) {
    opts || (opts = {})
    query || (query = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.destroyAll.call(this, mapper, query, opts))
  },

  /**
   * Retrieve the record with the given primary key.
   *
   * @name RethinkDBAdapter#find
   * @method
   * @param {object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to retrieve.
   * @param {object} [opts] Configuration options.
   * @param {string[]} [opts.fields] Select a subset of fields to be returned.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @param {string[]} [opts.with=[]] Relations to eager load.
   * @return {Promise}
   */
  find (mapper, id, opts) {
    opts || (opts = {})
    opts.with || (opts.with = [])

    const relationList = mapper.relationList || []
    let tasks = [this.waitForTable(mapper, opts)]

    relationList.forEach((def) => {
      const relationName = def.relation
      const relationDef = def.getRelation()
      if (!opts.with || opts.with.indexOf(relationName) === -1) {
        return
      }
      if (def.foreignKey && def.type !== 'belongsTo') {
        if (def.type === 'belongsTo') {
          tasks.push(this.waitForIndex(mapper.table || underscore(mapper.name), def.foreignKey, opts))
        } else {
          tasks.push(this.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts))
        }
      }
    })
    return Promise.all(tasks).then(() => __super__.find.call(this, mapper, id, opts))
  },

  /**
   * Retrieve the records that match the selection query.
   *
   * @name RethinkDBAdapter#findAll
   * @method
   * @param {object} mapper The mapper.
   * @param {object} [query] Selection query.
   * @param {object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {object} [opts] Configuration options.
   * @param {string[]} [opts.fields] Select a subset of fields to be returned.
   * @param {object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @param {string[]} [opts.with=[]] Relations to eager load.
   * @return {Promise}
   */
  findAll (mapper, query, opts) {
    opts || (opts = {})
    opts.with || (opts.with = [])
    query || (query = {})

    const relationList = mapper.relationList || []
    let tasks = [this.waitForTable(mapper, opts)]

    relationList.forEach((def) => {
      const relationName = def.relation
      const relationDef = def.getRelation()
      if (!opts.with || opts.with.indexOf(relationName) === -1) {
        return
      }
      if (def.foreignKey && def.type !== 'belongsTo') {
        if (def.type === 'belongsTo') {
          tasks.push(this.waitForIndex(mapper.table || underscore(mapper.name), def.foreignKey, opts))
        } else {
          tasks.push(this.waitForIndex(relationDef.table || underscore(relationDef.name), def.foreignKey, opts))
        }
      }
    })
    return Promise.all(tasks).then(() => __super__.findAll.call(this, mapper, query, opts))
  },

  /**
   * Resolve the predicate function for the specified operator based on the
   * given options and this adapter's settings.
   *
   * @name RethinkDBAdapter#getOperator
   * @method
   * @param {string} operator The name of the operator.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @return {*} The predicate function for the specified operator.
   */
  getOperator (operator, opts) {
    opts || (opts = {})
    opts.operators || (opts.operators = {})
    let ownOps = this.operators || {}
    return utils.isUndefined(opts.operators[operator]) ? ownOps[operator] : opts.operators[operator]
  },

  /**
   * Return the sum of the specified field of records that match the selection
   * query.
   *
   * @name RethinkDBAdapter#sum
   * @method
   * @param {object} mapper The mapper.
   * @param {string} field The field to sum.
   * @param {object} [query] Selection query.
   * @param {object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  sum (mapper, field, query, opts) {
    opts || (opts = {})
    query || (query = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.sum.call(this, mapper, field, query, opts))
  },

  /**
   * Apply the given update to the record with the specified primary key.
   *
   * @name RethinkDBAdapter#update
   * @method
   * @param {object} mapper The mapper.
   * @param {(string|number)} id The primary key of the record to be updated.
   * @param {object} props The update to apply to the record.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.updateOpts] Options to pass to r#update.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  update (mapper, id, props, opts) {
    props || (props = {})
    opts || (opts = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.update.call(this, mapper, id, props, opts))
  },

  /**
   * Apply the given update to all records that match the selection query.
   *
   * @name RethinkDBAdapter#updateAll
   * @method
   * @param {object} mapper The mapper.
   * @param {object} props The update to apply to the selected records.
   * @param {object} [query] Selection query.
   * @param {object} [query.where] Filtering criteria.
   * @param {string|Array} [query.orderBy] Sorting criteria.
   * @param {string|Array} [query.sort] Same as `query.sort`.
   * @param {number} [query.limit] Limit results.
   * @param {number} [query.skip] Offset results.
   * @param {number} [query.offset] Same as `query.skip`.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.operators] Override the default predicate functions
   * for specified operators.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @param {object} [opts.updateOpts] Options to pass to r#update.
   * @return {Promise}
   */
  updateAll (mapper, props, query, opts) {
    props || (props = {})
    query || (query = {})
    opts || (opts = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.updateAll.call(this, mapper, props, query, opts))
  },

  /**
   * Update the given records in a single batch.
   *
   * @name RethinkDBAdapter#updateMany
   * @method
   * @param {object} mapper The mapper.
   * @param {Object[]} records The records to update.
   * @param {object} [opts] Configuration options.
   * @param {object} [opts.insertOpts] Options to pass to r#insert.
   * @param {boolean} [opts.raw=false] Whether to return a more detailed
   * response object.
   * @param {object} [opts.runOpts] Options to pass to r#run.
   * @return {Promise}
   */
  updateMany (mapper, records, opts) {
    records || (records = [])
    opts || (opts = {})

    return this.waitForTable(mapper, opts)
      .then(() => __super__.updateMany.call(this, mapper, records, opts))
  }
})

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
 * @type {object}
 * @property {string} version.full The full semver value.
 * @property {number} version.major The major version number.
 * @property {number} version.minor The minor version number.
 * @property {number} version.patch The patch version number.
 * @property {(string|boolean)} version.alpha The alpha version value,
 * otherwise `false` if the current version is not alpha.
 * @property {(string|boolean)} version.beta The beta version value,
 * otherwise `false` if the current version is not beta.
 */
export const version = '<%= version %>'

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
 * @param {object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this RethinkDBAdapter class.
 * @since 3.0.0
 */
