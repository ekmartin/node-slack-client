/**
 *
 */


var noopMessage = function (dataStore, message) {
    return message;
};


var setContainerProperty = function (dataStore, message, val, key) {
    var container = dataStore.getChannelGroupOrDMById(message.channel);
    if (container) {
        container[key] = val;
        message.channel = container;
    }

    return message;
};


module.exports.noopMessage = noopMessage;
module.exports.setContainerProperty = setContainerProperty;
