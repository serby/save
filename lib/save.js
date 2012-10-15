var _ = require('lodash')

module.exports = function(name, options) {

  var engine
    , defaults =
      { idProperty: '_id'
      , logger: { info: console.info, verbose: console.info }
      , engine: undefined
      }

  options = _.extend({}, defaults, options)

  // If no engine is passed then default to the memory engine.
  engine = options.engine || require('./memory-engine')(
    { idProperty: options.idProperty})

  engine.on('create', function(object) {
    options.logger.info('Creating \'' + name + '\'', object)
  })

  engine.on('update', function(object) {
    options.logger.info('Updating \'' + name + '\'', object)
  })

  engine.on('delete', function(query) {
    options.logger.info('Deleting \'' + name + '\'', query)
  })

  engine.on('deleteOne', function(object) {
    options.logger.info('Deleting One \'' + name + '\'', object)
  })

  engine.on('read', function(id) {
    options.logger.info('Reading \'' + name + '\'', id)
  })

  engine.on('find', function(query) {
    options.logger.info('Finding \'' + name + '\'', query)
  })

  engine.on('findOne', function(query) {
    options.logger.info('Finding One \'' + name + '\'', query)
  })

  engine.on('count', function(query) {
    options.logger.info('Count \'' + name + '\'', query)
  })

  engine.on('error', function(error) {
    options.logger.error('Error with \'' + name + '\'', error)
  })

  return engine
}