/**
 *
 * The connection event sequence is:
 *   - CONNECTING             the rtm.start API call has been made
 *   - AUTHENTICATED          rtm.start returned successfully, with a websocket URL to connect to
 *   - OPENING_WEBSOCKET      the client is opening a socket at the supplied URL
 *   - OPENED_WEBSOCKET       the client has opened the socket at the supplied URL
 *   - OPENED_RTM_CONNECTION  the remote server has acked the socket and sent a `hello`, the connection is now live
 */

var bind = require('lodash.bind');
var contains = require('lodash.contains');
var create = require('lodash.create');
var isUndefined = require('lodash.isundefined');

var MemoryDataStore = require('../../data-store/memory-data-store');
var clientEvents = require('./events/client-events');
var messageHandlers = require('./event-handlers');
var rtmEvents = require('./events/rtm-events');


/**
 *
 * @param {object} webClient A Slack web client instance.
 * @param {function} socketFn A function to call that should return a websocket instance.
 * @param {Object} eventEmitter The event emitter instance to dispatch with.
 * @param {object?} opts
 * @param {object} opts.dataStore A store to cache Slack info, e.g. channels, users etc. in.
 * @param {boolean} opts.autoReconnect Whether or not to automatically reconnect when the connection closes.
 * @param {number} opts.maxReconnectionAttempts
 * @param {number} opts.reconnectionBackoff
 * @param {number} opts.wsPingInterval
 * @param {number} opts.maxPongInterval
 * @constructor
 */
var RTMClient = function(webClient, socketFn, eventEmitter, opts) {

  /**
   * @private
   */
  this._webClient = webClient;

  /**
   * @type {function}
   */
  this._socketFn = socketFn;

  /**
   * @type {Object}
   */
  this.eventEmitter = eventEmitter;

  /**
   * The active websocket.
   * @type {Object}
   */
  this.ws;

  opts = opts || {};

  /**
   * @type {Object}
   */
  this.dataStore = opts.dataStore || new MemoryDataStore();

  this.MAX_RECONNECTION_ATTEMPTS = opts.maxReconnectionAttempts || 10;
  this.RECONNECTION_BACKOFF = opts.reconnectionBackoff || 3000;
  this.MAX_PONG_INTERVAL = opts.maxPongInterval || 10000;
  this.WS_PING_INTERVAL = opts.wsPingInterval || 5000;

  this.autoReconnect = opts.autoReconnect ? opts.autoReconnect : true;
};


/**
 * @type {boolean}
 */
RTMClient.prototype.connected = false;


/**
 * @type {boolean}
 */
RTMClient.prototype.authenticated = false;


/**
 * Maps message id to message object for messages sent to but not replied to by the remote server.
 * @type {Object}
 * @private
 */
RTMClient.prototype._pendingMessages = {};


/**
 * The timer repeatedly pinging the server to let it know the client is still alive.
 * @type {?}
 */
RTMClient.prototype._pingTimer = null;


/**
 * The time the last pong was received from the server.
 * @type {number}
 * @private
 */
RTMClient.prototype._lastPong = 0;


/**
 *
 * @type {number}
 * @private
 */
RTMClient.prototype._connAttempts = 0;


/**
 * Whether the server is currently connecting.
 * @type {boolean}
 * @private
 */
RTMClient.prototype._connecting = false;


/**
 *
 * @param {object} opts
 */
RTMClient.prototype.start = function(opts) {
  var that = this;

  // Check whether the client is currently attempting to connect to the RTM API.
  if (!this._connecting) {
    this.emit(clientEvents.CONNECTING);
    this._connecting = true;

    if (this._webClient) {
      this._webClient.rtm.start(opts, bind(this._onStart, this));
    }

  }
};


/**
 * @deprecated since version 2.0.0, use start() instead.
 */
RTMClient.prototype.login = function(opts) {
  this.start(opts);
};


/**
 * Generates the next message id to use.
 */
RTMClient.prototype.nextMessageId = function() {
  this._messageId = this._messageId || 1;
  return this._messageId++;
};


/**
 *
 * @param err
 * @param data
 * @private
 */
RTMClient.prototype._onStart = function(err, data) {
  this._connecting = false;
  if (err || !data['url']) {
    this.emit(clientEvents.FAILED_AUTHENTICATION, err);
    this.authenticated = false;
    if (this.autoReconnect) {
      this.reconnect();
    }
  } else {
    this.authenticated = true;
    this.dataStore.cacheRtmStart(data);

    this.emit(clientEvents.AUTHENTICATED, this.dataStore.self, this.dataStore.team);
    this.connect(data['url']);
  }
};


/**
 * Closes the websocket and tears down the ping function.
 * @private
 */
RTMClient.prototype._safeDisconnect = function() {
  if (this._pingTimer) {
    clearInterval(this._pingTimer);
    this._pingTimer = null;
  }
  if (this.ws) {
    this.ws.close();
  }
  this.authenticated = false;
  this.connected = false;
};


/**
 * Connects to the RTM API.
 * @param {string} socketUrl The URL of the websocket to connect to.
 */
RTMClient.prototype.connect = function(socketUrl) {
  this.emit(clientEvents.OPENING_WEBSOCKET);
  this.ws = this._socketFn(socketUrl);

  this.ws.on('open', bind(this.handleWsOpen, this));
  this.ws.on('message', bind(this.handleWsMessage, this));
  this.ws.on('error', bind(this.handleWsError, this));
  this.ws.on('close', bind(this.handleWsClose, this));
  this.ws.on('ping', bind(this.handleWsPing, this));
};


/**
 * Disconnects from the RTM API.
 */
RTMClient.prototype.disconnect = function() {
  this.autoReconnect = false;
  this._safeDisconnect();
};


/**
 *
 */
RTMClient.prototype.reconnect = function() {
  if (!this._connecting) {
    this.emit(clientEvents.ATTEMPTING_RECONNECT);
    // Stop listening to the websocket's close event, so that the autoronnect logic doesn't fire twice.
    this.ws.removeAllListeners('close');
    this._safeDisconnect();

    this._connAttempts++;
    if (this._connAttempts > this.MAX_RECONNECTION_ATTEMPTS) {
      throw new Error('unable to connect to Slack RTM API, failed after max reconnection attempts');
    }
    setTimeout(bind(this.start, this), this._connAttempts * this.RECONNECTION_BACKOFF);
  }
};


/**
 * Pings the remote server to let it know the client is still alive.
 * @private
 */
RTMClient.prototype._pingServer = function() {
  if (this.connected) {
    this._wsSendMsg({'type': 'ping'});

    // If the last pong was more than MAX_PONG_INTERVAL, force a reconnect
    var pongInterval = Date.now() - this._lastPong;
    if (pongInterval > this.MAX_PONG_INTERVAL) {
      this.reconnect();
    }
  }
};


/**
 * Handler to deal with the WebSocket open event.
 * NOTE: this.connected doesn't get set to true until the helloHandler is called.
 */
RTMClient.prototype.handleWsOpen = function() {
  this.emit(clientEvents.OPENED_WEBSOCKET);
  this._lastPong = Date.now();
  this._connAttempts = 0;
  if (this._pingTimer) {
    clearInterval(this._pingTimer);
  } else {
    this._pingTimer = setInterval(bind(this._pingServer, this), this.WS_PING_INTERVAL);
  }
};


/**
 * Handler to deal with the WebSocket message event.
 * @param {object} message
 */
RTMClient.prototype.handleWsMessage = function(message) {
  try {
    // TODO(leah): run the middleware stack
    message = JSON.parse(message);
  } catch(err) {
    // TODO(leah): Set up debug logging.
  }

  var messageType = message.type;

  if (messageType === 'pong') {
    this._handlePong(message);
  } else if (messageType === rtmEvents.EVENTS.HELLO) {
    this._handleHello();
  } else {

    if (messageType === rtmEvents.EVENTS.MESSAGE) {
      var replyTo = message['reply_to'];
      if (replyTo) {
        if (this._pendingMessages[replyTo]) {
          delete this._pendingMessages[replyTo];
        } else {
          // If the message was sent in reply to a message that's not on this client, skip the message
          return;
        }
      }
    }

    var handler = messageHandlers[messageType];
    if (handler) {
      var updatedMsg = handler(this.dataStore, message);
    }

    this.emit(clientEvents.RAW_MESSAGE, message);
    if (!isUndefined(updatedMsg)) {
      this.emit(messageType, updatedMsg);

      if (messageType === rtmEvents.EVENTS.MESSAGE) {
        var subType = message['subtype'];
        if (subType) {
          this.emit('message::' + subType, updatedMsg);
        }
      }
    }

  }

};


RTMClient.prototype.handleWsError = function() {
  //return this.emit('error', error);
};


/**
 *
 */
RTMClient.prototype.handleWsClose = function(code, reason) {
  this.connected = false;

  this.emit(clientEvents.WS_CLOSE, code, reason);

  if (this.autoReconnect && !this._connecting) {
    this.reconnect();
  }
};


/**
 * Handler for the websocket ping event.
 * This pongs back to the server to let it know the client is still active.
 */
RTMClient.prototype.handleWsPing = function() {
  if (this.ws.pong) {
    this.ws.pong();
  }
};


/**
 * Handles the server's pong message, updating the lastPong time on the client.
 * @param message
 */
RTMClient.prototype._handlePong = function(message) {
  this._lastPong = Date.now();
  delete this._pendingMessages[message['reply_to']];
};


/** {@link https://api.slack.com/events/hello|hello} */
RTMClient.prototype._handleHello = function() {
  this.connected = true;
  this.emit(clientEvents.OPENED_RTM_CONNECTION);
};


/**
 * Sends a message over the websocket to the server.
 * @private
 */
RTMClient.prototype._wsSendMsg = function(message) {
  if (this.connected) {
    message.id = this.nextMessageId();
    try {
      message = JSON.stringify(message);
      this._pendingMessages[message.id] = message;
      this.ws.send(message);
      return message;
    } catch (err) {
      // Debug log
    }
  }
};


// ###############################################
// Event Emitter API
// ###############################################


RTMClient.prototype.on = function(event, listener) {
  this.eventEmitter.on(event, listener);
};


RTMClient.prototype.addListener = function(event, listener) {
  this.on(event, listener);
};


RTMClient.prototype.once = function(event, listener) {
  this.eventEmitter.once(event, listener);
};


RTMClient.prototype.removeListener = function(event, listener) {
  this.eventEmitter.removeListener(event, listener);
};


RTMClient.prototype.removeAllListeners = function(event) {
  this.eventEmitter.removeAllListeners(event);
};


RTMClient.prototype.listeners = function(event) {
  this.eventEmitter.listeners(event);
};


/**
 * @param {string} event The event to emit.
 * @param {...*} args
 * @returns {*|apply}
 */
RTMClient.prototype.emit = function() {
  this.eventEmitter.emit.apply(this.eventEmitter, arguments);
};


module.exports = RTMClient;
