/**
 * Handlers for all `message` event subtypes.
 */

var zipObject = require('lodash.zipobject');

var MESSAGE_SUBTYPES = require('../events/rtm-events').MESSAGE_SUBTYPES;
var makeMessageEventWithSubtype = require('../helpers').makeMessageEventWithSubtype;
var models = require('../../../models');


var addMessageToChannel = function(dataStore, message) {
    var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
    baseChannel.addMessage(message);
};


/**
 * {@link https://api.slack.com/events/message/channel_join|channel_join}
 * {@link https://api.slack.com/events/message/group_join|group_join}
 */
var baseChannelJoin = function(dataStore, message) {
    var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);

    if (baseChannel.members.indexOf(message.user) === -1) {
        baseChannel.members.push(message.user);
    }

    baseChannel.addMessage(message);
};


/**
 * {@link https://api.slack.com/events/message/channel_join|channel_join}
 * {@link https://api.slack.com/events/message/group_join|group_join}
 */
var baseChannelLeave = function(dataStore, message) {
    var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);

    var memberIndex = baseChannel.members.indexOf(message.user);
    if (memberIndex !== -1) {
        baseChannel.members.splice(memberIndex, 1);
    }

    baseChannel.addMessage(message);
};


/**
 * {@link https://api.slack.com/events/message/channel_archive|channel_archive}
 * {@link https://api.slack.com/events/message/group_archive|group_archive}
 */
var baseChannelArchive = function(dataStore, message) {
    var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
    baseChannel.addMessage(message);
};


/**
 * {@link https://api.slack.com/events/message/channel_unarchive|channel_unarchive}
 * {@link https://api.slack.com/events/message/group_unarchive|group_unarchive}
 */
var baseChannelUnarchive = function(dataStore, message) {
    var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
    baseChannel.addMessage(message);
};



var handlers = [
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.CHANNEL_JOIN), baseChannelJoin],
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.CHANNEL_LEAVE), baseChannelLeave],
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.GROUP_JOIN), baseChannelJoin],
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.GROUP_LEAVE), baseChannelLeave],
    // NOTE: for the archive / unarchive messages, the actual isArchived change is handled via the main `xxx_archive` message
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.CHANNEL_ARCHIVE), addMessageToChannel],
    // MESSAGE_SUBTYPES.CHANNEL_UNARCHIVE is not covered here as it does not appear to be thrown when a channel is unarchived
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.GROUP_ARCHIVE), addMessageToChannel],
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.GROUP_UNARCHIVE), addMessageToChannel]
];


module.exports = zipObject(handlers);
