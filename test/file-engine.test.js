var fs = require('fs')

function getEngine(callback) {
  clearData()
  callback(undefined, require('../lib/file-engine')())
}


function clearData(file) {
  file = file || './save.json'
  // Create a empty data store for each test
  try {
    fs.unlinkSync(file)
  } catch (e) {
  }
}
require('./engine.tests')('_id', getEngine)

describe('file-engine', function () {

  it('should save to file in options', function (done) {
    var options = { filename: './data.json' }
      , engine = require('../lib/file-engine')(options)

    clearData(options.filename)
    engine.create({ a: 1 }, function () {
      var fileData = JSON.parse(fs.readFileSync(options.filename).toString())
      fileData.should.eql({ 1: { a: 1, _id: 1 } })
      done()
    })
  })

  it('should presist data between stores', function (done) {
    clearData()
    var engineOne = require('../lib/file-engine')()

    engineOne.create({ a: 1 }, function() {
      var engineTwo = require('../lib/file-engine')()
      engineTwo.find({}, function(error, data) {
        data.should.eql([{ _id: 1, a: 1 }])
        done()
      })
    })
  })

  it('should update data between stores', function (done) {
    clearData()
    var engineOne = require('../lib/file-engine')()

    engineOne.create({ a: 1 })
    engineOne.update({ _id: 1, a: 2 }, function () {
      var engineTwo = require('../lib/file-engine')()
      engineTwo.find({}, function (error, data) {
        data.should.eql([{ _id: 1, a: 2 }])
        done()
      })
    })
  })

  it('should delete data between stores', function (done) {
    clearData()
    var engineOne = require('../lib/file-engine')()

    engineOne.create({ a: 1 })
    engineOne['delete'](1, function () {
      var engineTwo = require('../lib/file-engine')()
      engineTwo.find({}, function (error, data) {
        data.should.eql({})
        done()
      })
    })
  })

  it('should delete many objects between stores', function (done) {
    clearData()
    var engineOne = require('../lib/file-engine')()

    engineOne.create({ a: 1 })
    engineOne.deleteMany({ _id: 1, a: 1 }, function () {
      var engineTwo = require('../lib/file-engine')()
      engineTwo.find({}, function (error, data) {
        data.should.eql({})
        done()
      })
    })
  })

})
