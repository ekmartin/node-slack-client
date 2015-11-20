/**
 * Handlers for all RTM `group_` events.
 */

var zipObject = require('lodash.zipobject');

var RTM_EVENTS = require('../events/rtm-events').EVENTS;

var commonHandlers = require('./common');
var helpers = require('./helpers');
var models = require('../../../models');


/** {@link https://api.slack.com/events/group_archive|group_archive} */
var handleGroupArchive = function (dataStore, message) {
    return helpers.setContainerProperty(dataStore, message, true, 'isArchived');
};


/** {@link https://api.slack.com/events/group_unarchive|group_unarchive} */
var handleGroupUnarchive = function (dataStore, message) {
    return helpers.setContainerProperty(dataStore, message, false, 'isArchived');
};


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
    var group = dataStore.getGroupByID(groupId);

    dataStore.removeGroup(groupId);

    message.channel = group;
    return message;
};


/** {@link https://api.slack.com/events/group_rename|group_rename} */
var handleGroupRename = function (dataStore, message) {
    return helpers.setContainerProperty(dataStore, message, message.channel.name, 'name');
};


var handlers = [
    [RTM_EVENTS.GROUP_ARCHIVE, handleGroupArchive],
    [RTM_EVENTS.GROUP_CLOSE, helpers.noopMessage],
    [RTM_EVENTS.GROUP_JOINED, handleGroupJoined],
    [RTM_EVENTS.GROUP_LEFT, handleGroupLeft],
    [RTM_EVENTS.GROUP_MARKED, commonHandlers.handleChannelGroupOrDMMarked],
    [RTM_EVENTS.GROUP_OPEN, helpers.noopMessage],
    [RTM_EVENTS.GROUP_UNARCHIVE, handleGroupUnarchive],
    [RTM_EVENTS.GROUP_RENAME, handleGroupRename],
    [RTM_EVENTS.GROUP_HISTORY_CHANGED, helpers.noopMessage]
];


module.exports = zipObject(handlers);
