"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    error = loader.load('error'),
    ConfigInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ConfigInterface
 *
 * @constructor
 * @description
 * config class
 */
ConfigInterface = Type.create({
    components: Type.OBJECT
}, {
    _invoke: function ConfigInterface() {
        ["set", "get"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'ConfigInterface: missing method in config class');
            }
        }.bind(this));
    }
});

module.exports = ConfigInterface;