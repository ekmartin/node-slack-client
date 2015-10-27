/**
 * Handlers for all RTM `group_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');
var models = require('../../../models');


var setGroupProperty = function(dataStore, groupID, val, key) {
  var group = this.dataStore.getGroupByID(groupID);
  if (group) {
    group[key] = val;
    return group;
  }
};


/** {@link https://api.slack.com/events/group_archive|group_archive} */
var handleGroupArchive = function(dataStore, message) {
  return setGroupProperty(dataStore, message['channel'], true, 'isArchived');
};


/** {@link https://api.slack.com/events/group_close|group_close} */
var handleGroupClose = function(dataStore, message) {
  return setGroupProperty(dataStore, message['channel'], false, 'isOpen');
};


/** {@link https://api.slack.com/events/group_joined|group_joined} */
var handleGroupJoined = function(dataStore, message) {
  var newGroup = new models.Group(message['channel']);
  this.groups[newGroup.id] = newGroup;
  return newGroup;
};


/** {@link https://api.slack.com/events/group_left|group_left} */
var handleGroupLeft = function(dataStore, message) {
  var groupId = message['channel']['id'];
  var group = dataStore.getGroupByID(groupId);
  delete dataStore.groups[groupId];

  return group;
};


/** {@link https://api.slack.com/events/group_open|group_open} */
var handleGroupOpen = function(dataStore, message) {
  return setGroupProperty(dataStore, message['channel'], true, 'isOpen');
};


/** {@link https://api.slack.com/events/group_unarchive|group_unarchive} */
var handleGroupUnarchive = function(dataStore, message) {
  return setGroupProperty(dataStore, message['channel'], false, 'isArchived');
};


/** {@link https://api.slack.com/events/group_rename|group_rename} */
var handleGroupRename = function(dataStore, message) {
  return this.groups[message.channel.id] = new Channel(this, message.channel);
};


var handlers =   [
  [RTM_EVENTS.GROUP_ARCHIVE, handleGroupArchive],
  [RTM_EVENTS.GROUP_CLOSE, handleGroupClose],
  [RTM_EVENTS.GROUP_JOINED, handleGroupJoined],
  [RTM_EVENTS.GROUP_LEFT, handleGroupLeft],
  [RTM_EVENTS.GROUP_MARKED, commonHandlers.handleChannelGroupOrDMMarked],
  [RTM_EVENTS.GROUP_OPEN, handleGroupOpen],
  [RTM_EVENTS.GROUP_UNARCHIVE, handleGroupUnarchive],
  [RTM_EVENTS.GROUP_RENAME, handleGroupRename]
];


module.exports = zipObject(handlers);
