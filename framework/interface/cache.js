"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    CacheInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Cache
 *
 * @constructor
 * @description
 * Cache object
 */
CacheInterface = Type.create({
    cache: Type.OBJECT,
    config: Type.OBJECT,
    ttl: Type.NUMBER
}, {
    _invoke: function CacheInterface(config) {
        this.cache = {};
        this.config = config;
        this.ttl = 1000 * 60 * 60; // one hour
        ["set", "get", "remove"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'CacheInterface: missing method in cache object');
            }
        }.bind(this));
    }
});

module.exports = CacheInterface;