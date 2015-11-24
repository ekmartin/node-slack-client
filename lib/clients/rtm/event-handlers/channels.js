/**
 * Handlers for all RTM `channel_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var baseChannelHandlers = require('./base-channel');
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
var handleChannelLeft = function (activeUserId, activeTeamId, dataStore, message) {
    var channel = dataStore.getChannelById(message.channel);
    if (channel) {
        var index = channel.members.indexOf(activeUserId);
        channel.members.splice(index, 1);
    }
};


/** {@link https://api.slack.com/events/channel_rename|channel_rename} */
var handleChannelRename = function (dataStore, message) {
    var channel = dataStore.getChannelById(message.channel.id);
    channel.name = message.channel.name;
};


var handlers = [
    [RTM_EVENTS.CHANNEL_ARCHIVE, baseChannelHandlers.handleArchive],
    [RTM_EVENTS.CHANNEL_CREATED, handleChannelCreated],
    [RTM_EVENTS.CHANNEL_DELETED, handleChannelDeleted],
    [RTM_EVENTS.CHANNEL_HISTORY_CHANGED, helpers.noopMessage],
    [RTM_EVENTS.CHANNEL_JOINED, handleChannelJoined],
    [RTM_EVENTS.CHANNEL_LEFT, handleChannelLeft],
    [RTM_EVENTS.CHANNEL_MARKED, baseChannelHandlers.handleChannelGroupOrDMMarked],
    [RTM_EVENTS.CHANNEL_RENAME, handleChannelRename],
    [RTM_EVENTS.CHANNEL_UNARCHIVE, baseChannelHandlers.handleUnarchive]
];


module.exports = zipObject(handlers);
