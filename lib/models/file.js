/**
 *
 */

var create = require('lodash.create');

var Model = require('./model');


var File = function(opts) {
  Model.call(this, 'File', opts);
};


File.prototype = create(Model.prototype, {
  constructor: File
});


File.prototype.setProperties = function(opts) {
  this.id = opts['id'];
};


module.exports = File;
