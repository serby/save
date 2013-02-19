module.exports = function (options) {

  options = options || {}
  options.filename = options.filename || './save.json'

  var data = {}
    , fs = require('fs')

  if (fs.existsSync(options.filename)) {
    var fileData = fs.readFileSync(options.filename)
    data = JSON.parse(fileData.toString())
  }

  options.data = data

  var memEngine = require('../lib/memory-engine')(options)

  function saveToJson(newObject, cb) {
    fs.writeFileSync(options.filename, JSON.stringify(memEngine.getData()))
    if (typeof cb === 'function') {
      cb()
    }
  }

  memEngine.on('afterCreate', saveToJson)

  memEngine.on('afterUpdate', saveToJson)

  memEngine.on('afterDelete', saveToJson)

  memEngine.on('afterDeleteMany', saveToJson)

  return memEngine
}
