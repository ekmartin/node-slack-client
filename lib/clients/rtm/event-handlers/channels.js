/**
 * Handlers for all RTM `channel_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');
var models = require('../../../models');


var addChannel = function(dataStore, channel) {
  var newChannel = models.Channel(channel);
  dataStore.channels[channel.id] = newChannel;

  return newChannel;
};


/** {@link https://api.slack.com/events/channel_created|channel_created} */
var handleChannelCreated = function(dataStore, message) {
  return addChannel(dataStore, message['channel']);
};


/** {@link https://api.slack.com/events/channel_deleted|channel_deleted} */
var handleChannelDeleted = function(dataStore, message) {
  var channelId = message['channel']['id'];
  var channel = dataStore.getChannelByID(channelId);
  delete dataStore.channels[channelId];

  return channel;
};


/** {@link https://api.slack.com/events/channel_joined|channel_joined} */
var handleChannelJoined = function(dataStore, message) {
  return addChannel(dataStore, message['channel']);
};


/** {@link https://api.slack.com/events/channel_left|channel_left} */
var handleChannelLeft = function(dataStore, message) {
  //if (this.channels[message.channel]) {
  //  _results = [];
  //  for (k in this.channels[message.channel]) {
  //    if (k !== "id" && k !== "name" && k !== "created" && k !== "creator" && k !== "is_archived" && k !== "is_general") {
  //      delete this.channels[message.channel][k];
  //    }
  //    _results.push(this.channels[message.channel].is_member = false);
  //  }
  //  return _results;
  //}
};


/** {@link https://api.slack.com/events/channel_archive|channel_archive} */
var handleChannelArchive = function(dataStore, message) {
  var channel = dataStore.getChannelByID(message['channel']);
  if (channel) {
    channel.isArchived = true;
  }
};


/** {@link https://api.slack.com/events/channel_unarchive|channel_unarchive} */
var handleChannelUnarchive = function(dataStore, message) {
  var channel = dataStore.getChannelByID(message['channel']);
  if (channel) {
    channel.isArchived = false;
  }
};


/** {@link https://api.slack.com/events/channel_rename|channel_rename} */
var handleChannelRename = function(dataStore, message) {
  //return this.channels[message.channel.id] = new Channel(this, message.channel);
};


var handlers =   [
  [RTM_EVENTS.CHANNEL_ARCHIVE, handleChannelArchive],
  [RTM_EVENTS.CHANNEL_CREATED, handleChannelCreated],
  [RTM_EVENTS.CHANNEL_DELETED, handleChannelDeleted],
  [RTM_EVENTS.CHANNEL_JOINED, handleChannelJoined],
  [RTM_EVENTS.CHANNEL_LEFT, handleChannelLeft],
  [RTM_EVENTS.CHANNEL_MARKED, commonHandlers.handleChannelGroupOrDMMarked],
  [RTM_EVENTS.CHANNEL_UNARCHIVE, handleChannelUnarchive],
  [RTM_EVENTS.CHANNEL_RENAME, handleChannelRename]
];


module.exports = zipObject(handlers);
