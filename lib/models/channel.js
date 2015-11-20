/**
 * {@link https://api.slack.com/types/channel|Channel}
 */

var bind = require('lodash.bind');
var create = require('lodash.create');

var Model = require('./model');
var utils = require('./utils');


var USER_TYPING_TIMEOUT = 5000;


var Channel = function (opts) {
    Model.call(this, 'Channel', opts);
};


Channel.prototype = create(Model.prototype, {
    constructor: Channel
});


/**
 * An object, keyed on user id, values of timeouts that will be run to clear the user typing state.
 * @type {{}}
 * @private
 */
Channel.prototype._typing = {};


/**
 * The timeout after which the user typing entry should be removed.
 * @type {number}
 */
Channel.prototype.USER_TYPING_TIMEOUT = 5000;


Channel.prototype.setProperties = function (opts) {
    this.isChannel = opts['isChannel'];
    this.isGeneral = opts['isGeneral'];
    utils.setChannelGroupProperties(this, opts);
};


/**
 *
 * @param {Object} user
 */
Channel.prototype.startedTyping = function (userId) {
    if (this._typing[userId]) {
        clearTimeout(this._typing[userId])
    }

    this._typing[userId] = setTimeout(bind(function () {
        delete this._typing[userId];
        // TODO(leah): Emit an event or something in response to user typing changes?
    }, this), this.USER_TYPING_TIMEOUT);
};


module.exports = Channel;
