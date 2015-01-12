module.exports = function(idProperty, getEngine) {

  describe('#delete()', function () {

    it('should delete the entity', function (done) {
      getEngine(function (error, engine) {
        engine.create({ a: 1 }, function (error, insertedObject) {
          engine.delete(insertedObject[idProperty], function (error) {
            (error === undefined).should.equal(true)
            engine.find(insertedObject, {}, function (error, objects) {

              objects.length.should.eql(0)
              done()
            })
          })
        })
      })
    })

    it('should emit a \'delete\' event', function (done) {
      getEngine(function (error, engine) {
        engine.create({ a: 1 }, function (error, insertedObject) {
          engine.on('delete', function (entity) {
            entity.should.eql(insertedObject[idProperty])
            done()
          })
          engine.delete(insertedObject[idProperty])
        })
      })
    })

    it('should emit a \'afterDelete\' event', function (done) {
      getEngine(function (error, engine) {
        engine.create({ a: 1 }, function (error, insertedObject) {
          engine.on('afterDelete', function (entity) {
            entity.should.eql(insertedObject[idProperty])
            done()
          })
          engine.delete(insertedObject[idProperty])
        })
      })
    })

    it('should allow no callback', function () {
      getEngine(function (error, engine) {
        (function () {
          engine.delete(1)
        }).should.not.throwError()
      })
    })

    it('should throw TypeError if callback is not a function', function () {
      getEngine(function (error, engine) {
        (function () {
          engine.delete(1, {})
        }).should.throwError('callback must be a function or empty')
      })
    })
  })
}
