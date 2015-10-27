/**
 *
 */

var bind = require('lodash.bind');
var forEach = require('lodash.foreach');
var isEmpty = require('lodash.isempty');
var isString = require('lodash.isstring');
var startsWith = require('lodash.startswith');

var facets = require('./facets/index');
var middleware = require('../../middleware');
var utils = require('./utils');

// TODO(leah): Support:
//   * retry policy
//   * request throttle


/**
 * Slack Web API client.
 *
 * @param token The Slack API token to use with this client.
 * @param {Function} transport Function to call to make a POST request to the Slack API.
 * @param {Object=} opts
 * @param {boolean} opts.usePromises Whether or not to use a promise based API.
 * @param {String} opts.slackAPIUrl The Slack API URL.
 * @param {String} opts.userAgent The user-agent to use, defaults to node-slack.
 * @param {Array} opts.middleware The middleware to use with this client, will override default middleware.
 * @param {Array} opts.facets An array of facet classes to use with the client, will set up all facets if empty or undefined.
 * @constructor
 */
var WebAPIClient = function(token, transport, opts) {

  opts = opts || {};

  this.transport = transport;
  this.slackAPIUrl = opts.slackAPIUrl || 'https://slack.com/api/';
  this.middleware = opts.middleware || [
      middleware.json,
      middleware.isOK
    ];
  this.userAgent = opts.userAgent || 'node-slack';
  this.usesPromises = opts.usePromises || false;

  if (this.usesPromises) {
    this._Promise = require('bluebird');
  }

  this._createFacets(!isEmpty(opts.facets) ? opts.facets : facets);
};


/**
 * @type {String}
 */
WebAPIClient.prototype._token;


/**
 * The names of the facets installed on this client.
 * @type {Array}
 */
WebAPIClient.prototype._facetNames = [];


/**
 *
 */
WebAPIClient.prototype.registerFacet = function(facet) {
  this._facetNames.push(facet.name);
  if (!this[facet.name]) {
    this[facet.name] = facet;
  } else {
    throw new Error('Facet with name of ' + facet.name + ' is already registered with this client');
  }
};


/**
 * Instantiates each of the API facets.
 *
 * @param {Array} facets The array of facet classes to use.
 * @private
 */
WebAPIClient.prototype._createFacets = function(facets) {
  var makeAPICall = bind(this.makeAPICall, this);
  forEach(facets, function(Facet) {
    this.registerFacet(new Facet(makeAPICall));
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
  var that = this;

  this.transport(args, function(err, headers, statusCode, body) {
    if (err) {
      cb(err, null);
    }

    var isSuccessStatus = statusCode >= 200 && statusCode < 300;

    if (!isSuccessStatus) {
      // TODO(leah): Deal with the bad cases.
    } else {
      var requestArgs = {
        statusCode: statusCode,
        headers: headers
      };
      var middleware = that.middleware || [];
      for (var i = 0, middlewareFn; i < middleware.length; ++i) {
        middlewareFn = middleware[i];
        try {
          body = middlewareFn(requestArgs, body);
        } catch(err) {
          cb(err, null);
        }
      }
      cb(null, body);
    }
  });
};


/**
 * Makes a call to the Slack API.
 *
 * @param {String} endpoint The API endpoint to send to.
 * @param {Object=} opt_data The data send to the Slack API.
 * @param {function} opt_cb The callback to run on completion, if using callbacks.
 *
 * @return A promise, or undefined if using callbacks.
 */
WebAPIClient.prototype.makeAPICall = function(endpoint, opt_data, opt_cb) {
  var args = {
    url: this.slackAPIUrl + endpoint,
    form: utils.getData(opt_data, this._token),
    headers: {
      'User-Agent': this.userAgent
    }
  };

  var that = this;

  if (this._Promise) {
    return new this._Promise(function (resolve, reject) {
      that._callTransport(args, function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  } else {
    this._callTransport(args, opt_cb);
  }
};


module.exports = WebAPIClient;
