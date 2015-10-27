/**
 * Simple transport using the node request library.
 */

var request = require('request');


var requestTransport = function(args, cb) {
  request.post(args, function(err, response, body) {
    cb(err, response.headers, response.statusCode, body);
  });
};


module.exports = requestTransport;
