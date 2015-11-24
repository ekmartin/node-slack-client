/**
 *
 */

var create = require('lodash.create');

var Model = require('./model');


var User = function (opts) {
    Model.call(this, 'User', opts);
};


User.prototype = create(Model.prototype, {
    constructor: User
});


User.prototype.setProperties = function (opts) {
    this.id = opts['id'];
    this.name = opts['name'];
    this.prefs = {};
    this.profile = opts.profile;
    this.presence = opts.presence || 'active';
};


module.exports = User;
