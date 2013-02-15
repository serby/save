var fs = require('fs')

module.exports = function () {

  var data = {}
    , filename = '../data/memory.json'

  if (fs.existsSync(filename)) {
    data = JSON.parse(fs.readFile(filename))
  }

  var memEngine = require('../lib/memory-engine')({ data: data })

  memEngine.on('afterCreate', function () {
    fs.writeFile(filename, JSON.stringify(memEngine.getData()), function (err) {
      if (err) {
        throw new Error('Error  to file: ' + err)
      }
    })
  })

  memEngine.on('afterUpdate', function () {
    fs.writeFile(filename, JSON.stringify(memEngine.getData()), function (err) {
      if (err) {
        throw new Error('Error writing to file: ' + err)
      }
    })
  })

  memEngine.on('afterDelete', function () {
    fs.writeFile(filename, JSON.stringify(memEngine.getData()), function (err) {
      if (err) {
        throw new Error('Error writing to file: ' + err)
      }
    })
  })

  memEngine.on('afterDeleteMany', function () {
    fs.writeFile(filename, JSON.stringify(memEngine.getData()), function (err) {
      if (err) {
        throw new Error('Error writing to file: ' + err)
      }
    })
  })

}
