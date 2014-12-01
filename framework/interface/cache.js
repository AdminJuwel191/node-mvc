"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    error = loader.load('error'),
    CacheInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Cache
 *
 * @constructor
 * @description
 * Cache class
 */
CacheInterface = Type.create({
    cache: Type.OBJECT,
    logger: Type.OBJECT,
    config: Type.OBJECT,
    ttl: Type.NUMBER
}, {
    _invoke: function CacheInterface(api, config) {
        this.cache = {};
        this.logger = api.getComponent('core/logger');
        this.config = config;
        this.ttl = 1000 * 60 * 60; // one hour
        ["set", "get", "remove"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'CacheInterface: missing method in cache class');
            }
        }.bind(this));
    }
});

module.exports = CacheInterface;