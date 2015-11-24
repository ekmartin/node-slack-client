/**
 *
 */

var isEmpty = require('lodash.isempty');


var Model = function (name, opts) {

    /**
     * The name of the model.
     * @type {string}
     * @private
     */
    this._modelName = name;

    this.setProperties(isEmpty(opts) ? {} : opts);
};


Model.prototype.setProperties = function (opts) {

};


module.exports = Model;
