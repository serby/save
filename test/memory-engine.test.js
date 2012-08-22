var _ = require('lodash')
  , async = require('async')
  , idProperty = '_id'
  ;

function getEngine(callback) {
  callback(undefined, require('../lib/memory-engine')());
}

require('./engine.tests')('_id', getEngine);