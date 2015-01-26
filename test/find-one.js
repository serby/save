var async = require('async')
  , should = require('should')

module.exports = function(idProperty, getEngine) {

  describe('#findOne()', function () {

    it('should return undefined when no data matches query ', function (done) {

      getEngine(function (error, engine) {
        engine.findOne({ a: 1 }, function (error, object) {
          should.not.exist(object)
          done()
        })
      })
    })

    it('should emit a \'findOne\' event', function (done) {
      getEngine(function (error, engine) {
        engine.on('findOne', function (entity) {
          entity.should.eql({ a: 1 })
          done()
        })

        engine.findOne({ a: 1 }, function () {
        })

      })
    })

    it('should return id of type string', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 3 } ], engine.create, function () {
          engine.findOne({}, function (error, object) {
            object[idProperty].should.be.type('string')
            done()
          })
        })
      })
    })

    it('should return an object for a single clause query that matches an existing object ', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 1 } ], engine.create, function () {
          engine.findOne({ a: 1 }, function (error, object) {
            object.a.should.equal(1)
            done()
          })
        })
      })
    })

    it('should use options to shape results', function (done) {
      getEngine(function (error, engine) {
        async.map([ { a: 3 }, { a: 1 }, { a: 2 } ], engine.create, function () {
          engine.findOne({}, { sort: { a: 1 } }, function (error, object) {
            object.a.should.equal(1)
            done()
          })
        })
      })
    })
  })
}
