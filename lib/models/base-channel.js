/**
 *
 */

var bind = require('lodash.bind');
var create = require('lodash.create');
var forEachRight = require('lodash.foreachright');
var findLastIndex = require('lodash.findlastindex');
var keys = require('lodash.keys');

var InfoValue = require('./info-value');
var Message = require('./message');
var Model = require('./model');


var BaseChannel = function (objectName, opts) {

    /**
     *
     * @type {Array}
     */
    this.history = [];

    /**
     *
     * @type {string}
     * @private
     */
    this._maxTs = '0';

    /**
     * An object, keyed on user id, values of timeouts that will be run to clear the user typing state.
     * @type {{}}
     * @private
     */
    this._typing = {};

    Model.call(this, objectName, opts);
};


BaseChannel.prototype = create(Model.prototype, {
    constructor: BaseChannel
});


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
    this._maxTs = this.latest.ts;

    this.unreadCount = opts['unreadCount'];
    this.unreadCountDisplay = opts['unreadCountDisplay'];

    // TODO(leah): Model coercion?
    if (opts.latest) {
        this.addMessage(opts.latest);
    }
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


/**
 * Returns the string form of the channel type.
 * @return {string}
 */
BaseChannel.prototype.getType = function () {
    return this._modelName.toLowerCase();
};


/**
 * Returns an array of user ids for all users who are currently typing.
 * @return {Array.<string>}
 */
BaseChannel.prototype.getTypingUsers = function() {
    return keys(this._typing);
};


/**
 *
 * @param {Object} message
 */
BaseChannel.prototype.addMessage = function(message) {

    // TODO(leah): Do a reverse walk of this and compare the timestamps as an extra guarantee?
    this.history.push(message);
    this._maxTs = message.ts;

    //switch(message.subtype) {
    //    default:
    //        //@_client.logger.debug "Unknown message subtype: %s", message.subtype
    //        //@_history[message.ts] = message
    //}

    //if message.ts and not message.hidden and @latest? and @latest.ts? and message.ts > @latest.ts
    //  @unread_count++
    //  @latest = message
    //
    //if @_client.autoMark then @mark message.ts
};


BaseChannel.prototype.updateMessage = function(messageUpdatedMsg) {
    var message = messageUpdatedMsg.message;
    var msgIndex = findLastIndex(this.history, 'ts', message.ts);
    if (msgIndex !== -1) {
        this.history[msgIndex] = message;
    }
};


module.exports = BaseChannel;
