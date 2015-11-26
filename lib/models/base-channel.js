/**
 *
 */

var bind = require('lodash.bind');
var create = require('lodash.create');
var forEachRight = require('lodash.foreachright');
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
     * @type {{}}
     * @private
     */
    this._historyIndexByTs = {};

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
    this.addMessage(opts.latest);
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


BaseChannel.prototype.addMessage = function(message) {

    ///**
    // *
    // * @param index
    // * @returns {*}
    // * @private
    // */
    //SlackMemoryDataStore.prototype._addIndex = function (index) {
    //    var indexBits = index.split('.');
    //    if (indexBits.length > 2) {
    //        throw new Error('All indices must have at most a target, e.g. group, and field, e.g. name');
    //    }
    //
    //    if (!this._indices[indexBits[0]]) {
    //        this._indices[indexBits[0]] = {};
    //    }
    //    this._indices[indexBits[0]][indexBits[1]] = {};
    //};

    // TODO(leah): Do a reverse walk of this and compare the timestamps as an extra guarantee?
    this.history.push(message);

    //var subtype = message.subtype;
    //
    //switch(message.subtype) {
    //    case MESSAGE_SUBTYPES.MESSAGE_DELETED:
    //        // delete the message from history
    //    case MESSAGE_SUBTYPES.CHANNEL_TOPIC:
    //    case MESSAGE_SUBTYPES.GROUP_TOPIC:
    //        // update the topic
    //    case MESSAGE_SUBTYPES.CHANNEL_PURPOSE:
    //    case MESSAGE_SUBTYPES.GROUP_PURPOSE:
    //        // update the purpose
    //    case MESSAGE_SUBTYPES.CHANNEL_NAME:
    //    case MESSAGE_SUBTYPES.GROUP_NAME:
    //        // update the name
    //    case MESSAGE_SUBTYPES.BOT_MESSAGE:
    //        // do something here?
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


module.exports = BaseChannel;
