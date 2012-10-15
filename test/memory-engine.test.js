function getEngine(callback) {
  callback(undefined, require('../lib/memory-engine')())
}

require('./engine.tests')('_id', getEngine)