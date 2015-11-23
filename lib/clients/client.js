/**
 *
 */

var winston = require('winston');


/**
 * Base client for both the RTM and web APIs.
 * @param opts
 * @param {string=} opts.logLevel The log level for the logger.
 * @param {Function=} opts.logger Function to use for log calls, takes (logLevel, logString) parameters.
 * @constructor
 */
var BaseAPIClient = function(opts) {

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


module.exports = BaseAPIClient;
