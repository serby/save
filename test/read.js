var should = require('should')

module.exports = function(idProperty, getEngine) {

  describe('#read()', function () {

    it('should return undefined if no object is found with given id', function (done) {

      getEngine(function (error, engine) {
        engine.read('999', function (error, entity) {

          should.not.exist(entity)
          should.strictEqual(undefined, entity)
          done()
        })
      })
    })

    it('should emit a \'read\' event', function (done) {
      getEngine(function (error, engine) {
        engine.on('read', function (id) {
          id.should.eql('999')
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
            entity.should.eql(entity)
            done()
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

  })

}
