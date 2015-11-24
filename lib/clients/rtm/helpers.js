/**
 *
 */

var humps = require('humps');


/**
 *
 */
var parseRTMMessage = function(message) {
    message = JSON.parse(message);
    message = humps.camelizeKeys(message);

    return message;
};


module.exports.parseRTMMessage = parseRTMMessage;
