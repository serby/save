var assert = require('assert')
  , Stream = require('stream').Stream
  , streamAssert = require('stream-assert')
  , mapSeries = require('async').mapSeries

module.exports = function(idProperty, getEngine) {

  describe('WriteStream', function () {

    it('should be a write stream', function (done) {

      getEngine(function (error, engine) {
        assert.ok(engine instanceof Stream, 'not a Stream')
        done()
      })
    })

    it('should create new documents when data is written', function (done) {

      getEngine(function (error, engine) {
        engine
        .pipe(streamAssert.first(function(data) {
            assert.deepEqual(data.a, 1)
          }))
        .pipe(streamAssert.end(done))

        engine.write({ a: 1 })
        engine.end()
      })
    })

    it('should update documents if data has a idProperty when written to stream', function (done) {

      getEngine(function (error, engine) {

        engine.create({ a: 1, }, function(err, existingEntity) {

          engine
            .pipe(streamAssert.first(function(data) {
                assert.equal(data.a, 2)
                assert.equal(existingEntity._id, data._id)
              }))
            .pipe(streamAssert.end(done))

            engine.write({ _id: existingEntity._id, a: 2 })
            engine.end()
        })
      })
    })

    it('should insert if idProperty is given but not found', function (done) {

      getEngine(function (error, engine) {

        engine
          .pipe(streamAssert.first(function(data) {
              assert.equal(data.a, 2)
            }))
          .pipe(streamAssert.end(done))

        engine.write({ _id: 1, a: 2 })
        engine.end()
      })
    })
  })

  describe('ReadStream', function() {

    it('should return ReadStream if no callback is provided', function (done) {
      getEngine(function (error, engine) {
        assert.ok(engine.find({}) instanceof Stream, 'not a instance of Stream')
        done()
      })
    })

    it('should stream result data via ‘objectIdToString’ transformation', function (done) {

      getEngine(function (error, engine) {
        mapSeries([ { a: 1, b: 0 }, { a: 2, b: 0 } ], engine.create, function (error, documents) {
          var stream = engine.find({ b: 0 })
          stream
          .pipe(streamAssert.first(function(data) { assert.deepEqual(data, documents[0]) }))
          .pipe(streamAssert.second(function(data) { assert.deepEqual(data, documents[1]) }))
          .pipe(streamAssert.end(done))
        })
      })
    })

    it('should emit `received`', function (done) {

      getEngine(function (error, engine) {
        mapSeries([ { a: 1, b: 0 }, { a: 2, b: 0 } ], engine.create, function (error, documents) {
          var receivedData = []
          engine.on('received', function (data) {
            receivedData.push(data)
            if (data.length === 2) {
              done()
            } else if (data.length > 2) {
               done(new Error('Too many events emitted'))
            }
          })
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
