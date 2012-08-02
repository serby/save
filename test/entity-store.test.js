var _ = require('lodash')
  , async = require('async')
  , validation = require('piton-validity').validation
  , idProperty = '_id'
  , schema =
    { a: {
      validators: {
        all: [validation.required]
      }
    }
    , b: {}
    }
  , schema =  require('schemata')(schema)
  , emptyFn = function() {}
  , logger =
    { info: emptyFn
    , log: emptyFn
    , silly: emptyFn
    }
  ;

function getSchema(options) {
  return require('../lib/entity-store')('contact', schema, { logger: logger });
}

describe('entity-store', function() {

  it('should error if an invalid entityDelegate is passed', function() {
    //(error !== undefined).should.be.true;
  });

  describe('#create()', function() {

    it('should return the inserted entity with a new id', function(done) {

      getSchema().create({ a:1, b: 2 }, function(error, storedEntity) {

        storedEntity.should.have.property(idProperty);
        done();

      });

    });


    it('should remove any additional property in the passed object', function(done) {
      getSchema().create({ a:1, b: 2, c: 3 }, function(error, storedEntity) {

        storedEntity.should.not.have.property('c');
        done();

      });
    });

    it('should return validation error if validate fails', function(done) {
      getSchema().create({ b: 2 }, function(error, storedEntity) {

        error.should.be.an.instanceOf(Error);
        error.errors.a.should.equal('A is required');
        done();

      });
    });
  });

});