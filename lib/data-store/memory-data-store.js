/**
 * In memory data store for caching information from the Slack API.
 */

var create = require('lodash.create');
var forEach = require('lodash.foreach');
var keys = require('lodash.keys');
var union = require('lodash.union');

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
var SlackMemoryDataStore = function(options) {
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


/**
 * Stores the presence state for known users.
 * @type {{}}
 */
SlackMemoryDataStore.prototype.userPresence = {};


/** @inheritdoc */
SlackMemoryDataStore.prototype.clear = function() {
  this.self = null;
  this.team = null;
  this.users = {};
  this.channels = {};
  this.ims = {};
  this.groups = {};
  this.bots = {};

  forEach(this._indices, function(objectIndex) {
    forEach(keys(objectIndex), function(fieldName) {
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
SlackMemoryDataStore.prototype._addIndex = function(index) {
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
SlackMemoryDataStore.prototype._lookupByIndex = function(index, lookup) {
  var indexBits = index.split('.');
  var dataObject = this[indexBits[0]] || {};
  var index = (this._indices[indexBits[0]] || {})[indexBits[1]];
  return dataObject[index[lookup]];
};


/** @inheritdoc */
SlackDataStore.prototype.getUserByID = function(userId) {
  return this.users[userId];
};


/** @inheritdoc */
SlackDataStore.prototype.getUserByName = function(name) {
  return this._lookupByIndex('users.name', name);
};


/** @inheritdoc */
SlackDataStore.prototype.getUserByEmail = function(email) {
  return this._lookupByIndex('users.email', email);
};


/** @inheritdoc */
SlackDataStore.prototype.getChannelByID = function(channelId) {
  return this.channels[channelId];
};


/** @inheritdoc */
SlackDataStore.prototype.getChannelByName = function(name) {
  return this._lookupByIndex('channels.name', name);
};


/** @inheritdoc */
SlackDataStore.prototype.getGroupByID = function(groupId) {
  return this.groups[groupId];
};


/** @inheritdoc */
SlackDataStore.prototype.getGroupByName = function(name) {
  return this._lookupByIndex('groups.name', name);
};


/** @inheritdoc */
SlackDataStore.prototype.getDMByID = function(dmID) {
  return this.dms[dmID];
};


/** @inheritdoc */
SlackDataStore.prototype.getBotById = function(botId) {
  return this.bots[botId];
};


/** @inheritdoc */
SlackDataStore.prototype.getBotByName = function(name) {
  return this._lookupByIndex('bots.name', name);
};


/**
 * Returns the unread count for all objects: channels, groups etc.
 */
SlackDataStore.prototype.getUnreadCount = function() {
};


// ###############################################
// Setters
// ###############################################


SlackDataStore.prototype._setValue = function(target, val) {
  var dataObj = this[target];
  dataObj[val.id] = val;

  forEach(this._indices[target], function(index, fieldName) {
    index[val[fieldName]] = val.id;
  });
};


/** @inheritdoc */
SlackDataStore.prototype.setChannel = function(channel) {
  this._setValue('channels', channel);
};


/** @inheritdoc */
SlackDataStore.prototype.setGroup = function(group) {
  this._setValue('groups', group);
};


/** @inheritdoc */
SlackDataStore.prototype.setDM = function(dm) {
  this._setValue('dms', dm);
};


/** @inheritdoc */
SlackDataStore.prototype.setUser = function(user) {
  this._setValue('users', user);
};


/** @inheritdoc */
SlackDataStore.prototype.setBot = function(bot) {
  this._setValue('bots', bot);
};


/**
 * Sets the presence status for a user.
 * @param {Object} user The user to set the presence for.
 * @param {string} presence The presence status to set for the user.
 */
SlackDataStore.prototype.setUserPresence = function(user, presence) {
};

module.exports = SlackMemoryDataStore;
