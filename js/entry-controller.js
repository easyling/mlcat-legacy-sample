'use strict';

/**
 * Class that keeps track of all the entries for an export document
 * @param {MLCat} slimView SlimView instance to use the EntryController with
 * @constructor
 */
function EntryController(slimView) {
    this.selectedKey = $('#key');
    this.selectedTarget = $('#target');
    this.onPage = $('#page');
    this.groupTarget = $('#group-target');
    this.selectedTargetInternalFormat = $('#internal-target');
    this.selectedEntry = null;
    this.slimView = slimView;

    /* global Entry:true */
    Entry.static.entryController = this;
    MLCat.static.entryController = this;
}

EntryController.prototype = {
    /**
     * Select/highlight an entry
     * @param {Entry} entry
     * @param doNotLoad
     */
    entrySelected: function(entry, doNotLoad) {
        if(typeof doNotLoad == 'undefined')
            doNotLoad = false;
        this._toggleLabels(entry.label);
        this.updateSelectedDivs(entry);
        if(!doNotLoad) {
            console.info('Load that entry!');
            this.slimView.load(entry);
        }
        this.selectedEntry = entry;
    },
    /**
     * Update the entry's target
     * @param {Entry} entry
     */
    entryUpdated: function(entry) {
        this.updateSelectedDivs(entry);
        this.slimView.submitTargets(entry);
    },
    /**
     * Update the DOMElements for en {Entry}
     * @param {Entry} entry
     */
    updateSelectedDivs: function(entry) {
        this.selectedKey.text(entry.key);
        this.selectedTarget.text(entry.target);
        this.selectedTargetInternalFormat.text(entry.targetInternalFormat);
        this.onPage.text(entry.href);
        if(window['XLIFF']['segmented'])
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
    /**
     * Add entry to the lookup
     * @param entry
     */
    addEntryToLookup: function(entry) {
        this.entryByKey[this.key] = entry;
    },
    _toggleLabels: function(activeLabel) {
        $('label.active').toggleClass('active', false);
        activeLabel.toggleClass('active', true);
    },
    entryByKey: {}
};