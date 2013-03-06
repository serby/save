describe('#data', function () {

  it('should return a empty object if no options set', function () {
    var engine = require('../lib/memory-engine')()
    engine.getData().should.eql({})
  })

  it('should return object when data options are passed', function () {
    var data = { a: 1 }
      , engine = require('../lib/memory-engine')({ data: data })
    engine.getData().should.eql({ a: 1 })
  })

})
