/**
 * {@link https://api.slack.com/types/group|Group}
 */

var create = require('lodash.create');

var BaseChannel = require('./base-channel');


var Group = function (opts) {
    BaseChannel.call(this, 'Group', opts);
};


Group.prototype = create(BaseChannel.prototype, {
    constructor: Group,
    parent: BaseChannel.prototype
});


Group.prototype.setProperties = function (opts) {
    this.parent.setProperties.call(this, opts);

    this.isGroup = opts['is_group'];
};


module.exports = Group;
