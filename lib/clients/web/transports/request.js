/**
 * Simple transport using the node request library.
 */

var request = require('request');


var requestTransport = function (args, cb) {
    request.post(args, function (err, response, body) {
        if (err) {
            var headers = response ? response.headers || {} : {};
            var statusCode = response ? response.statusCode || null : null;
            cb(err, headers, statusCode, body);
        } else {
            cb(err, response.headers, response.statusCode, body);
        }
    });
};


module.exports = requestTransport;
