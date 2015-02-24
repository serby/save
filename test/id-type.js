var assert = require('assert')

module.exports = function(idProperty, getEngine) {

  describe('#idType()', function () {
    it('should return a function', function (done) {
      getEngine(function (error, engine) {
        assert.equal(typeof engine.idType, 'function')
        done()
      })
    })
  })

}
