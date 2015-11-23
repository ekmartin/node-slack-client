/**
 *
 */

var bind = require('lodash.bind');
var create = require('lodash.create');
var forEachRight = require('lodash.foreachright');

var InfoValue = require('./info-value');
var Message = require('./message');
var Model = require('./model');


var BaseChannel = function (objectName, opts) {
    Model.call(this, objectName, opts);
};


BaseChannel.prototype = create(Model.prototype, {
    constructor: BaseChannel
});


/**
 *
 * @type {Array}
 */
BaseChannel.prototype.history = [];


/**
 * An object, keyed on user id, values of timeouts that will be run to clear the user typing state.
 * @type {{}}
 * @private
 */
BaseChannel.prototype._typing = {};


/**
 * The timeout after which the user typing entry should be removed.
 * @type {number}
 */
BaseChannel.prototype.USER_TYPING_TIMEOUT = 5000;


/** @inheritdoc */
BaseChannel.prototype.setProperties = function(opts) {
    this.id = opts['id'];
    this.name = opts['name'];
    this.created = opts['created'];
    this.creator = opts['creator'];
    this.isArchived = opts['isArchived'];
    this.members = opts['members'];
    this.topic = new InfoValue(opts['topic']);
    this.purpose = new InfoValue(opts['purpose']);
    this.lastRead = opts['lastRead'];
    this.latest = new Message(opts['latest']);
    this.unreadCount = opts['unreadCount'];
    this.unreadCountDisplay = opts['unreadCountDisplay'];
};


/**
 *
 * @param {Object} user
 */
BaseChannel.prototype.startedTyping = function (userId) {
    if (this._typing[userId]) {
        clearTimeout(this._typing[userId])
    }

    this._typing[userId] = setTimeout(bind(function () {
        delete this._typing[userId];
        // TODO(leah): Emit an event or something in response to user typing changes?
    }, this), this.USER_TYPING_TIMEOUT);
};


/**
 *
 * @returns {number}
 */
BaseChannel.prototype.recalcUnreads = function() {
    this.unreadCount = 0;
    forEachRight(this.history, function(message) {
        if (message.ts > this.lastRead) {
            this.unreadCount++;
        } else {
            return false;
        }
    }, this);

    return this.unreadCount;
};


module.exports = BaseChannel;


