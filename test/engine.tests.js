var _ = require('lodash')
  , async = require('async')
  ;

function insertObjects(engine, objects, callback) {
  if (!Array.isArray(objects)) {
    objects = [objects];
  }
  async.map(objects, engine.create, callback);
}

module.exports = function(idProperty, getEngine) {

  describe('memory-engine', function() {

    describe('#create()', function() {

      it('should return the inserted entity with a new id', function(done) {
        getEngine(function(error, engine) {
          engine.create({ a:1 }, function(error, entity) {
            entity.should.have.property(idProperty);
            done();
          });
        });
      });

      it('should always create a unique id', function(done) {

        var n = 100
          , c = 1
          , ids = []
          ;

        function cb(error, entity) {

          if (c >= n) {
            _.uniq(ids).should.eql(ids);
            done();

          } else {
            ids.push(entity[idProperty]);
          }

          c += 1;
        }
        getEngine(function(error, engine) {
          for (var i = 0; i < n; i += 1) {
            engine.create({ a:1 }, cb);
          }
        });

      });

      it('should return the same object besides the id', function(done) {

        var original = { a:1 };

        getEngine(function(error, engine) {
          engine.create(original, function(error, entity) {

            delete entity[idProperty];

            original.should.eql(entity);

            done();
          });
        });
      });

      it('should override given id that is on the original object', function(done) {

        var original = {  a: 1 };
        original[idProperty] = 0;

        getEngine(function(error, engine) {
          engine.create(original, function(error, entity) {

            entity._id.should.not.equal(0);
            done();
          });
        });
      });

      it('should create a copy of the object before saving', function(done) {

        var item = { a: 1 };

        getEngine(function(error, engine) {
          insertObjects(engine, [item, item], function(error) {
            engine.find({}, {}, function(error, objects) {
              objects[0][idProperty].should.not.equal(objects[1][idProperty]);
              done();
            });
          });
        });
      });

    });


    describe('#read()', function() {

      it('should return undefined if no object is found with given id', function(done) {

        getEngine(function(error, engine) {
          engine.read('999', function(error, entity) {
            true.should.eql(entity === undefined);
            done();
          });
        });
      });

      it('should return object if id is found', function(done) {

        var original = { a: 1 };

        getEngine(function(error, engine) {
          engine.create(original, function(error, entity) {

            engine.read(1, function(error, entity) {
              entity.should.eql({_id:1, a:1 });
             done();
            });
          });
        });
      });

    });

    describe('#update()', function() {

      it('should return the full entity', function(done) {

        getEngine(function(error, engine) {
          engine.create({ a: 1 }, function(error, insertedObject) {
            engine.update(insertedObject, function(error, savedObject) {
              savedObject.should.eql(insertedObject);
              done();
            });
          });
        });
      });

      it('should error if there is no id property', function(done) {
        getEngine(function(error, engine) {
          engine.update({ a: 1 }, function(error, savedObject) {
            error.message.should.eql('Object has no \'' + idProperty + '\' property');
            done();
          });
        });
      });

      it('should error if there are no objects in the store with given id', function(done) {
        getEngine(function(error, engine) {
          var object = { a: 1 };
          object[idProperty] = 1;
          engine.update(object, function(error, savedObject) {
            error.message.should.eql('No object found with \'' + idProperty + '\' = \'1\'');
            done();
          });
        });
      });

      it('should overwrite original properties', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, { a: 1 }, function(error, objects) {
            var extraSet = { b: 2};
            extraSet[idProperty] = objects[0][idProperty];
            engine.update(extraSet, function(error, savedObject) {
              var compositeObject = _.extend({}, objects[0], extraSet);
              savedObject.should.eql(compositeObject);
            });

          });
          done();
        });
      });

    });

    describe('#deleteOne()', function() {

      it('should delete the entity', function(done) {
        getEngine(function(error, engine) {
          engine.create({ a: 1 }, function(error, insertedObject) {
            engine.deleteOne(insertedObject, function(error) {
              (error === undefined).should.equal(true);
              engine.find(insertedObject, {}, function(error, objects) {

                objects.should.be.empty;
                done();
              });
            });
          });
        });
      });

      it('should error if there is no id property', function(done) {
        getEngine(function(error, engine) {
          engine.deleteOne({ a: 1 }, function(error) {
            error.message.should.eql('Object has no \'' + idProperty + '\' property');
            done();
          });
        });
      });

      it('should error if there are no objects in the store with given id', function(done) {
        getEngine(function(error, engine) {
          var entity = { a: 1 };

          // Assigning an id that doesnt exist
          entity[idProperty] = 1;

          engine.deleteOne(entity, function(error) {
            error.message.should.equal('No object found with \'' + idProperty + '\' = \'1\'');
            done();
          });
        });
      });

    });

    describe('#delete()', function() {

      it('should delete the entity if the delete query matches', function(done) {
        getEngine(function(error, engine) {
          var objectToDelete = { a: 1 };
          insertObjects(engine, [objectToDelete, objectToDelete, { a:2 }, { b:1 }], function(error) {
            engine.delete(objectToDelete, function(error) {
              (error === null).should.eql(true);

              engine.find({}, {}, function(error, objects) {

                // Assert items have been deleted
                objects.length.should.equal(2);

                // Assert items returned arent deleted ones
                objects.forEach(function(object) {
                  object.should.not.equal(objectToDelete);
                });
                done();
              });
            });
          });
        });
      });

      it('should error if there are no objects to delete', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }], function(error) {
            engine.delete({ a: 5 }, function(error) {
              error.message.should.eql('No items to delete with that query');
              done();
            });
          });
        });
      });

    });

    describe('#find()', function() {

      it('should return empty array when no data matches query ', function(done) {
        getEngine(function(error, engine) {
          engine.find({ a: 1 }, {}, function(error, objects) {

            objects.should.be.empty;
            done();
          });
        });

      });

      it('should return array of objects for a single clause query that matches existing objects ', function(done) {

        getEngine(function(error, engine) {
          insertObjects(engine, { a:1 }, function(error) {
            engine.find({ a: 1 }, {}, function(error, objects) {
              objects.should.not.be.empty;
              objects[0].a.should.equal(1);
              done();
            });
          });
        });

      });

      it('should return array of objects that match all properties in query ', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a:1 }, { a:1 }, { a:1 }, { b:1 }], function(error) {
            engine.find({ a: 1 }, {}, function(error, objects) {
              objects.length.should.equal(3);
              done();
            });
          });
        });
      });

      it('should return array of all objects for an empty query {}', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a:1 }, { a:1 }, { a:1 }, { b:1 }], function(error) {
            engine.find({}, {}, function(error, objects) {
              objects.length.should.equal(4);
              done();
            });
          });
        });
      });

      it('should return array of objects in ascending order', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a:3 }, { a:1 }, { a:2 }], function(error) {
            engine.find({}, { $sort: { a: 1} }, function(error, objects) {
              objects[0].a.should.equal(1);
              objects[1].a.should.equal(2);
              objects[2].a.should.equal(3);
              done();
            });
          });
        });
      });

      it('should return array of objects in descending order', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a:3 }, { a:1 }, { a:2 }], function(error) {
            engine.find({}, { $sort: { a: -1 } }, function(error, objects) {
              objects[0].a.should.equal(3);
              objects[1].a.should.equal(2);
              objects[2].a.should.equal(1);
              done();
            });
          });
        });
      });

      it('should return array of objects in the order given by multiple properties', function(done) {
        //INCOMPLETE
        done();
      });

    });

    describe('#findOne()', function() {

      it('should return undefined when no data matches query ', function(done) {

        getEngine(function(error, engine) {
          engine.findOne({ a: 1 }, {}, function(error, object) {

            (object === undefined).should.equal(true);
            done();
          });
        });
      });

      it('should return an object for a single clause query that matches an existing object ', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, { a:1 }, function(error) {
            engine.findOne({ a: 1 }, {}, function(error, object) {
              object.a.should.equal(1);
              done();
            });
          });
        });
      });

      it('should only return the first of object when many objects match a query ', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a:3 }, { a:1 }, { a:2 }], function(error) {
            engine.findOne({}, { $sort: { a: 1} }, function(error, object) {
              object.a.should.equal(1);
              done();
            });
          });
        });
      });

    });

    describe('#count()', function() {

      it('should return 0 count if no objects match query', function(done) {
        getEngine(function(error, engine) {
          engine.count({}, function(error, count) {
            count.should.equal(0);
            done();
          });
        });
      });

      it('should return correct count if objects match query', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a:3 }, { a:1 }, { a:2 }, { a:2 }], function(error) {
            engine.count({ a:2 }, function(error, count) {
              count.should.equal(2);
              done();
            });
          });
        });
      });

      it('should return total count with a {} query', function(done) {
        getEngine(function(error, engine) {
          insertObjects(engine, [{ a:3 }, { a:1 }, { a:2 }, { a:2 }], function(error) {
            engine.count({}, function(error, count) {
              count.should.equal(4);
              done();
            });
          });
        });
      });

    });

  });

};