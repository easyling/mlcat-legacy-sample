'use strict';

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
    Entry.static.entryController.addEntryToLookup(this);

    var that = this;

    // when used clicks on the entry's label select it
    $label.click(function() {
        Entry.static.entryController.entrySelected(that);
    });

    // if user presses ENTER key, update the SlimView
    var input = $label.find('input.target');
    input.keyup(function(ev) {
        that.updateTarget.call(that);
        if ( ev.which == 13 ) {
            that.submitTargetChange.call(that);
        }
    });
}

Entry.prototype = {
    /**
     * Updates the entryTarget based on the input's value
     * @returns {string} udpated entryTarget
     */
    getUpdateTarget: function () {
        this.updateTarget();
        return this.target;
//            return mlcat.isExportSegmented() ? this.targetInternalFormat : this.target;
    },
    /**
     * Updates the Entry's target based on the DOM input value
     */
    updateTarget: function() {
        var input = this.label.find('input.target');
        this.target = input.val();
    },
    /**
     * Submit target changes to SlimView with a bit of delay
     */
    submitTargetChange: function() {
        var that = this;
        setTimeout(function(){
            console.info('Entry updated: ' + that.target);
            Entry.static.entryController.entryUpdated(that);
        }, 10);
    }
};

// "emulated static properties"
Entry.static = {
    /**
     * {EntryController}
     */
    'entryController': null
};