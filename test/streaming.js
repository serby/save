var assert = require('assert')
  , WriteStream = require('stream').WriteStream
  , ReadStream = require('stream').ReadStream
  , streamAssert = require('stream-assert')
  , map = require('async').map

module.exports = function(idProperty, getEngine) {

  describe('WriteStream', function () {

    it('should be a write stream', function (done) {

      getEngine(function (error, engine) {
        assert.ok(engine instanceof WriteStream, 'not a WriteStream')
        done()
      })
    })

    it('should create new documents when data is written', function (done) {

      getEngine(function (error, engine) {
        engine
        .pipe(streamAssert.first(function(data) {
            assert.equal(data, { a: 1 })
          }))
        .end(done)

        engine.write({ a: 1 })
      })
    })

    it('should update documents if data has a idProperty when written to stream', function (done) {

      getEngine(function (error, engine) {

        engine.create({ _id: 1, a: 1, }, function() {

          engine
            .pipe(streamAssert.first(function(data) {
                assert.equal(data, { _id: 1, a: 2 })
              }))
            .end(done)

        })

        engine.write({ _id: 1, a: 2 })
      })
    })

    it('should insert if idProperty is given but not found', function (done) {

      getEngine(function (error, engine) {

        engine
          .pipe(streamAssert.first(function(data) {
              assert.equal(data, { _id: 3, a: 2 })
            }))
          .end(done)

        engine.write({ _id: 3, a: 2 })
      })
    })
  })

  describe('ReadStream', function() {

    it('should return ReadStream if no callback is provided', function (done) {
      getEngine(function (error, engine) {
        assert.ok(engine.find({}) instanceof ReadStream, 'not a instance of Stream')
        done()
      })
    })

    it('should stream result data via ‘objectIdToString’ transformation', function (done) {

      getEngine(function (error, engine) {
        map([ { a: 1, b: 0 }, { a: 2, b: 0 } ], engine.create, function (error, documents) {
          var stream = engine.find({ b: 0 })
          stream
          .pipe(streamAssert.first(function(data) { assert.deepEqual(data, documents[0]) }))
          .pipe(streamAssert.second(function(data) { assert.deepEqual(data, documents[1]) }))
          .pipe(streamAssert.end(done))
        })
      })
    })

  })
}
