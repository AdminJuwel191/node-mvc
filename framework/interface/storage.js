"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    StorageInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name StorageInterface
 *
 * @constructor
 * @description
 * Storage object
 */
StorageInterface = Type.create({}, {
    _invoke: function StorageInterface() {
        ["set", "get", "remove", "has"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'CacheInterface: missing method in cache object');
            }
        }.bind(this));
    }
});

module.exports = StorageInterface;