'use strict';

/* global SlimView, EntryController, Entry */

$(function() {
    // set internal states to "start"
    SlimView.internalStates = Object.freeze({notReady: {}, initialized: {}, slimViewLoaded: {}, slimViewReady: {}});
    var slimView = new SlimView();

    // If there is a &token=ASD defined for the example application, assume the user wants to emulate
    // desktop integration. This is not required to web-integrations
    var queryParams = parseAndGetQueryParams();

    if ('token' in queryParams) {
        slimView.emulateDesktopAccessToken(queryParams['token']);
    } else if ('oauth' in queryParams) {
        slimView.useOAuth2();
    }

    // create some support classes
    var entryController = new EntryController(slimView);
    // start slimView
    slimView.init();

    var allLabels = $('label');
    allLabels.each(function() {
        var $label = $(this);
        var key = $label.attr('data-key');
        var page = $label.attr('data-page');
        var groupTarget = $label.attr('data-group-target');
        var targetInernal = $label.attr('data-internal-target');
        var target = $label.find('input.target').val();

        var entry = new Entry(key, target, page, groupTarget, targetInernal, $label);
        entryController.entries.push(entry);
    });

    $('#partial-update-button').click(function() {
        entryController.runPartialUpdate.apply(entryController);
    });
    $('#freeclick').click(function() {
        slimView.setFreeclick();
    });
    $('#update-all').click(function() {
        entryController.updateAllEntries();
    });
});