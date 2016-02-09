var assert = require('assert')

module.exports = function(idProperty, getEngine) {

  describe('#read()', function () {

    it('should return undefined if no object is found with given id', function (done) {

      getEngine(function (error, engine) {
        engine.read('999', function (error, entity) {
          assert.equal(undefined, entity)
          done()
        })
      })
    })

    it('should emit a \'read\' event', function (done) {
      getEngine(function (error, engine) {
        engine.on('read', function (id) {
          assert.equal(id, '999')
          done()
        })
        engine.read('999', function () {
        })
      })
    })

    it('should return object if id is found', function (done) {

      var original = { a: 1 }

      getEngine(function (error, engine) {
        engine.create(original, function (error, entity) {

          engine.read(entity[idProperty], function (error, entity) {
            assert.equal(entity, entity)
            done()
          })
        })
      })
    })

    it('should emit a received event', function (done) {

      var original = { a: 1 }

      getEngine(function (error, engine) {
        engine.create(original, function (error, entity) {
          engine.on('received', function (data) {
            assert.deepEqual(data, entity)
            done()
          })
          engine.read(entity[idProperty], function (error, entity) {
            assert.deepEqual(entity, entity)
          })
        })
      })
    })

    it('should return id of type String', function (done) {

      var original = { a: 1 }

      getEngine(function (error, engine) {
        engine.create(original, function (error, entity) {

          engine.read(entity[idProperty], function (error, entity) {

            entity[idProperty].should.be.type('string')

            done()
          })
        })
      })
    })

    it('should return a clone of the object', function (done) {
      var original = { a: 1 }

      getEngine(function (error, engine) {
        engine.create(original, function (error, entity) {

          engine.read(entity[idProperty], function (error, entity) {

            entity.newProperty = true
            original.should.not.have.property('newProperty')

            done()
          })
        })
      })
    })

  })

}
