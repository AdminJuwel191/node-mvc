"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    RequestHooksInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name RequestHooksInterface
 *
 * @constructor
 * @description
 * Request hooks interface
 */
RequestHooksInterface = Type.create({
    hooks: Type.ARRAY
}, {
    _invoke: function RequestHooksInterface() {
        this.hooks = [];
        ["set", "get", "has", "match", "process"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'RequestHooksInterface: missing method in Hook class');
            }
        }.bind(this));
    }
});

module.exports = RequestHooksInterface;