/**
 *
 */

var EventEmitter = require('eventemitter3');
var create = require('lodash.create');
var winston = require('winston');


/**
 * Base client for both the RTM and web APIs.
 * @param opts
 * @param {string=} opts.logLevel The log level for the logger.
 * @param {Function=} opts.logger Function to use for log calls, takes (logLevel, logString) parameters.
 * @constructor
 */
var BaseAPIClient = function(opts) {

    EventEmitter.call(this);

    /**
     * The logger function attached to this client.
     * @type {Function}
     */
    this.logger = opts.logger || new winston.Logger({
        level: opts.logLevel || 'info',
        transports: [
            new winston.transports.Console()
        ]
    });

};


BaseAPIClient.prototype = create(EventEmitter.prototype, {
    constructor: BaseAPIClient
});



module.exports = BaseAPIClient;
