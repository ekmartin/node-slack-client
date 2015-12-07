/**
 *
 */

var bind = require('lodash.bind');
var forEach = require('lodash.foreach');
var inherits = require('inherits');
var isEmpty = require('lodash.isempty');
var isString = require('lodash.isstring');
var queue = require('queue');
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
 * @param {Number} opts.maxRequestConcurrency The maximum number of requests to make to Slack's API's simultaneously, defaults to 5.
 * @param {Number} opts.requestTimeout The max length of time to wait for a request to complete in ms, defaults to 100 seconds.
 * @constructor
 */
var WebAPIClient = function(token, opts) {

    opts = opts || {};

    BaseAPIClient.call(this, opts);

    this._token = token;
    this.slackAPIUrl = opts.slackAPIUrl || 'https://slack.com/api/';
    this.transport = opts.transport || requestsTransport;
    this.userAgent = opts.userAgent || 'node-slack';

    /**
     *
     * @type {Object}
     * @private
     */
    this._requestQueue = queue({
        concurrency: opts.maxRequestConcurrency || 5,
        timeout: opts.requestTimeout || 100 * 1000
    });

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
 * @param {function} queueCb The callback to signal the request queue that the request has completed.
 * @param {object} args The arguments to pass to the transport.
 * @param {function} cb The callback to run on complete.
 * @private
 */
WebAPIClient.prototype._callTransport = function(args, cb, queueCb) {
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

        // This is always an empty callback, even if there's an error, as it's used to signal the
        // request queue that a request has completed processing, and nothing else.
        queueCb();
    });
};


/**
 * Makes a call to the Slack API.
 *
 * @param {String} endpoint The API endpoint to send to.
 * @param {Object=} opt_data The data send to the Slack API.
 * @param {function} cb The callback to run on completion.
 */
WebAPIClient.prototype.makeAPICall = function(endpoint, opt_data, cb) {
    var args = {
        url: this.slackAPIUrl + endpoint,
        form: utils.getData(opt_data, this._token),
        headers: {
            'User-Agent': this.userAgent
        }
    };

    // This function declaration is to ensure that args are passed as expected to the _callTransport
    // function from the queue.
    var fn = bind(function(queueCb) {
        this._callTransport(args, cb, queueCb);
    }, this);
    this._requestQueue.push(fn);

    // The queue will only be running at this point if 1+ other requests are already in flight.
    // Check whether that's the case, and if it's not, kick the queue to get this job to run.
    if (!this._requestQueue.running) {
        this._requestQueue.start();
    }
};


module.exports = WebAPIClient;
