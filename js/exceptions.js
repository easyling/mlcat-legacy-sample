'use strict';

/**
 * Exception class, triggered when SlimView sends an envelope with unknown envelope type
 * @param {String} type
 * @constructor
 */
function InvalidEnvelopeTypeException(type) {
    this.type = type;
    this.message = 'does not conform to the expected envelope type';
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
    this.message = 'Envelope is missing a non-optional property';
    this.toString = function() {
        return this.message;
    };
}