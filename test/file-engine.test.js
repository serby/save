var fs = require('fs')

function getEngine(callback) {
  clearData()
  callback(undefined, require('../lib/file-engine')())
}


function clearData() {
  // Create a empty data store for each test
  try {
    fs.unlinkSync('./save.json')
  } catch (e) {
  }
}
require('./engine.tests')('_id', getEngine)

describe('file-engine', function () {
  it('should presist data between stores', function (done) {
    clearData()
    var engineOne = require('../lib/file-engine')()

    engineOne.create({a:1}, function() {
      var engineTwo = require('../lib/file-engine')()
      engineTwo.find({}, function(error, data) {
        data.should.eql([{ _id: 1, a: 1 }])
        done()
      })
    })
  })
})
