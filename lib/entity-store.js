var _ = require('lowdash')
  , async = require('async')
  , Pipe = require('piton-pipe')
  , DataSet = require('./dataSet')
  , EventEmitter = require('events').EventEmitter
  ;

function validationError(errors) {
  var error = new Error('Invalid entity');
  error.name = 'ValidationError';
  error.errors = errors;
  return error;
}

module.exports.createEntityStore = function(name, entityDelegate, storesOptions) {

  var defaults =
      { idProperty: '_id'
      , logger: console
      , engine: undefined
      };

  storesOptions = _.extend({}, storesOptions, defaults);

  // If no engine is passed then default to the memory store.
  if (storesOptions.engine === undefined) {
    storesOptions.engine = require('memory-engine')();
  }

  var self = new EventEmitter()
    , pipes =
      { beforeCreate: Pipe.createPipe()
      , beforeCreateValidate: Pipe.createPipe()
      , beforeUpdate: Pipe.createPipe()
      , beforeUpdateValidate: Pipe.createPipe()
      , beforeDelete: Pipe.createPipe()
      };

  function pipeValidate(validationSet, validationTag, entityObject, callback) {
    entityDelegate.validate(entityObject, validationSet, validationTag, function(errors) {
      callback(Object.keys(errors).length === 0 ? null : validationError(errors), entityObject);
    });
  }

  function create(entityObject, options, callback) {

    if ((typeof options === 'function') && (callback === undefined)) {
      callback = options;
    }

    var errors
      , cleanEntityObject = entityDelegate.castProperties(
          entityDelegate.stripUnknownProperties(entityObject)
        )
      , pipe = Pipe.createPipe()
      ;

      pipe
      .add(function(value, callback) {
        pipes.beforeCreateValidate.run(value, callback);
      })
      .add(pipeValidate.bind(this, undefined, undefined))
      .add(function(value, callback) {
        pipes.beforeCreate.run(value, callback);
      })
      .run(cleanEntityObject, function(error, processedEntityObject) {
        if (error) {
          return callback(error, entityObject);
        }
        storesOptions.engine.insert(processedEntityObject, function(error, storedEntityObject) {
          if (error === null) {
            storesOptions.logger.info(name + ' created ', storedEntityObject);
            self.emit('onCreate', storedEntityObject);
            callback(null, storedEntityObject);
          } else {
            storesOptions.logger.warn('Error on create', error, storedEntityObject);
            callback(error, entityObject);
          }
        });
      }
    );
  }

  function read(id, callback) {
    var query = {};

    // This should be in the engine
    //query[storesOptions.idProperty] = storesOptions.idFilter(id);
    storesOptions.engine.findOne(query, function(errors, entityObject) {
      if (errors) {
        callback(errors, null);
      } else if (entityObject === undefined) {
        callback(new RangeError('Unable to find ' + name + ' with ' + storesOptions.idProperty + ' = ' + id), null);
      } else {
        callback(null, entityObject);
      }
    });
  }

  function update(id, entityObject, options, callback) {

    if ((typeof options === 'function') && (callback === undefined)) {
      callback = options;
      options = {};
    }

    var errors
      , cleanEntityObject = entityDelegate.castProperties(
          entityDelegate.stripUnknownProperties(entityObject, storesOptions.tag)
        )
      , pipe = Pipe.createPipe()
      ;

    pipe.add(function(value, callback) {
      pipes.beforeUpdateValidate.run(value, callback);
    });

    // Append to validator to the process pipe.
    pipe.add(pipeValidate.bind(self, storesOptions.validationSet, storesOptions.tag));

    pipe.add(function(value, callback) {
      pipes.beforeUpdate.run(value, callback);
    });

    pipe.run(cleanEntityObject, function(error, processedEntityObject) {
      if (error) {
        return callback(error, entityObject);
      }
      var query = {};

      //query[storesOptions.idProperty] = storesOptions.idFilter(id);

      // Remove this from the update because it is the identity field and can't be changed.
      // delete processedEntityObject[storesOptions.idProperty];
      storesOptions.engine.save(processedEntityObject, function (error, returnEntity) {
        if (error === null) {
          if (returnEntity === null) {
            storesOptions.logger.warn('Unable to find ' + name + ' for update with ' + storesOptions.idProperty + ' = ' + id);
            callback(new RangeError('Unable to find ' + name + ' for update with ' + storesOptions.idProperty + ' = ' + id), null);
          } else {
            storesOptions.logger.info(name + ' updated ', processedEntityObject);
            self.emit('onUpdate', returnEntity);
            callback(null, returnEntity);
          }
        } else {
          storesOptions.logger.warn('Error on update', error, returnEntity);
          // Return the same object that was passed in, so the user can see problems.
          callback(error, entityObject);
        }

      });
    });
  }

  function deleteByQuery(query, callback) {
    storesOptions.engine.remove(query, function(error, data) {
      if (error) {
        callback(error, null);
      } else {
        storesOptions.logger.info(name + ' deleted ', query);
        self.emit('onDelete', data);
        callback(null, data);
      }
    });
  }

  function deleteById(id, callback) {
    var query = {};
    //query[storesOptions.idProperty] = storesOptions.idFilter(id);
    deleteByQuery(query, callback);
  }

  function count(query, callback) {
    storesOptions.engine.count(query, function(error, count) {
      callback(error, count);
    });
  }

  /**
   * Returns a collection of entities
   *
   * You can omit the options parameter and just pass find(query, callback)
   *
   * @param {Object} query What to find
   * @param {Object} options How to manage the results set. See https://github.com/christkv/node-mongodb-native for full options
   * @param {Function} callback Called with the results or error callback(error, dataSet)
   */
  function find(query, options, callback) {

    if ((typeof options === 'function') && (callback === undefined)) {
      callback = options;
      options = {};
    }

    storesOptions.engine.find(query, options, function(error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, DataSet.createDataSet(entityDelegate, data));
      }
    });
  }

  /**
   * Returns first entity
   *
   * You can omit the options parameter and just pass findOne(query, callback)
   *
   * @param {Object} query What to findOne
   * @param {Object} options How to manage the results set. See https://github.com/christkv/node-mongodb-native for full options
   * @param {Function} callback Called with the result or error callback(error, data)
   */
  function findOne(query, options, callback) {

    if ((typeof options === 'function') && (callback === undefined)) {
      callback = options;
      options = {};
    }

    storesOptions.engine.findOne(query, options, function(error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, DataSet.createDataSet(entityDelegate, data));
      }
    });
  }

  self.name = name;
  self.idProperty = storesOptions.idProperty;
  self.slug = name.toLowerCase().replace(' ', '-').replace(/[^a-z0-9]/, '');
  self.create = create;
  self.read = read;
  self.update = update;
  self.deleteByQuery = deleteByQuery;
  self['delete'] = deleteById;
  self.validate = entityDelegate.validate;
  self.find = find;
  self.findOne = findOne;
  self.count = count;
  self.entityDelegate = entityDelegate;
  self.pipes = pipes;

  return self;
};

module.exports.validationError = validationError;