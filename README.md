# save - A simple CRUD based persistence abstraction for storing objects to any backend data store. eg. Memory, MongoDB, Redis, CouchDB, Postgres, Punch Card etc.

**save** comes with a fully featured in memory engine which is super handy for testing your models.
For real world use you'll need to get one of the database powered engines:

* [MongoDB](https://github.com/serby/save-mongodb)

If your data store of choice isn't listed here please create an engine and send me a pull request.

[![build status](https://secure.travis-ci.org/serby/entity-store.png)](http://travis-ci.org/serby/save)

## Installation

      npm install save

## Usage

## Events

### s.on('create', cb)
This event fires with `cb(object)` where `object` is the item that has been created.

### s.on('update', cb)
This event fires with `cb(object, overwrite)` where `object` is the item that has been updated and `overwrite` is whether the object is to be overwritten or extended.

### s.on('delete', cb)
This event fires with `cb(id)` where `id` is the item that has been deleted.

### s.on('deleteMany', cb)
This event fires with `cb(query)` where `query` is the query used to `deleteMany`.

### s.on('read', cb)
This event fires with `cb(id)` where `id` is the item that has been read.

### s.on('find', cb)
This event fires with `cb(query)` where `query` is the query used to `find`.

### s.on('findOne', cb)
This event fires with `cb(query)` where `query` is the query used to `findOne`.

### s.on('count', cb)
This event fires with `cb(query)` where `query` is the query used to `count`.

### s.on('error', cb)
This event fires with `cb(err)` where `err` is any error that may have occured.

## Credits
[Paul Serby](https://github.com/serby/) follow me on twitter [@serby](http://twitter.com/serby)
[Dom Harrington](https://github.com/domharrington/)

## Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
