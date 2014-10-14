var async = require('async')
  , emptyFn = function () {}
  , _ = require('lodash')
  , EventEmitter = require('events').EventEmitter

module.exports = function (opts) {
  var options = _.extend({ idProperty: '_id' }, opts)
    , self = new EventEmitter()
    , data = {}
    , idSeq = 0

  /**
   * Checks that the object has the ID property present, then checks
   * if the data object has that ID value present.e
   *
   * Returns an Error to the callback if either of the above checks fail
   *
   * @param {Object} object to check
   * @param {Function} callback
   * @api private
   */
  function checkForIdAndData(object, callback) {
    var id = object[options.idProperty]


    if (id === undefined || id === null) {
      return callback(new Error('Object has no \''
        + options.idProperty + '\' property'))
    }

    if (data[id] === undefined) {
      return callback(new Error('No object found with \''
        + options.idProperty + '\' = \'' + id + '\''))
    }

    return callback(null)
  }

  /**
   * Create a new entity. Emits a 'create' event.
   *
   * @param {Object} object to create
   * @param {Function} callback (optional)
   * @api public
   */
  function create(object, callback) {
    self.emit('create', object)
    callback = callback || emptyFn
    // clone the object
    var extendedObject = _.extend({}, object)
    if (!extendedObject[options.idProperty]) {

      idSeq += 1
      extendedObject[options.idProperty] = '' + idSeq
      data['' + idSeq] = _.clone(extendedObject)
    } else {
      // if an id is provided, cast to string.
      extendedObject[options.idProperty] = '' + extendedObject[options.idProperty]
      data[extendedObject[options.idProperty]] = _.clone(extendedObject)
    }
    self.emit('afterCreate', extendedObject)
    callback(undefined, extendedObject)
  }

  /**
   * Create or update a entity. Emits a 'create' event or a 'update'.
   *
   * @param {Object} object to create or update
   * @param {Function} callback (optional)
   * @api public
   */
  function createOrUpdate(object, callback) {
    if (typeof object[options.idProperty] === 'undefined') {
      // Create a new object
      self.create(object, callback)
    } else {
      // Try and find the object first to update
      var query = {}
      query[options.idProperty] = object[options.idProperty]

      self.findOne(query, function (err, foundObject) {
        if (foundObject) {
          // We found the object so update
          self.update(object, callback)
        } else {
          // We didn't find the object so create
          self.create(object, callback)
        }
      })
    }
  }

  /**
   * Reads a single entity. Emits a 'read' event.
   *
   * @param {Number} id to read
   * @param {Function} callback (optional)
   * @api public
   */
  function read(id, callback) {
    var query = {}

    self.emit('read', id)
    callback = callback || emptyFn
    query[options.idProperty] = '' + id
    findByQuery(query, {}, function (error, objects) {
      callback(undefined, objects[0])
    })
  }

  /**
   * Updates a single entity. Emits an 'update' event. Optionally overwrites
   * the entire entity, by default just extends it with the new values.
   *
   * @param {Object} object to update
   * @param {Boolean} whether to overwrite or extend the existing entity
   * @param {Function} callback (optional)
   * @api public
   */
  function update(object, overwrite, callback) {
    if (typeof overwrite === 'function') {
      callback = overwrite
      overwrite = false
    }
    self.emit('update', object, overwrite)
    callback = callback || emptyFn
    var id = '' + object[options.idProperty]
      , updatedObject = object

    checkForIdAndData(object, function (error) {
      if (error) {
        return callback(error)
      }

      if (overwrite) {
        data[id] = object
      } else {
        updatedObject = _.extend(data[id], object)
      }
      self.emit('afterUpdate', updatedObject, overwrite)
      callback(undefined, updatedObject)
    })
  }

  /**
   * Deletes entities based on a query. Emits a 'delete' event. Performs a find
   * by query, then calls delete for each item returned. Returns an error if no
   * items match the query.
   *
   * @param {Object} query to delete on
   * @param {Function} callback (optional)
   * @api public
   */
  function deleteMany(query, callback) {
    callback = callback || emptyFn
    self.emit('deleteMany', query)
    find(query, {}, function (error, objects) {
      async.forEach(objects, function (object, fnCallback) {
        del(object[options.idProperty])
        fnCallback()
      }, callback)
    })
    self.emit('afterDeleteMany', query)
  }

  /**
   * Deletes one entity. Emits a 'delete' event. Returns an error if the
   * object can not be found or if the ID property is not present.
   *
   * @param {Object} object to delete
   * @param {Function} callback (optional)
   * @api public
   */
  function del(id, callback) {

    callback = callback || emptyFn

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function or empty')
    }

    self.emit('delete', id)

    if (data[id] === undefined) {
      return callback(new Error('No object found with \''
        + options.idProperty + '\' = \'' + id + '\''))
    }

    delete data['' + id]
    self.emit('afterDelete', '' + id)
    callback(undefined)
  }

  /**
   * Performs a find on the data by search query.
   *
   * Sorting can be done similarly to mongo by providing a $sort option to
   * the options object.
   *
   * The query can target fields in a subdocument similarly to mongo by passing
   * a string reference to the subdocument in dot notation.
   *
   * @param {Object} query to search by
   * @param {Object} search options
   * @param {Function} callback
   * @api private
   */
  function findByQuery(query, options, callback) {

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (typeof callback !== 'function') {
      throw new Error('callback must be a function')
    }

    var foundObjects = Object.keys(data).filter(function (key) {
      var obj = data[key]
      return Object.keys(query).every(function (queryKey) {
        if (queryKey.indexOf('.') !== -1) {
          return queryKey.split('.').reduce(function(nestedObj, key) {
            if (nestedObj) return nestedObj[key]
          }, obj) === query[queryKey]
        }
        var queryValue = query[queryKey]
        if (typeof queryValue === 'object') {
          if ((queryValue.$in) && (Array.isArray(queryValue.$in))) {
            return queryValue.$in.indexOf(obj[queryKey]) !== -1
          }
        }
        return obj[queryKey] === query[queryKey]
      })
    })
    foundObjects = foundObjects.map(function (key) {
      return _.clone(data[key])
    })

    if (options.sort) {
      var key
        , asc = true

      if (Array.isArray(options.sort)) {
        key = options.sort[0][0]
      } else {
        key = options.sort
      }

      asc = options.sort[0][1] ? options.sort[0][1] === 'asc' : true
      foundObjects.sort(function (a, b) {
        //TODO: Handle multiple sort properties

        if (a[key] === b[key]) {
          return 0
        } else {
          // Ascending
          if (asc) {
            return a[key] < b[key] ? -1 : 1
          // Descending
          } else {
            return a[key] > b[key] ? -1 : 1
          }
        }
      })
    }

    callback(undefined, foundObjects)
  }

  /**
   * Performs a find on the data. Emits a 'find' event.
   *
   * @param {Object} query to search by
   * @param {Object} options
   * @param {Function} callback
   * @api public
   */
  function find(query, options, callback) {
    self.emit('find', query, options)
    findByQuery(query, options, callback)
  }

  /**
   * Performs a find on the data and limits the result set to 1.
   * Emits a 'findOne' event.
   *
   * @param {Object} query to search by
   * @param {Object} options
   * @param {Function} callback
   * @api public
   */
  function findOne(query, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    self.emit('findOne', query, options)
    findByQuery(query, options, function (error, objects) {
      callback(undefined, objects[0])
    })
  }

  /**
   * Performs a count by query. Emits a 'count' event.
   *
   * @param {Object} query to search by
   * @param {Function} callback
   * @api public
   */
  function count(query, callback) {
    self.emit('count', query)
    find(query, options, function (error, objects) {
      callback(undefined, objects.length)
    })
  }

  _.extend(self,
    { create: create
    , read: read
    , update: update
    , 'delete': del
    , deleteMany: deleteMany
    , find: find
    , findOne: findOne
    , count: count
    , idProperty: options.idProperty
    , createOrUpdate: createOrUpdate
    })

  return self

}