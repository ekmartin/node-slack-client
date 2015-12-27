/**
 *
 */

var RTM_EVENTS = require('./events/rtm-events').EVENTS;


/**
 *
 * @param {string} subtype
 * @param {string} delim
 */
var makeEventWithSubtype = function(type, subtype, delim) {
    return [type, subtype].join(delim || '::');
};


module.exports.makeEventWithSubtype = makeEventWithSubtype;
