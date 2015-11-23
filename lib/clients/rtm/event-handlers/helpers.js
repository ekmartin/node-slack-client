/**
 *
 */


var noopMessage = function(dataStore, message) {
    return message;
};


var setObjectProperty = function(val, key) {
    return function(dataStore, message) {
        var obj = dataStore.getChannelGroupOrDMById(message.channel);
        if (obj) {
          obj[key] = val;
        }
    };
};


module.exports.noopMessage = noopMessage;
module.exports.setObjectProperty = setObjectProperty;
