/**
 *
 */

var inherits = require('inherits');

var Model = require('../model');


var User = function (opts) {
    Model.call(this, 'User', opts);
};

inherits(User, Model);


User.prototype.setProperties = function (opts) {
    User.super_.prototype.setProperties.call(this, opts);

    this.id = opts['id'];
    this.name = opts['name'];
    this.prefs = {};
    this.profile = opts.profile;
    this.presence = opts.presence || 'active';
};


module.exports = User;
