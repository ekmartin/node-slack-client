/**
 * {@link https://api.slack.com/types/group|Group}
 */

var create = require('lodash.create');

var Model = require('./model');
var utils = require('./utils');


var Group = function (opts) {
    Model.call(this, 'Group', opts);
};


Group.prototype = create(Model.prototype, {
    constructor: Group
});


Group.prototype.setProperties = function (opts) {
    this.isGroup = opts['is_group'];
    utils.setChannelGroupProperties(this, opts);
};


module.exports = Group;
