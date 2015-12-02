/**
 *
 */

var inherits = require('inherits');

var Model = require('../model');


var File = function (opts) {
    Model.call(this, 'File', opts);
};

inherits(File, Model);


File.prototype.setProperties = function (opts) {
    File.super_.prototype.setProperties.call(this, opts);

    this.id = opts['id'];
};


module.exports = File;
