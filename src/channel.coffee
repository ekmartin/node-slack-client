Message = require './message'

class Channel
  constructor: (@_client, data = {}) ->
    @_typing = {}
    @_history = {}

    for k of (data or {})
      @[k] = data[k]

    # TODO: Emit event for unread history

  getType: ->
    return @constructor.name

  addMessage: (message) ->
    switch message.subtype
      when undefined, "channel_archive", "channel_unarchive", "group_archive", "group_unarchive"
        @_history[message.ts] = message

      when "message_changed"
        @_history[message.message.ts] = message.message

      when "message_deleted"
        delete @_history[message.deleted_ts]

      when "channel_topic", "group_topic"
        @topic.value = message.topic
        @topic.creator = message.user
        @topic.last_set = message.ts

        @_history[message.ts] = message

      when "channel_purpose", "group_purpose"
        @purpose.value = message.purpose
        @purpose.creator = message.user
        @purpose.last_set = message.ts

        @_history[message.ts] = message

      when "channel_name", "group_name"
        @name = message.name
        @_history[message.ts] = message

      when "bot_message"
        # TODO: Make a new message type before storing
        @_history[message.ts] = message

      when "channel_join", "group_join"
        @members.push message.user
        @_history[message.ts] = message

      when "channel_leave", "group_leave"
        index = @members.indexOf message.user
        if index isnt -1
          @members.splice index

        @_history[message.ts] = message

      else
        @_client.logger.debug "Unknown message subtype: %s", message.subtype
        @_history[message.ts] = message

    if message.ts and not message.hidden and @latest? and @latest.ts? and message.ts > @latest.ts
      @unread_count++
      @latest = message

    if @_client.autoMark then @mark message.ts

  getHistory: ->
    @_history

  getTyping: ->
    for k of @_typing
      k

  send: (text) ->
    m = new Message @_client, {text: text}
    @sendMessage m

  sendMessage: (message) ->
    message.channel = @id
    @_client._send(message)

  fetchHistory: (latest, oldest) ->
    params = {
      "channel": @id
    }

    if latest? then params.latest = latest
    if oldest? then params.oldest = oldest

    method = 'channels.history'
    if @getType() == 'Group' then method = 'groups.history'
    if @getType() == 'DM' then method = 'im.history'

    @_client._apiCall method, params, @_onFetchHistory

  _onFetchHistory: (data) =>
    @_client.logger.debug data

  mark: (ts) ->
    params = {
      "channel": @id,
      "ts": ts
    }

    method = 'channels.mark'
    if @getType() == 'Group' then method = 'groups.mark'
    if @getType() == 'DM' then method = 'im.mark'

    @_client._apiCall method, params, @_onMark

  _onMark: (data) =>
    @_client.logger.debug data
    # TODO: Update @unread_count based on ts


module.exports = Channel
