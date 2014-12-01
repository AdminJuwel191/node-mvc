"use strict";
/* global loader: true, Type: true, CacheInterface: true, MemoryCache: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    CacheInterface = loader.load('interface/cache'),
    MemoryCache;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name MemoryCache
 *
 * @constructor
 * @description
 * Memory cache
 */
MemoryCache = CacheInterface.inherit({},{
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method MemoryCache#set
     *
     * @description
     * Add value to cache
     */
    set: function MemoryCache_setValue(key, value, ttl) {
        if (!this.cache.hasOwnProperty(key) || this.cache[key] === null) {
            this.cache[key] = value;
        } else {
            this.logger.error('Cache.add: key is already in cache', key);
        }
        if (Type.isNumber(ttl) && !isNaN(ttl) && ttl > 0) {
            setTimeout(clearCache.bind(this), ttl);
        } else {
            setTimeout(clearCache.bind(this), this.ttl);
        }
        function clearCache() {
            this.remove(key);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method MemoryCache#get
     *
     * @description
     * Get cache value
     */
    get: function MemoryCache_getValue(key, def) {
        if (this.cache.hasOwnProperty(key)) {
            return this.cache[key];
        } else if (def) {
            return def;
        }
        return null;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method MemoryCache#remove
     *
     * @description
     * Remove key from cache
     */
    remove: function MemoryCache_remove(key) {
        if (this.cache.hasOwnProperty(key)) {
            this.cache[key] = null;
        }
    }
});

module.exports = MemoryCache;