/**
 *
 */

var forEach = require('lodash.foreach');
var models = require('../models');


var SlackDataStore = function() {

};


/**
 *
 */
SlackDataStore.prototype.registerCallbacks = function() {

};


/**
 * The user whose token is used to make API calls.
 * @type {Object}
 */
SlackDataStore.prototype.self = null;


/**
 * The team the client is connected to.
 * @type {Object}
 */
SlackDataStore.prototype.team = null;


/**
 *
 * @type {Object}
 */
SlackDataStore.prototype.users = {};


/**
 *
 * @type {Object}
 */
SlackDataStore.prototype.channels = {};


/**
 *
 * @type {Object}
 */
SlackDataStore.prototype.dms = {};


/**
 *
 * @type {Object}
 */
SlackDataStore.prototype.groups = {};


/**
 *
 * @type {Object}
 */
SlackDataStore.prototype.bots = {};


/**
 * Stores the presence state for known users.
 * @type {{}}
 */
SlackDataStore.prototype.userPresence = {};


SlackDataStore.prototype.clear = function() {
  this.self = null;
  this.team = null;
  this.users = {};
  this.channels = {};
  this.ims = {};
  this.groups = {};
  this.bots = {};
};


SlackDataStore.prototype._storeObjects = function(source, target, modelClass) {
  forEach(source, function(obj) {
    target[obj.id] = new modelClass(obj);
  }, this);
};


// ###############################################
// Getters
// ###############################################

SlackDataStore.prototype.getItemByProperty = function(val, key, obj) {
  var target = undefined;
  forEach(obj, function(item) {
    if (item[key] === val) {
      target = item;
      return false;
    }
  });

  return target;
};


SlackDataStore.prototype.getUserByID = function(userId) {
  return this.users[userId];
};


SlackDataStore.prototype.getUserByName = function(name) {
  return this.getItemByProperty(name, 'name', this.users);
};


SlackDataStore.prototype.getUserByEmail = function(email) {
  return this.getItemByProperty(email, 'email', this.users);
};


SlackDataStore.prototype.getChannelByID = function(channelId) {
  return this.channels[channelId];
};


SlackDataStore.prototype.getChannelByName = function(name) {
  name = name.replace(/^#/g, '');
  return this.getItemByProperty(name, 'name', this.channels);
};


SlackDataStore.prototype.getGroupByID = function(groupId) {
  return this.groups[groupId];
};


SlackDataStore.prototype.getGroupByName = function(name) {
  return this.getItemByProperty(name, 'name', this.groups);
};


SlackDataStore.prototype.getIMByID = function(imID) {
  return this.ims[imID];
};


SlackDataStore.prototype.getIMByName = function(name) {
  return this.getItemByProperty(name, 'name', this.ims);
};



SlackDataStore.prototype.getChannelGroupOrIMByID = function(objId) {
  var firstChar = objId.substring(0, 1);

  if (firstChar === 'C') {
    return this.getChannelByID(objId);
  } else if (firstChar === 'G') {
    return this.getGroupByID(objId);
  } else if (firstChar === 'D') {
    return this.getIMByID(objId);
  }

};


SlackDataStore.prototype.getChannelGroupOrDMByName = function(name) {
  var channel = this.getChannelByName(name);
  if (!channel) {
    var group = this.getGroupByName(name);
    if (!group) {
      return this.getIMByName(name);
    }
    return group;
  }
  return channel;
};


SlackDataStore.prototype.getUnreadCount = function() {

};


SlackDataStore.prototype.getChannelsWithUnreads = function() {
  // NOTE: the original method got everything with unreads (grpups, IMs etc.)
};


// ###############################################
// Setters
// ###############################################


/**
 * Sets the presence status for a user.
 */
SlackDataStore.prototype.setUserPresence = function(user, presence) {
  this.userPresence[user] = presence;
};


// ###############################################
// RTM API Event handlers
// ###############################################


SlackDataStore.prototype.cacheRtmStart = function(data) {
  this.clear();

  this.self = new models.User(data['self']);
  this.team = new models.Team(data['team']);
  this._storeObjects(data['users'], this.users, models.User);
  this._storeObjects(data['channels'], this.channels, models.Channel);
  this._storeObjects(data['ims'], this.ims, models.DM);
  this._storeObjects(data['groups'], this.groups, models.Group);
  this._storeObjects(data['bots'], this.bots, models.Bot);
};


module.exports = SlackDataStore;
