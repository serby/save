var _ = require('lodash');

module.exports = function(options) {
  var defaults =
    { idProperty: '_id'
    };

  options = _.extend({}, options, defaults);

  var data = {}
    , idSeq = 0;

    function find(query, options, callback) {

      var foundObjects = Object.keys(data).filter(function(key) {
        return Object.keys(query).every(function(queryKey) {
          return data[key][queryKey] === query[queryKey];
        });
      });
      foundObjects = foundObjects.map(function(key) {
        return data[key];
      });

      if (options.$sort) {
        foundObjects.sort(function(a, b) {
          //TODO: Handle multiple sort properties
          var key = Object.keys(options.$sort)[0];
          if (a[key] === b[key]) {
            return 0;
          } else {
            // Ascending
            if (options.$sort[key] === 1) {
              return a[key] < b[key] ? -1 : 1;
            // Descending
            } else if (options.$sort[key] === -1) {
              return a[key] > b[key] ? -1 : 1;
            }
          }
        });
      }

      callback(undefined, foundObjects);
    }

  return (
    { create: function(object, callback) {
        idSeq += 1;
        object[options.idProperty] = idSeq;
        data[idSeq] = object;
        callback(undefined, object);
      }
    , read: function(id, callback) {
      var query = {};
      query[options.idProperty] = id;
        find(query, {}, function(error, objects) {
          callback(undefined, objects[0]);
        });
      }
    , update: function(object, set, callback) {
        if (typeof set === 'function') {
          callback = set;
          set = true;
        }
        var id = object[options.idProperty];

        if (id === undefined) {
          return callback(new Error('Object has no \''
            + options.idProperty + '\' property'));
        }
        if (data[id] === undefined) {
          return callback(new Error('No object found with \''
            + options.idProperty + '\' = \'' + id + '\''));
        }
        callback(undefined, _.extend(data[id], object));
      }
    , deleteOne: function(object, callback) {
        delete data[object[options.idProperty]];
        callback(undefined);
      }
    , find: find
    , findOne: function(query, options, callback) {
        find(query, options, function(error, objects) {
          callback(undefined, objects[0]);
        });
      }
    , count: function(query, callback) {
        find(query, options, function(error, objects) {
          callback(undefined, objects.length);
        });
      }
    }
  );
};