/**
 *
 */

var inherits = require('inherits');

var Model = require('../model');


var UserGroup = function(opts) {
    Model.call(this, 'UserGroup', opts);
};

inherits(UserGroup, Model);


UserGroup.prototype.setProperties = function(opts) {
    UserGroup.super_.prototype.setProperties.call(this, opts);
};


module.exports = UserGroup;
