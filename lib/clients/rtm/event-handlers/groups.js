/**
 * Handlers for all RTM `group_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var baseChannelHandlers = require('./base-channel');
var helpers = require('./helpers');
var models = require('../../../models');


/** {@link https://api.slack.com/events/group_joined|group_joined} */
var handleGroupJoined = function (dataStore, message) {
    var group = new models.Group(message.channel);
    message.channel = group;

    dataStore.setGroup(group);

    return message;
};


/** {@link https://api.slack.com/events/group_left|group_left} */
var handleGroupLeft = function (dataStore, message) {
    var groupId = message.channel.id;
    var group = dataStore.getGroupById(groupId);

    dataStore.removeGroup(groupId);

    message.channel = group;
    return message;
};


/** {@link https://api.slack.com/events/group_rename|group_rename} */
var handleGroupRename = function (dataStore, message) {
    //return helpers.setContainerProperty(dataStore, message, message.channel.name, 'name');
};


var handlers = [
    [RTM_EVENTS.GROUP_ARCHIVE, baseChannelHandlers.handleArchive],
    [RTM_EVENTS.GROUP_CLOSE, helpers.noopMessage],
    [RTM_EVENTS.GROUP_JOINED, handleGroupJoined],
    [RTM_EVENTS.GROUP_LEFT, handleGroupLeft],
    [RTM_EVENTS.GROUP_MARKED, baseChannelHandlers.handleChannelGroupOrDMMarked],
    [RTM_EVENTS.GROUP_OPEN, helpers.noopMessage],
    [RTM_EVENTS.GROUP_UNARCHIVE, baseChannelHandlers.handleUnarchive],
    [RTM_EVENTS.GROUP_RENAME, handleGroupRename],
    [RTM_EVENTS.GROUP_HISTORY_CHANGED, helpers.noopMessage]
];


module.exports = zipObject(handlers);
