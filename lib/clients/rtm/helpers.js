/**
 *
 */

var humps = require('humps');

var RTM_EVENTS = require('./events/rtm-events').EVENTS;


/**
 *
 */
var parseRTMMessage = function(message) {
    message = JSON.parse(message);
    message = humps.camelizeKeys(message);

    return message;
};


/**
 *
 * @param {string} subtype
 * @param {string} delim
 */
var makeMessageEventWithSubtype = function(subtype, delim) {
    return [RTM_EVENTS.MESSAGE, subtype].join(delim || '::');
};


module.exports.makeMessageEventWithSubtype = makeMessageEventWithSubtype;
module.exports.parseRTMMessage = parseRTMMessage;
