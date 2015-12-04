/**
 *
 */

var bind = require('lodash.bind');
var forEach = require('lodash.foreach');
var inherits = require('inherits');
var isEmpty = require('lodash.isempty');
var isString = require('lodash.isstring');
var startsWith = require('lodash.startswith');

var BaseAPIClient = require('../client');
var facets = require('./facets/index');
var parseAPIResponse = require('../helpers').parseAPIResponse;
var requestsTransport = require('./transports/request');
var utils = require('./utils');

// TODO(leah): Support:
//   * retry policy
//   * request throttle


/**
 * Slack Web API client.
 *
 * @param token The Slack API token to use with this client.
 * @param {Object=} opts
 * @param {String} opts.slackAPIUrl The Slack API URL.
 * @param {String} opts.userAgent The user-agent to use, defaults to node-slack.
 * @param {Function} opts.transport Function to call to make an HTTP call to the Slack API.
 * @param {string} opts.logLevel The log level for the logger.
 * @param {Function} opts.logger Function to use for log calls, takes (logLevel, logString) parameters.
 * @constructor
 */
var WebAPIClient = function(token, opts) {

    opts = opts || {};

    BaseAPIClient.call(this, opts);

    this._token = token;
    this.slackAPIUrl = opts.slackAPIUrl || 'https://slack.com/api/';
    this.transport = opts.transport || requestsTransport;
    this.userAgent = opts.userAgent || 'node-slack';

    this._createFacets();
};

inherits(WebAPIClient, BaseAPIClient);


/**
 * @type {String}
 */
WebAPIClient.prototype._token;


/**
 * Initializes each of the API facets.
 * @private
 */
WebAPIClient.prototype._createFacets = function() {
    var makeAPICall = bind(this.makeAPICall, this);
    forEach(facets, function(Facet) {
        var newFacet = new Facet(makeAPICall);
        this[newFacet.name] = newFacet;
    }, this);
};


/**
 * Calls the supplied transport function and processes the results.
 *
 * @param {object} args The arguments to pass to the transport.
 * @param {function} cb The callback to run on complete.
 * @private
 */
WebAPIClient.prototype._callTransport = function(args, cb) {

    this.transport(args, function(err, headers, statusCode, body) {
        if (err) {
            cb(err, null);
        }

        var isSuccessStatus = statusCode >= 200 && statusCode < 300;

        if (!isSuccessStatus) {
            // TODO(leah): Deal with the bad cases.
        } else {
            var parsedBody = parseAPIResponse(body);
            cb(null, parsedBody);
        }
    });
};


/**
 * Makes a call to the Slack API.
 *
 * @param {String} endpoint The API endpoint to send to.
 * @param {Object=} opt_data The data send to the Slack API.
 * @param {function} opt_cb The callback to run on completion, if using callbacks.
 */
WebAPIClient.prototype.makeAPICall = function(endpoint, opt_data, opt_cb) {
    var args = {
        url: this.slackAPIUrl + endpoint,
        form: utils.getData(opt_data, this._token),
        headers: {
            'User-Agent': this.userAgent
        }
    };

    this._callTransport(args, opt_cb);
};


module.exports = WebAPIClient;
