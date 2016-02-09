var async = require('async')

module.exports = function(idProperty, getEngine) {

  describe('#count()', function () {

    it('should return 0 count if no objects match query', function (done) {
      getEngine(function (error, engine) {
        engine.count({}, function (error, count) {
          count.should.equal(0)
          done()
        })
      })
    })

    it('should emit a \'count\' event', function (done) {
      getEngine(function (error, engine) {
        engine.on('count', function (entity) {
          entity.should.eql({ a: 1 })
          done()
        })

        engine.count({ a: 1 }, function () {
        })

      })
    })


    it('should emit a \'received\' event', function (done) {
      getEngine(function (error, engine) {
        engine.on('received', function (data) {
          data.should.eql(0)
          done()
        })

        engine.count({ a: 1 }, function () {
        })

      })
    })

    it('should return correct count if objects match query', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 3 }, { a: 1 }, { a: 2 }, { a: 2 } ], engine.create, function () {
          engine.count({ a: 2 }, function (error, count) {
            count.should.equal(2)
            done()
          })
        })
      })
    })

    it('should return total count with a {} query', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 3 }, { a: 1 }, { a: 2 }, { a: 2 } ], engine.create, function () {
          engine.count({}, function (error, count) {
            count.should.equal(4)
            done()
          })
        })
      })
    })
  })
}
