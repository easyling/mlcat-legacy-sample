## Classes
<dl>
<dt><a href="#EntryController">EntryController</a></dt>
<dd></dd>
<dt><a href="#Entry">Entry</a></dt>
<dd></dd>
<dt><a href="#InvalidEnvelopeTypeException">InvalidEnvelopeTypeException</a></dt>
<dd></dd>
<dt><a href="#MissingEnvelopePropertyException">MissingEnvelopePropertyException</a></dt>
<dd></dd>
<dt><a href="#MessageEnvelope">MessageEnvelope</a></dt>
<dd></dd>
<dt><a href="#SlimView">SlimView</a></dt>
<dd></dd>
</dl>
<a name="EntryController"></a>
## EntryController
**Kind**: global class  

* [EntryController](#EntryController)
  * [new EntryController(slimView)](#new_EntryController_new)
  * [.entrySelected(entry, doNotLoad)](#EntryController+entrySelected)
  * [.entryUpdated(entry)](#EntryController+entryUpdated)
  * [.updateSelectedDivs(entry)](#EntryController+updateSelectedDivs)
  * [.runPartialUpdate()](#EntryController+runPartialUpdate)
  * [.addEntryToLookup(entry)](#EntryController+addEntryToLookup)

<a name="new_EntryController_new"></a>
### new EntryController(slimView)
Class that keeps track of all the entries for an export document


| Param | Type | Description |
| --- | --- | --- |
| slimView | <code>[SlimView](#SlimView)</code> | SlimView instance to use the EntryController with |

<a name="EntryController+entrySelected"></a>
### entryController.entrySelected(entry, doNotLoad)
Select/highlight an entry

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 
| doNotLoad |  | 

<a name="EntryController+entryUpdated"></a>
### entryController.entryUpdated(entry)
Update the entry's target

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 

<a name="EntryController+updateSelectedDivs"></a>
### entryController.updateSelectedDivs(entry)
Update the DOMElements for en {Entry}

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 

<a name="EntryController+runPartialUpdate"></a>
### entryController.runPartialUpdate()
Partial update is just another word to update a segment but with different target
serialization. Instead of sending a valid XML fragment, we send an XLIFF bit
(with bpt, ept etc. tags)

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  
<a name="EntryController+addEntryToLookup"></a>
### entryController.addEntryToLookup(entry)
Add entry to the lookup

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 

<a name="Entry"></a>
## Entry
**Kind**: global class  
<a name="new_Entry_new"></a>
### new Entry(key, target, href, groupTarget, internalTarget, $label)
TranslationEntry implementation - trans-unit in the xliff
Note: entry and segment are used interchangeably


| Param | Description |
| --- | --- |
| key | Key of segment - this is based on what the entries can be identified |
| target | Target XML fragment for the entry |
| href | On what site was the entry found on |
| groupTarget | What trans-group does this entry belog to? |
| internalTarget |  |
| $label | DOMElement this entry "blongs to" |

<a name="InvalidEnvelopeTypeException"></a>
## InvalidEnvelopeTypeException
**Kind**: global class  
<a name="new_InvalidEnvelopeTypeException_new"></a>
### new InvalidEnvelopeTypeException(type)
Exception class, triggered when SlimView sends an envelope with unknown envelope type


| Param | Type |
| --- | --- |
| type | <code>String</code> | 

<a name="MissingEnvelopePropertyException"></a>
## MissingEnvelopePropertyException
**Kind**: global class  
<a name="new_MissingEnvelopePropertyException_new"></a>
### new MissingEnvelopePropertyException(envelope)
Exception class, triggered when SlimView send en envelope with missing properties


| Param |
| --- |
| envelope | 

<a name="MessageEnvelope"></a>
## MessageEnvelope
**Kind**: global class  

* [MessageEnvelope](#MessageEnvelope)
  * [new MessageEnvelope(command, messageId, viewId)](#new_MessageEnvelope_new)
  * [.getMessageData()](#MessageEnvelope+getMessageData) ⇒ <code>\*</code>
  * [.toJSON()](#MessageEnvelope+toJSON) ⇒ <code>Object</code>

<a name="new_MessageEnvelope_new"></a>
### new MessageEnvelope(command, messageId, viewId)
Wrapper class used to wrap the messages to SlimView in


| Param | Type |
| --- | --- |
| command | <code>String</code> | 
| messageId | <code>String</code> | 
| viewId | <code>String</code> | 

<a name="MessageEnvelope+getMessageData"></a>
### messageEnvelope.getMessageData() ⇒ <code>\*</code>
Retrieve the data for this envelope depending on the envelope's type

**Kind**: instance method of <code>[MessageEnvelope](#MessageEnvelope)</code>  
<a name="MessageEnvelope+toJSON"></a>
### messageEnvelope.toJSON() ⇒ <code>Object</code>
Every MessagEnvelope will be serialized into JSON

**Kind**: instance method of <code>[MessageEnvelope](#MessageEnvelope)</code>  
<a name="SlimView"></a>
## SlimView
**Kind**: global class  

* [SlimView](#SlimView)
  * [new SlimView()](#new_SlimView_new)
  * [.messageQueue](#SlimView+messageQueue) : <code>Array</code>
  * [.load(forEntry)](#SlimView+load)
  * [.getSlimViewUrl(entry)](#SlimView+getSlimViewUrl) ⇒ <code>string</code>
  * [.submitTargets(entry)](#SlimView+submitTargets)
  * [.setFreeclick()](#SlimView+setFreeclick)
  * [.sendQueuedMessages()](#SlimView+sendQueuedMessages)
  * [.receiveMessage(event)](#SlimView+receiveMessage)
  * [.buildTranslationKeys(entryKeysObj)](#SlimView+buildTranslationKeys)
  * [.handleViewChange(messageParams)](#SlimView+handleViewChange)
  * [.sendMessage(type, command, messageData, [forced])](#SlimView+sendMessage)
  * [.createEnvelope(type, command, messageData)](#SlimView+createEnvelope) ⇒ <code>[MessageEnvelope](#MessageEnvelope)</code>

<a name="new_SlimView_new"></a>
### new SlimView()
Main class to handle the postMessage communication, serialization, handshake etc.

<a name="SlimView+messageQueue"></a>
### slimView.messageQueue : <code>Array</code>
Queue for messages to be sent in case the SlimView is not yet ready to accept
messages. Once connection is established between Vendor and the SlimView
the queued messages will be submitted.

**Kind**: instance property of <code>[SlimView](#SlimView)</code>  
<a name="SlimView+load"></a>
### slimView.load(forEntry)
Load SlimView for an entry. Once Vendor-SlimView communication is established,
let SlimView know that an entry needs to be highlighted.

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param | Type |
| --- | --- |
| forEntry | <code>[Entry](#Entry)</code> | 

<a name="SlimView+getSlimViewUrl"></a>
### slimView.getSlimViewUrl(entry) ⇒ <code>string</code>
Get the SlimView URL that needs to be loaded by Vendor

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 

<a name="SlimView+submitTargets"></a>
### slimView.submitTargets(entry)
Update the SlimView with new translation

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param |
| --- |
| entry | 

<a name="SlimView+setFreeclick"></a>
### slimView.setFreeclick()
Set the view-mode of SlimView to free-click

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  
<a name="SlimView+sendQueuedMessages"></a>
### slimView.sendQueuedMessages()
Until the postMessage communication channel is not built up,
every outgoing message is queued. These will be flushed upon successful
handshake.

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  
<a name="SlimView+receiveMessage"></a>
### slimView.receiveMessage(event)
Handle incoming postMessage events

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param |
| --- |
| event | 

<a name="SlimView+buildTranslationKeys"></a>
### slimView.buildTranslationKeys(entryKeysObj)
This would be the place to verify what entries does SlimView know about
and what entries I have loaded from the XLIFF

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param |
| --- |
| entryKeysObj | 

<a name="SlimView+handleViewChange"></a>
### slimView.handleViewChange(messageParams)
Handle entry selection on the SlimView. Keys might be of multiple format that SlimView
sends over. This method attempts to handle all.

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param |
| --- |
| messageParams | 

<a name="SlimView+sendMessage"></a>
### slimView.sendMessage(type, command, messageData, [forced])
Send a message to the SlimView window

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | Can be response, request or error. If MessageEnvelope is provided, all other params are ignored |
| command |  |  |
| messageData |  |  |
| [forced] | <code>bool</code> | Do not check connection state before sending message - used to handshake. Defaults to false |

<a name="SlimView+createEnvelope"></a>
### slimView.createEnvelope(type, command, messageData) ⇒ <code>[MessageEnvelope](#MessageEnvelope)</code>
Box the raw JSON message  into a MessageEnvelope object

**Kind**: instance method of <code>[SlimView](#SlimView)</code>  

| Param |
| --- |
| type | 
| command | 
| messageData | 

