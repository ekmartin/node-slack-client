/**
 * Handlers for all RTM `file_` events.
 */

var zipObject = require('lodash').zipObject;
var partial = require('lodash').partial;

var RTM_EVENTS = require('../events/rtm-events').EVENTS;
var baseChannelHandlers = require('./base-channel');
var helpers = require('./helpers');
var models = require('../../../models');

/** {@link https://api.slack.com/events/file_created|file_created} */
/** {@link https://api.slack.com/events/file_change|file_change} */
var handleFileCreated = function (dataStore, message) {
    var file = new models.File(message.file);
    dataStore.setFile(file);
};

var persistFileProperty = function (property, value, dataStore, message) {
    var file = new models.File(message.file);
    var existing = dataStore.getFileById(file.id) || file;
    file[property] = value;
    dataStore.setFile(file);
};

/** {@link https://api.slack.com/events/file_private|file_private} */
var handleFilePrivate = function (dataStore, message) {
    var existing = dataStore.getFileById(message.file);
    if (existing) {
        existing.isPublic = false;
    }
};

/** {@link https://api.slack.com/events/file_deleted|file_deleted} */
var handleFileDeleted = function (dataStore, message) {
    dataStore.removeFile(message.fileId);
};

var handlers = [
    [RTM_EVENTS.FILE_CREATED, handleFileCreated],
    [RTM_EVENTS.FILE_CHANGE, handleFileCreated],
    [RTM_EVENTS.FILE_SHARED, partial(persistFileProperty, 'isShared', true)],
    [RTM_EVENTS.FILE_UNSHARED, partial(persistFileProperty, 'isShared', false)],
    [RTM_EVENTS.FILE_PUBLIC, partial(persistFileProperty, 'isPublic', true)],
    [RTM_EVENTS.FILE_PRIVATE, handleFilePrivate],
    [RTM_EVENTS.FILE_DELETED, handleFileDeleted]
];


module.exports = zipObject(handlers);
