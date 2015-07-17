'use strict';
/**
 * Main class to handle the postMessage communication, serialization, handshake etc.
 * @constructor
 */
function MLCat() {
    this.viewId = this.getToken();
    this.slimViewFrame = $('#embedSlimView');
    this.slimViewWindow = this.slimViewFrame[0].contentWindow;
    this.lastLoadedUrl = null;
    this.loadTimeout = null;
    this.internalState = MLCat.internalStates.notReady;
    this.messageReadyStates = [MLCat.internalStates.slimViewLoaded, MLCat.internalStates.slimViewReady];

    /**
     * Queue for messages to be sent in case the SlimView is not yet ready to accept
     * messages. Once connection is established between Vendor and the SlimView
     * the queued messages will be submitted.
     * @type {Array}
     */
    this.messageQueue = [];
//        var that = this;
}
MLCat.prototype = {
    isExportSegmented: function() {
        return window['XLIFF']['segmented'];
    },
    getToken: function() {
        /* global md5 */
        return md5(new Date().getTime() + '' + Math.floor(Math.random() * (999999999 - 100000001) + 100000000));
    },
    /**
     * Load SlimView for an entry. Once Vendor-SlimView communication is established,
     * let SlimView know that an entry needs to be highlighted.
     * @param {Entry} forEntry
     */
    load: function(forEntry) {
        var urlToLoad = this.getSlimViewUrl(forEntry);

        if(this.lastLoadedUrl === null || this.lastLoadedUrl !== urlToLoad) {
            clearTimeout(this.loadTimeout);
            var that = this;
            this.loadTimeout = setTimeout(function() {
                // reset internal state
                that.internalState = MLCat.internalStates.notReady;
                that.slimViewFrame.prop('src', urlToLoad);
                that.lastLoadedUrl = urlToLoad;
                that.sendMessage('request', 'view', {'highlightedEntry': forEntry.key});
            }, 1000);
        } else {
            console.info('Not loading the url - it is the same. ');
            this.sendMessage('request', 'view', {'highlightedEntry': forEntry.key});
        }

        // after the page has been loaded, the slimView connection established
        // send message to select entry
    },
    /**
     * Get the SlimView URL that needs to be loaded by Vendor
     * @param {Entry} entry
     * @returns {string}
     */
    getSlimViewUrl: function(entry) {
        var exportInfo =  window['exportInfo'];
        return 'http://slim.app.easyling.com/'
            + exportInfo['projectCode'] + '?targetLanguage=' + exportInfo['targetLanguage']
            + '&url=' + encodeURIComponent(entry.href) + '&viewId=' + this.viewId;
    },
    /**
     * Update the SlimView with new translation
     * @param entry
     */
    submitTargets: function(entry) {
        this.sendMessage('request', 'submitTargets', {
            'updates': [{
                'key': entry.key,
                'target':  entry.getUpdateTarget(),
                'propagate': false
            }],
            'save': true
        });
    },
    /**
     * Set the view-mode of SlimView to free-click
     */
    setFreeclick: function() {
        this.sendMessage('request', 'view', {
            'mode': 'free-click'
        });
    },
    /**
     * Until the postMessage communication channel is not built up,
     * every outgoing message is queued. These will be flushed upon successful
     * handshake.
     */
    sendQueuedMessages: function () {
        console.group();
        console.info('Vendor-SlimView connection established. Queue length: ' + this.messageQueue.length);
        var queueCopy = this.messageQueue.slice();
        this.messageQueue = [];
        for(var i = 0; i < queueCopy.length; ++i) {
            var envelope = queueCopy[i];
            this._post(envelope);
        }
        console.info('Done sending queued messages');
        console.groupEnd();
    },
    /**
     * Handle incoming postMessage events
     * @param event
     */
    receiveMessage: function(event) {

        function verifyEnvelope(envelope) {
            var valid = envelope.hasOwnProperty('command') && envelope.hasOwnProperty('messageId') && envelope.hasOwnProperty('viewId');
            if (!valid)	{
                /* global MissingEnvelopePropertyException */
                throw new MissingEnvelopePropertyException(envelope);
            }
            return true;

        }

        console.info('MLCAT recieved message from ' + event.origin, event.data);

        var envelope = JSON.parse(event.data);
        var that = this;
        if (verifyEnvelope(envelope)) {
            switch(envelope.command) {
            case 'slimViewLoaded':
                that.internalState = MLCat.internalStates.slimViewLoaded;
                that.sendMessage('response', 'vendorReady', { }, true);
                break;
            case 'slimViewReady':
                that.buildTranslationKeys(envelope.parameters);
                that.internalState = MLCat.internalStates.slimViewReady;
                that.sendQueuedMessages();
                break;
            case 'viewChanged':
                this.handleViewChange(envelope.parameters);
                break;
            default:
                break;
            }
        }
    },
    /**
     * This would be the place to verify what entries does SlimView know about
     * and what entries I have loaded from the XLIFF
     * @param entryKeysObj
     */
    buildTranslationKeys: function(entryKeysObj) {
//            console.dir(entryKeysObj);
    },
    /**
     * Handle entry selection on the SlimView. Keys might be of multiple format that SlimView
     * sends over. This method attempts to handle all.
     * @param messageParams
     */
    handleViewChange: function(messageParams) {
        if (messageParams.highlightedEntry) {
            var uniqueKey = messageParams['highlightedEntryId']['uniqueKey'];
            var nonUniqueKey = messageParams['highlightedEntryId']['nonUniqueKey'];

            var selectedEntry = null;

            if(MLCat.static.entryController.entryByKey.hasOwnProperty(nonUniqueKey)) {
                // we have an entry by a unique key
                selectedEntry = MLCat.static.entryController.entryByKey[nonUniqueKey];
            } else if(MLCat.static.entryController.entryByKey.hasOwnProperty(nonUniqueKey + '#0')) {
                selectedEntry = MLCat.static.entryController.entryByKey[nonUniqueKey + '#0'];
            } else if(MLCat.static.entryController.entryByKey.hasOwnProperty(uniqueKey)) {
                selectedEntry = MLCat.static.entryController.entryByKey[uniqueKey];
            } else {
                selectedEntry = MLCat.static.entryController.entryByKey[uniqueKey + '#0'];
            }

            // if entry was not found, dump an error message into console
            if(!selectedEntry) {
                throw 'Cannot select entry because key was not found: ' + JSON.stringify(messageParams);
            }

            // we have found what we are looking for, highlight that entry
            MLCat.static.entryController.entrySelected(selectedEntry, true);
//                setHighlightedDiv(messageParams.highlightedEntry);
        } else if (messageParams.url) {
//                clearTranslationKeysList();
            this.internalState = MLCat.internalStates.slimViewLoaded;
        }
    },
    getOrigin: function () {
        return 'http://slim.app.easyling.com';
    },
    /**
     * Send a message to the SlimView window
     * @param {String} type Can be response, request or error. If MessageEnvelope is provided, all other params are ignored
     * @param command
     * @param messageData
     * @param {bool} [forced] Do not check connection state before sending message - used to handshake. Defaults to false
     */
    sendMessage: function(type, command, messageData, forced) {
        if(forced == null)
            forced = false;

        var envelope = this.createEnvelope(type, command, messageData);
        if (forced || $.inArray(this.internalState, this.messageReadyStates) >= 1) {
            this._post(envelope);
        } else {
            /*eslint-disable  no-console */
            console.info('MLCAT message queued', type, command, messageData);
            /*eslint-disable  no-console */
            this.messageQueue.push(envelope);
        }
    },
    /**
     * Should not be called directly. Use sendMessage instead
     * @param {MessageEnvelope} envelope
     * @private
     */
    _post: function(envelope) {
        console.info('MLCAT sending message', envelope.type, envelope.command, envelope.getMessageData());
        this.slimViewWindow.postMessage(JSON.stringify(envelope), this.getOrigin());
    },
    /**
     * Box the raw JSON message  into a MessageEnvelope object
     * @param type
     * @param command
     * @param messageData
     * @returns {MessageEnvelope}
     */
    createEnvelope: function(type, command, messageData) {
        /* global MessageEnvelope, InvalidEnvelopeTypeException */
        var envelope = new MessageEnvelope(command, this.getToken(), this.viewId);
        switch (type) {
        case 'request':
            envelope.setRequestData(messageData);
            break;
        case 'response':
            envelope.setReponseData(messageData);
            break;
        case 'error':
            envelope.setErrorData(messageData);
            break;
        default:
            throw new InvalidEnvelopeTypeException(type);
        }
        return envelope;
    },
    init: function() {
        var that = this;
        window.addEventListener('message', function(){
            that.receiveMessage.apply(that, arguments);
        }, false);
    }
};

MLCat.static = {
    'entryController': null
};