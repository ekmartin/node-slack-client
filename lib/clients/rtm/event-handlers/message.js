/**
 * Handlers for all `message` event subtypes.
 */

var zipObject = require('lodash.zipobject');

var MESSAGE_SUBTYPES = require('../events/rtm-events').MESSAGE_SUBTYPES;
var makeMessageEventWithSubtype = require('../helpers').makeMessageEventWithSubtype;
var models = require('../../../models');


/**
 * {@link https://api.slack.com/events/message/channel_join|channel_join}
 * {@link https://api.slack.com/events/message/group_join|group_join}
 */
var baseChannelJoin = function(dataStore, message) {

};


var handlers = [
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.CHANNEL_JOIN), baseChannelJoin],
    [makeMessageEventWithSubtype(MESSAGE_SUBTYPES.GROUP_JOIN), baseChannelJoin]
];


module.exports = zipObject(handlers);
