/**
 * Checks whether or not an OK response was received.
 */

var isOK = function(responseArgs, data) {

  if (data.ok !== true) {
    throw new Error(data.error || 'Unknown API error');
  } else {
    return data;
  }

};


module.exports = isOK;
