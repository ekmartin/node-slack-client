/**
 * Handlers for all RTM `channel_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');
var helpers = require('./helpers');
var models = require('../../../models');


var addChannel = function (dataStore, message) {
    var newChannel = new models.Channel(message);
    dataStore.setChannel(newChannel);
};


/** {@link https://api.slack.com/events/channel_created|channel_created} */
var handleChannelCreated = function (dataStore, message) {
    addChannel(dataStore, message.channel);
};


/** {@link https://api.slack.com/events/channel_deleted|channel_deleted} */
var handleChannelDeleted = function (dataStore, message) {
    var channelId = message.channel;
    dataStore.removeChannel(channelId);
};


/** {@link https://api.slack.com/events/channel_joined|channel_joined} */
var handleChannelJoined = function (dataStore, message) {
    addChannel(dataStore, message.channel);
};


/** {@link https://api.slack.com/events/channel_left|channel_left} */
var handleChannelLeft = function (dataStore, message) {
    var channel = dataStore.getChannelById(message.channel);
    if (channel) {

    }

    return message;


    //if (this.channels[message.channel]) {
    //  _results = [];
    //  for (k in this.channels[message.channel]) {
    //    if (k !== "id" &&
    //        k !== "name" &&
    //        k !== "created" &&
    //        k !== "creator" &&
    //        k !== "is_archived" &&
    //        k !== "is_general") {
    //      delete this.channels[message.channel][k];
    //    }
    //    _results.push(this.channels[message.channel].is_member = false);
    //  }
    //  return _results;
    //}
};


/** {@link https://api.slack.com/events/channel_archive|channel_archive} */
var handleChannelArchive = helpers.setObjectProperty(true, 'isArchived');


/** {@link https://api.slack.com/events/channel_unarchive|channel_unarchive} */
var handleChannelUnarchive = helpers.setObjectProperty(false, 'isArchived');


/** {@link https://api.slack.com/events/channel_rename|channel_rename} */
var handleChannelRename = function (dataStore, message) {
    var channel = dataStore.getChannelById(message.channel.id);
    channel.name = message.channel.name;
};


var handlers = [
    [RTM_EVENTS.CHANNEL_ARCHIVE, handleChannelArchive],
    [RTM_EVENTS.CHANNEL_CREATED, handleChannelCreated],
    [RTM_EVENTS.CHANNEL_DELETED, handleChannelDeleted],
    [RTM_EVENTS.CHANNEL_HISTORY_CHANGED, helpers.noopMessage],
    [RTM_EVENTS.CHANNEL_JOINED, handleChannelJoined],
    [RTM_EVENTS.CHANNEL_LEFT, handleChannelLeft],
    [RTM_EVENTS.CHANNEL_MARKED, commonHandlers.handleChannelGroupOrDMMarked],
    [RTM_EVENTS.CHANNEL_RENAME, handleChannelRename],
    [RTM_EVENTS.CHANNEL_UNARCHIVE, handleChannelUnarchive]
];


module.exports = zipObject(handlers);
