/**
 *
 */

var create = require('lodash.create');

var Model = require('./model');


var InfoValue = function (opts) {
    Model.call(this, 'InfoValue', opts);
};


InfoValue.prototype = create(Model.prototype, {
    constructor: InfoValue
});


InfoValue.prototype.setProperties = function (opts) {
    this.value = opts['value'];
    this.creator = opts['creator'];
    this.lastSet = opts['last_set'];
};


module.exports = InfoValue;
