/**
 * Handlers for all RTM `star_` events.
 */

var zipObject = require('lodash').zipObject;

var RTM_EVENTS = require('../events/rtm-events').EVENTS;
var STAR_TYPES = require('../events/rtm-events').STAR_TYPES;
var makeEventWithSubtype = require('../helpers').makeEventWithSubtype;
var models = require('../../../models');
var helpers = require('./helpers');

var persistSharedMessage = function(dataStore, message, isShared) {
    var item = message.item;
    var channel = dataStore.getChannelGroupOrDMById(item.channel);
    if (channel) {
        var channelMessage = channel.getMessageByTs(item.message.ts);
        if (channelMessage) {
            channelMessage.isStarred = isShared;
        } else {
            channel.addMessage(item.message);
        }
    }
};

var persistSharedChannel = function (dataStore, message, isStarred) {
    var item = message.item;
    var channel = dataStore.getChannelGroupOrDMById(item.channel);
    // As item.channel is only an ID we can only star/unstar
    // it if we have it in our store:
    if (channel) {
        channel.isStarred = isStarred;
    }
};

var messageStarred = function (dataStore, message) {
    persistSharedMessage(dataStore, message, true);
};

var messageUnstarred = function (dataStore, message) {
    persistSharedMessage(dataStore, message, false);
};

var channelStarred = function (dataStore, message) {
    persistSharedChannel(dataStore, message, true);
};

var channelUnstarred = function (dataStore, message) {
    persistSharedChannel(dataStore, message, false);
};

/** {@link https://api.slack.com/events/star_added|star_added} */
/** {@link https://api.slack.com/events/star_removed|star_removed} */
var subtypeHandlers = [
    [RTM_EVENTS.STAR_ADDED, STAR_TYPES.MESSAGE, messageStarred],
    [RTM_EVENTS.STAR_REMOVED, STAR_TYPES.MESSAGE, messageUnstarred],
    [RTM_EVENTS.STAR_ADDED, STAR_TYPES.CHANNEL, channelStarred],
    [RTM_EVENTS.STAR_REMOVED, STAR_TYPES.CHANNEL, channelUnstarred],
    [RTM_EVENTS.STAR_ADDED, STAR_TYPES.FILE, helpers.noopMessage],
    [RTM_EVENTS.STAR_REMOVED, STAR_TYPES.FILE, helpers.noopMessage],
    [RTM_EVENTS.STAR_ADDED, STAR_TYPES.FILE_COMMENT, helpers.noopMessage],
    [RTM_EVENTS.STAR_REMOVED, STAR_TYPES.FILE_COMMENT, helpers.noopMessage],
];

var handlers = subtypeHandlers.map(function(handler) {
    return [makeEventWithSubtype(handler[0], handler[1]), handler[2]];
});

module.exports = zipObject(handlers);
