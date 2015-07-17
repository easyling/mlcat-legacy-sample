## Classes
<dl>
<dt><a href="#Entry">Entry</a></dt>
<dd></dd>
<dt><a href="#EntryController">EntryController</a></dt>
<dd></dd>
<dt><a href="#InvalidEnvelopeTypeException">InvalidEnvelopeTypeException</a></dt>
<dd></dd>
<dt><a href="#MissingEnvelopePropertyException">MissingEnvelopePropertyException</a></dt>
<dd></dd>
<dt><a href="#MessageEnvelope">MessageEnvelope</a></dt>
<dd></dd>
<dt><a href="#MLCat">MLCat</a></dt>
<dd></dd>
</dl>
<a name="Entry"></a>
## Entry
**Kind**: global class  
<a name="new_Entry_new"></a>
### new Entry(key, target, href, groupTarget, internalTarget, $label)
TranslationEntry implementation - trans-unit in the xliff


| Param | Description |
| --- | --- |
| key | Key of segment - this is based on what the entries can be identified |
| target | Target XML fragment for the entry |
| href | On what site was the entry found on |
| groupTarget | What trans-group does this entry belog to? |
| internalTarget |  |
| $label | DOMElement this entry "blongs to" |

<a name="EntryController"></a>
## EntryController
**Kind**: global class  

* [EntryController](#EntryController)
  * [new EntryController()](#new_EntryController_new)
  * [.entrySelected(entry)](#EntryController+entrySelected)
  * [.entryUpdated(entry)](#EntryController+entryUpdated)
  * [.updateSelectedDivs()](#EntryController+updateSelectedDivs)
  * [.runPartialUpdate()](#EntryController+runPartialUpdate)

<a name="new_EntryController_new"></a>
### new EntryController()
Class that keeps track of all the entries for an export document

<a name="EntryController+entrySelected"></a>
### entryController.entrySelected(entry)
Select/highlight an entry

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 

<a name="EntryController+entryUpdated"></a>
### entryController.entryUpdated(entry)
Update the entry's target

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 

<a name="EntryController+updateSelectedDivs"></a>
### entryController.updateSelectedDivs()
Update the DOMElements for en {Entry}

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  

| Type |
| --- |
| <code>[Entry](#Entry)</code> | 

<a name="EntryController+runPartialUpdate"></a>
### entryController.runPartialUpdate()
Partial update is just another word to update a segment but with different target

**Kind**: instance method of <code>[EntryController](#EntryController)</code>  
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
<a name="MLCat"></a>
## MLCat
**Kind**: global class  

* [MLCat](#MLCat)
  * [new MLCat()](#new_MLCat_new)
  * [.messageQueue](#MLCat+messageQueue) : <code>Array</code>
  * [.load(forEntry)](#MLCat+load)
  * [.getSlimViewUrl(entry)](#MLCat+getSlimViewUrl) ⇒ <code>string</code>
  * [.submitTargets(entry)](#MLCat+submitTargets)
  * [.setFreeclick()](#MLCat+setFreeclick)
  * [.sendQueuedMessages()](#MLCat+sendQueuedMessages)
  * [.receiveMessage(event)](#MLCat+receiveMessage)
  * [.buildTranslationKeys(entryKeysObj)](#MLCat+buildTranslationKeys)
  * [.handleViewChange(messageParams)](#MLCat+handleViewChange)
  * [.sendMessage(type, command, messageData, [forced])](#MLCat+sendMessage)
  * [.createEnvelope(type, command, messageData)](#MLCat+createEnvelope) ⇒ <code>[MessageEnvelope](#MessageEnvelope)</code>

<a name="new_MLCat_new"></a>
### new MLCat()
Main class to handle the postMessage communication, serialization, handshake etc.

<a name="MLCat+messageQueue"></a>
### mlCat.messageQueue : <code>Array</code>
Queue for messages to be sent in case the SlimView is not yet ready to accept

**Kind**: instance property of <code>[MLCat](#MLCat)</code>  
<a name="MLCat+load"></a>
### mlCat.load(forEntry)
Load SlimView for an entry. Once Vendor-SlimView communication is established,

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param | Type |
| --- | --- |
| forEntry | <code>[Entry](#Entry)</code> | 

<a name="MLCat+getSlimViewUrl"></a>
### mlCat.getSlimViewUrl(entry) ⇒ <code>string</code>
Get the SlimView URL that needs to be loaded by Vendor

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param | Type |
| --- | --- |
| entry | <code>[Entry](#Entry)</code> | 

<a name="MLCat+submitTargets"></a>
### mlCat.submitTargets(entry)
Update the SlimView with new translation

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param |
| --- |
| entry | 

<a name="MLCat+setFreeclick"></a>
### mlCat.setFreeclick()
Set the view-mode of SlimView to free-click

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  
<a name="MLCat+sendQueuedMessages"></a>
### mlCat.sendQueuedMessages()
Until the postMessage communication channel is not built up,

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  
<a name="MLCat+receiveMessage"></a>
### mlCat.receiveMessage(event)
Handle incoming postMessage events

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param |
| --- |
| event | 

<a name="MLCat+buildTranslationKeys"></a>
### mlCat.buildTranslationKeys(entryKeysObj)
This would be the place to verify what entries does SlimView know about

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param |
| --- |
| entryKeysObj | 

<a name="MLCat+handleViewChange"></a>
### mlCat.handleViewChange(messageParams)
Handle entry selection on the SlimView. Keys might be of multiple format that SlimView

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param |
| --- |
| messageParams | 

<a name="MLCat+sendMessage"></a>
### mlCat.sendMessage(type, command, messageData, [forced])
Send a message to the SlimView window

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | Can be response, request or error. If MessageEnvelope is provided, all other params are ignored |
| command |  |  |
| messageData |  |  |
| [forced] | <code>bool</code> | Do not check connection state before sending message - used to handshake. Defaults to false |

<a name="MLCat+createEnvelope"></a>
### mlCat.createEnvelope(type, command, messageData) ⇒ <code>[MessageEnvelope](#MessageEnvelope)</code>
Box the raw JSON message  into a MessageEnvelope object

**Kind**: instance method of <code>[MLCat](#MLCat)</code>  

| Param |
| --- |
| type | 
| command | 
| messageData | 
