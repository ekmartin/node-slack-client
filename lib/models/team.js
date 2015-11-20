/**
 *
 */

var create = require('lodash.create');

var Model = require('./model');


var Team = function (opts) {
    Model.call(this, 'Team', opts);
};


Team.prototype = create(Model.prototype, {
    constructor: Team
});


Team.prototype.setProperties = function (opts) {
    this.id = opts['id'];
    this.name = opts['name'];
};


module.exports = Team;
