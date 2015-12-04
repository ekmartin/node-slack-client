/**
 * Helpers for working with Slack API clients.
 */

var humps = require('humps');


/**
 *
 */
var parseAPIResponse = function(res) {

    try {
        res = JSON.parse(res);
        res = humps.camelizeKeys(res);
    } catch(err) {
        throw new Error();
    }

    return res;
};


module.exports.parseAPIResponse = parseAPIResponse;
