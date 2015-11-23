/**
 * {@link https://api.slack.com/types/channel|Channel}
 */

var bind = require('lodash.bind');
var create = require('lodash.create');

var BaseChannel = require('./base-channel');


var Channel = function (opts) {
    BaseChannel.call(this, 'Channel', opts);
};


Channel.prototype = create(BaseChannel.prototype, {
    constructor: Channel,
    parent: BaseChannel.prototype
});


Channel.prototype.setProperties = function (opts) {
    this.parent.setProperties.call(this, opts);

    this.isChannel = opts['isChannel'];
    this.isGeneral = opts['isGeneral'];
};


module.exports = Channel;
