// DataSet wrapper for data
module.exports.createDataSet = function(entityDelegate, data) {

  var counter = 0;

  function getNext() {
    if (counter === data.length) {
      return false;
    }
    return data[counter];
  }

  function forEach(callback) {
    data.forEach((function(value) {
      callback(value);
    }).bind(this));
  }

  function map(callback) {
    var response = [];
    data.forEach((function(value) {
      response.push(callback(value));
    }).bind(this));
    return response;
  }

  function toArray() {
    var response = [];
    data.forEach(function(value) {
      response.push(value);
    });
    return response;
  }

  function length() {
    return data.length;
  }

  function first() {
    return data[0];
  }

  return (
    { getNext: getNext
    , forEach: forEach
    , map: map
    , toArray: toArray
    , length: length
    , first: first
    });
};