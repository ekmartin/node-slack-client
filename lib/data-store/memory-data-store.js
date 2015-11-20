/**
 * In memory data store for caching information from the Slack API.
 */

var create = require('lodash.create');
var forEach = require('lodash.foreach');
var keys = require('lodash.keys');

var SlackDataStore = require('./data-store');
var models = require('../models');


var DEFAULT_INDICES = [
    'users.name', 'users.email', 'channels.name', 'groups.name', 'dms.name', 'bots.name'
];


/**
 *
 * @param {Object=} options
 * @param {Array} options.indices The indices to use for this data store. An index is defined by passing `object.fieldName`, e.g. `group.name`, it's important to note, that the fieldName should be that used by the model and not the raw name from the API.
 * @constructor
 */
var SlackMemoryDataStore = function (options) {
    options = options || {};
    SlackDataStore.call(this, options);

    forEach(DEFAULT_INDICES, this._addIndex, this);
    forEach(options.indices || [], this._addIndex, this);
};


SlackMemoryDataStore.prototype = create(SlackDataStore.prototype, {
    constructor: SlackMemoryDataStore
});


/**
 *
 * @type {{}}
 * @private
 */
SlackMemoryDataStore.prototype._indices = {};


/**
 *
 * @type {Object}
 */
SlackMemoryDataStore.prototype.users = {};


/**
 *
 * @type {Object}
 */
SlackMemoryDataStore.prototype.channels = {};


/**
 *
 * @type {Object}
 */
SlackMemoryDataStore.prototype.dms = {};


/**
 *
 * @type {Object}
 */
SlackMemoryDataStore.prototype.groups = {};


/**
 *
 * @type {Object}
 */
SlackMemoryDataStore.prototype.bots = {};


/** @inheritdoc */
SlackMemoryDataStore.prototype.clear = function () {
    this.users = {};
    this.channels = {};
    this.ims = {};
    this.groups = {};
    this.bots = {};
    this.teams = {};

    forEach(this._indices, function (objectIndex) {
        forEach(keys(objectIndex), function (fieldName) {
            objectIndex[fieldName] = {};
        });
    });
};


/**
 *
 * @param index
 * @returns {*}
 * @private
 */
SlackMemoryDataStore.prototype._addIndex = function (index) {
    var indexBits = index.split('.');
    if (indexBits.length > 2) {
        throw new Error('All indices must have at most a target, e.g. group, and field, e.g. name');
    }

    if (!this._indices[indexBits[0]]) {
        this._indices[indexBits[0]] = {};
    }
    this._indices[indexBits[0]][indexBits[1]] = {};
};


/**
 *
 * @param index
 * @returns {*}
 * @private
 */
SlackMemoryDataStore.prototype._lookupByIndex = function (index, lookup) {
    var indexBits = index.split('.');
    var dataObject = this[indexBits[0]] || {};
    var index = (this._indices[indexBits[0]] || {})[indexBits[1]];
    return dataObject[index[lookup]];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getUserByID = function (userId) {
    return this.users[userId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getUserByName = function (name) {
    return this._lookupByIndex('users.name', name);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getUserByEmail = function (email) {
    return this._lookupByIndex('users.email', email);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getChannelByID = function (channelId) {
    return this.channels[channelId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getChannelByName = function (name) {
    return this._lookupByIndex('channels.name', name);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getGroupByID = function (groupId) {
    return this.groups[groupId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getGroupByName = function (name) {
    return this._lookupByIndex('groups.name', name);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getDMByID = function (dmID) {
    return this.dms[dmID];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getBotById = function (botId) {
    return this.bots[botId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.getBotByName = function (name) {
    return this._lookupByIndex('bots.name', name);
};


/**
 * Returns the unread count for all objects: channels, groups etc.
 */
SlackMemoryDataStore.prototype.getUnreadCount = function () {
};


// ###############################################
// Setters
// ###############################################


SlackMemoryDataStore.prototype._setValue = function (target, val) {
    var dataObj = this[target];
    dataObj[val.id] = val;

    forEach(this._indices[target], function (index, fieldName) {
        index[val[fieldName]] = val.id;
    });
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.setChannel = function (channel) {
    this._setValue('channels', channel);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.setGroup = function (group) {
    this._setValue('groups', group);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.setDM = function (dm) {
    this._setValue('dms', dm);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.setUser = function (user) {
    this._setValue('users', user);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.setBot = function (bot) {
    this._setValue('bots', bot);
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.setTeam = function (team) {
    this._setValue('teams', team);
};


// ###############################################
// Deletion methods
// ###############################################


/** @inheritdoc */
SlackMemoryDataStore.prototype.removeChannel = function (channelId) {
    delete this.channels[channelId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.removeGroup = function (groupId) {
    delete this.groups[groupId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.removeDM = function (dmId) {
    delete this.dms[dmId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.removeUser = function (userId) {
    delete this.users[userId];
};


/** @inheritdoc */
SlackMemoryDataStore.prototype.removeBot = function (botId) {
    delete this.bots[botId];
};

module.exports = SlackMemoryDataStore;
