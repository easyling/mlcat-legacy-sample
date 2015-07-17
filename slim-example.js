$(function(){

    /**
     * TranslationEntry implementation - trans-unit in the xliff
     * Note: entry and segment are used interchangeably
     * @param key Key of segment - this is based on what the entries can be identified
     * @param target Target XML fragment for the entry
     * @param href On what site was the entry found on
     * @param groupTarget What trans-group does this entry belog to?
     * @param internalTarget
     * @param $label DOMElement this entry "blongs to"
     * @constructor
     */
    function Entry(key, target, href, groupTarget, internalTarget, $label) {
        this.key = key;
        this.target = target;
        this.href = href;
        this.groupTarget = groupTarget;
        this.label = $label;
        this.targetInternalFormat = internalTarget;
        entryController.entryByKey[this.key] = this;

        var that = this;

        // when used clicks on the entry's label select it
        $label.click(function() {
            entryController.entrySelected(that);
        });

        // if user presses ENTER key, update the SlimView
        var input = $label.find("input.target");
        input.keyup(function(ev) {
            that.target = input.val();
            if ( ev.which == 13 ) {
                setTimeout(function(){
                    console.info("Entry updated: " + that.target);
                    entryController.entryUpdated(that);
                }, 10);
            }
        });
    }

    Entry.prototype = {
        getUpdateTarget: function() {
            return this.target;
//            return mlcat.isExportSegmented() ? this.targetInternalFormat : this.target;
        }
    }

    /**
     * Class that keeps track of all the entries for an export document
     * @constructor
     */
    function EntryController() {
        this.selectedKey = $("#key");
        this.selectedTarget = $("#target");
        this.onPage = $("#page");
        this.groupTarget = $("#group-target");
        this.selectedTargetInternalFormat = $("#internal-target");
        this.selectedEntry = null;
    }

    EntryController.prototype = {
        /**
         * Select/highlight an entry
         * @param {Entry} entry
         */
        entrySelected: function(entry, doNotLoad) {
            if(typeof doNotLoad == 'undefined')
                doNotLoad = false;
            this._toggleLabels(entry.label);
            this.updateSelectedDivs(entry);
            if(!doNotLoad) {
                console.info("Load that entry!");
                mlcat.load(entry);
            }
            this.selectedEntry = entry;
        },
        /**
         * Update the entry's target
         * @param {Entry} entry
         */
        entryUpdated: function(entry) {
            this.updateSelectedDivs(entry);
            mlcat.submitTargets(entry);
        },
        /**
         * Update the DOMElements for en {Entry}
         * @param {Entry}
         */
        updateSelectedDivs: function(entry) {
            this.selectedKey.text(entry.key);
            this.selectedTarget.text(entry.target);
            this.selectedTargetInternalFormat.text(entry.targetInternalFormat);
            this.onPage.text(entry.href);
            if(XLIFF["segmented"])
                this.groupTarget.text(entry.groupTarget);
        },
        /**
         * Partial update is just another word to update a segment but with different target
         * serialization. Instead of sending a valid XML fragment, we send an XLIFF bit
         * (with bpt, ept etc. tags)
         */
        runPartialUpdate: function() {
            if(this.selectedEntry == null)
                return;
            var entry = this.selectedEntry;
            entry.targetInternalFormat = this.selectedTargetInternalFormat.val();
            this.entryUpdated(entry);
        },
        _toggleLabels: function(activeLabel) {
            $("label.active").toggleClass("active", false);
            activeLabel.toggleClass("active", true);
        },
        entryByKey: {}
    };

    /**
     * Exception class, triggered when SlimView sends an envelope with unknown envelope type
     * @param {String} type
     * @constructor
     */
    function InvalidEnvelopeTypeException(type) {
        this.type = type;
        this.message = "does not conform to the expected envelope type";
        this.toString = function() {
            return this.type + this.message;
        };
    }

    /**
     * Exception class, triggered when SlimView send en envelope with missing properties
     * @param envelope
     * @constructor
     */
    function MissingEnvelopePropertyException(envelope) {
        this.message = "Envelope is missing a non-optional property";
        this.toString = function() {
            return this.message;
        };
    }

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
                    console.error("Unknown Envelope type");
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
            }
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

    /**
     * Main class to handle the postMessage communication, serialization, handshake etc.
     * @constructor
     */
    function MLCat() {
        this.viewId = this.getToken();
        this.slimViewFrame = $("#embedSlimView");
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
            return window["XLIFF"]["segmented"];
        },
        getToken: function() {
            return md5(new Date().getTime() + "" + Math.floor(Math.random() * (999999999 - 100000001) + 100000000));
        },
        /**
         * Load SlimView for an entry. Once Vendor-SlimView communication is established,
         * let SlimView know that an entry needs to be highlighted.
         * @param {Entry} forEntry
         */
        load: function(forEntry) {
            var exportInfo =  window["exportInfo"];

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
                console.info("Not loading the url - it is the same. ");
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
            var exportInfo =  window["exportInfo"];
            return "http://slim.app.easyling.com/"
                + exportInfo["projectCode"] + "?targetLanguage=" + exportInfo["targetLanguage"]
                + "&url=" + encodeURIComponent(entry.href) + "&viewId=" + this.viewId;
        },
        /**
         * Update the SlimView with new translation
         * @param entry
         */
        submitTargets: function(entry) {
            this.sendMessage('request', 'submitTargets', {
                "updates": [{
                    "key": entry.key,
                    "target":  entry.getUpdateTarget(),
                    "propagate": false
                }],
                "save": true
            });
        },
        /**
         * Set the view-mode of SlimView to free-click
         */
        setFreeclick: function() {
            this.sendMessage('request', 'view', {
                "mode": 'free-click'
            });
        },
        /**
         * Until the postMessage communication channel is not built up,
         * every outgoing message is queued. These will be flushed upon successful
         * handshake.
         */
        sendQueuedMessages: function () {
            console.group();
            console.info("Vendor-SlimView connection established. Queue length: " + this.messageQueue.length);
            var queueCopy = this.messageQueue.slice();
            this.messageQueue = [];
            for(var i = 0; i < queueCopy.length; ++i) {
                var envelope = queueCopy[i];
                this._post(envelope);
            }
            console.info("Done sending queued messages");
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
                    throw new MissingEnvelopePropertyException(envelope);
                }
                return true;

            }

            console.info("MLCAT recieved message from " + event.origin, event.data);

            var envelope = JSON.parse(event.data);
            var that = this;
            if (verifyEnvelope(envelope)) {
                switch(envelope.command) {
                    case 'slimViewLoaded':
                        that.internalState = MLCat.internalStates.slimViewLoaded;
                        that.sendMessage("response", "vendorReady", { }, true);
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
                var uniqueKey = messageParams.highlightedEntryId["uniqueKey"];
                var nonUniqueKey = messageParams.highlightedEntryId["nonUniqueKey"];

                var selectedEntry = null;

                if(entryController.entryByKey.hasOwnProperty(nonUniqueKey)) {
                    // we have an entry by a unique key
                    selectedEntry = entryController.entryByKey[nonUniqueKey];
                } if(entryController.entryByKey.hasOwnProperty(nonUniqueKey + "#0")) {
                    selectedEntry = entryController.entryByKey[nonUniqueKey + "#0"];
                } else if(entryController.entryByKey.hasOwnProperty(uniqueKey)) {
                    selectedEntry = entryController.entryByKey[uniqueKey];
                } else {
                    selectedEntry = entryController.entryByKey[uniqueKey + "#0"]
                }

                // if entry was not found, dump an error message into console
                if(!selectedEntry) {
                    throw "Cannot select entry because key was not found: " + JSON.stringify(messageParams);
                }

                // we have found what we are looking for, highlight that entry
                entryController.entrySelected(selectedEntry, true);
//                setHighlightedDiv(messageParams.highlightedEntry);
            } else if (messageParams.url) {
//                clearTranslationKeysList();
                this.internalState = MLCat.internalStates.slimViewLoaded;
            }
        },
        getOrigin: function () {
            return "http://slim.app.easyling.com";
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
                console.info("MLCAT message queued", type, command, messageData);
                this.messageQueue.push(envelope);
            }
        },
        /**
         * Should not be called directly. Use sendMessage instead
         * @param {MessageEnvelope} envelope
         * @private
         */
        _post: function(envelope) {
            console.info("MLCAT sending message", envelope.type, envelope.command, envelope.getMessageData());
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
            window.addEventListener("message", function(){
                that.receiveMessage.apply(that, arguments);
            }, false);
        }
    };

    // set internal states to "start"
    MLCat.internalStates = Object.freeze({notReady: {}, initialized: {}, slimViewLoaded: {}, slimViewReady:{} });

    // create some support classes
    var entryController = new EntryController();
    var mlcat = new MLCat();
    // start slimView
    mlcat.init();

    var allLabels = $("label");
    allLabels.each(function() {
        var $label = $(this);
        var key = $label.attr('data-key');
        var page = $label.attr('data-page');
        var groupTarget = $label.attr('data-group-target');
        var targetInernal = $label.attr('data-internal-target');
        var target = $label.find("input.target").val();
        new Entry(key, target, page, groupTarget, targetInernal, $label);
    });

    $("#partial-update-button").click(function() { entryController.runPartialUpdate.apply(entryController); });
    $("#freeclick").click(function(){
        mlcat.setFreeclick();
    });
});