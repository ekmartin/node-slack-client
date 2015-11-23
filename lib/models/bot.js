/**
 *
 */

var create = require('lodash.create');

var Model = require('./model');


var Bot = function (opts) {
    Model.call(this, 'Bot', opts);
};


Bot.prototype = create(Model.prototype, {
    constructor: Bot
});


Bot.prototype.setProperties = function (opts) {
    this.id = opts['id'] || '';
    this.delete = opts['deleted'] || false;
    this.name = opts['name'] || '';
    this.icons = opts['icons'] || {};
};


module.exports = Bot;