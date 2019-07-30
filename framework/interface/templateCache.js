"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    CacheInterface;
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
CacheInterface = Type.create({}, {
    _invoke: function CacheInterface() {
        ["set", "get"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'CacheInterface: missing method in cache object');
            }
        }.bind(this));
    }
});

module.exports = CacheInterface;
