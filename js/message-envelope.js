'use strict';

/**
 * Wrapper class used to wrap the messages to SlimView in
 * @param {String} command
 * @param {String} messageId
 * @param {String} viewId
 * @constructor
 */
function MessageEnvelope(command, messageId, viewId) {
    this.type = null;
    this.command = command;
    this.messageId = messageId;
    this.viewId = viewId;
}
MessageEnvelope.prototype = {
    setRequestData: function(data) {
        this.type = MessageEnvelope.TYPE_REQUEST;
        this.parameters = data;
    },
    setReponseData: function(data) {
        this.type = MessageEnvelope.TYPE_RESPONSE;
        this.response = data;
    },
    setErrorData: function(data) {
        this.type = MessageEnvelope.TYPE_ERROR;
        this.error = data;
    },
    /**
     * Retrieve the data for this envelope depending on the envelope's type
     * @returns {*}
     */
    getMessageData: function() {
        var data;
        switch (this.type) {
        case MessageEnvelope.TYPE_REQUEST:
            data = this.parameters;
            break;
        case MessageEnvelope.TYPE_RESPONSE:
            data = this.response;
            break;
        case MessageEnvelope.TYPE_ERROR:
            data = this.error;
            break;
        default:
            console.error('Unknown Envelope type');
            break;
        }
        return data;
    },
    /**
     * Every MessagEnvelope will be serialized into JSON
     * @returns {{command: *, messageId: *, viewId: *}}
     */
    toJSON: function() {
        var ret = {
            'command': this.command,
            'messageId': this.messageId,
            'viewId': this.viewId
        };
        // depending on the envelope's type, there might be optional
        // properties that need to be serialized
        var optionalProps = ['parameters', 'response', 'error'];
        for(var i = 0; i < optionalProps.length; ++i) {
            if(this.hasOwnProperty(optionalProps[i])) {
                ret[optionalProps[i]] = this[optionalProps[i]];
            }
        }
        return ret;
    }
};
MessageEnvelope.TYPE_REQUEST = 'request';
MessageEnvelope.TYPE_RESPONSE = 'response';
MessageEnvelope.TYPE_ERROR = 'error';