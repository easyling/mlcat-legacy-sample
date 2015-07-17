'use strict';

/* global MLCat, EntryController, Entry */

$(function(){
    // set internal states to "start"
    MLCat.internalStates = Object.freeze({notReady: {}, initialized: {}, slimViewLoaded: {}, slimViewReady:{} });

    var mlcat = new MLCat();
    // create some support classes
    var entryController = new EntryController(mlcat);
    // start slimView
    mlcat.init();

    var allLabels = $('label');
    allLabels.each(function() {
        var $label = $(this);
        var key = $label.attr('data-key');
        var page = $label.attr('data-page');
        var groupTarget = $label.attr('data-group-target');
        var targetInernal = $label.attr('data-internal-target');
        var target = $label.find('input.target').val();
        new Entry(key, target, page, groupTarget, targetInernal, $label);
    });

    $('#partial-update-button').click(function() { entryController.runPartialUpdate.apply(entryController); });
    $('#freeclick').click(function(){
        mlcat.setFreeclick();
    });
});