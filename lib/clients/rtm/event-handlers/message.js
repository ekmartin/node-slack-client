/**
 * Handlers for all `message` event subtypes.
 */

var findIndex = require('lodash').findIndex;
var zipObject = require('lodash').zipObject;

var RTM_EVENTS = require('../events/rtm-events').EVENTS;
var MESSAGE_SUBTYPES = require('../events/rtm-events').MESSAGE_SUBTYPES;
var makeEventWithSubtype = require('../helpers').makeEventWithSubtype;
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


/** {@link https://api.slack.com/events/message/message_deleted|message_deleted} */
var baseChannelMessageDeleted = function(dataStore, message) {
    var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
    var msgIndex = findIndex(baseChannel.history, 'ts', message.deletedTs);
    baseChannel.history.splice(msgIndex, 1);
    baseChannel.addMessage(message);
};


/** {@link https://api.slack.com/events/message/message_changed|message_changed} */
var baseChannelMessageChanged = function(dataStore, message) {
    var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
    baseChannel.updateMessage(message);
    baseChannel.addMessage(message);
};


var subtypeHandlers = [
    [MESSAGE_SUBTYPES.MESSAGE_DELETED, baseChannelMessageDeleted],
    [MESSAGE_SUBTYPES.MESSAGE_CHANGED, baseChannelMessageChanged],
    [MESSAGE_SUBTYPES.CHANNEL_JOIN, baseChannelJoin],
    [MESSAGE_SUBTYPES.CHANNEL_LEAVE, baseChannelLeave],
    [MESSAGE_SUBTYPES.GROUP_JOIN, baseChannelJoin],
    [MESSAGE_SUBTYPES.GROUP_LEAVE, baseChannelLeave],
    // Add in a default handler for all other message subtypes
    ['rtm_client_add_message', addMessageToChannel]
];

var handlers = subtypeHandlers.map(function(handler) {
    return [makeEventWithSubtype(RTM_EVENTS.MESSAGE, handler[0]), handler[1]];
});

module.exports = zipObject(handlers);
