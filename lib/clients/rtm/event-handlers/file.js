/**
 * Handlers for all RTM `file_` events.
 */

var zipObject = require('lodash').zipObject;

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

var persistFileProperty = function (dataStore, messageFile, property, value) {
    var file = new models.File(messageFile);
    var existing = dataStore.getFileById(file.id) || file;
    file[property] = value;
    dataStore.setFile(file);
};

/** {@link https://api.slack.com/events/file_shared|file_shared} */
var handleFileShared = function (dataStore, message) {
    persistFileProperty(dataStore, message.file, 'isShared', true);
};

/** {@link https://api.slack.com/events/file_unshared|file_unshared} */
var handleFileUnshared = function (dataStore, message) {
    persistFileProperty(dataStore, message.file, 'isShared', false);
};

/** {@link https://api.slack.com/events/file_public|file_public} */
var handleFilePublic = function (dataStore, message) {
    persistFileProperty(dataStore, message.file, 'isPublic', true);
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
    [RTM_EVENTS.FILE_SHARED, handleFileShared],
    [RTM_EVENTS.FILE_UNSHARED, handleFileUnshared],
    [RTM_EVENTS.FILE_PUBLIC, handleFileUnshared],
    [RTM_EVENTS.FILE_PRIVATE, handleFilePrivate],
    [RTM_EVENTS.FILE_DELETED, handleFileDeleted]
];


module.exports = zipObject(handlers);
