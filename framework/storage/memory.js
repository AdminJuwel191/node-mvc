"use strict";
/* global loader: true, Type: true, CacheInterface: true, MemoryCache: true */
var di = require('../di'),
    Type = di.load('typejs'),
    CacheInterface = di.load('interface/cache'),
    error = di.load('error'),
    core = di.load('core'),
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
MemoryCache = CacheInterface.inherit({
    cache: Type.OBJECT,
    config: Type.OBJECT
}, {
    _construct: function (config) {
        this.cache = {};
        this.config = core.extend({
            ttl:  1000 * 60 * 60,
            timeKeyPrefix: 'CACHE_CLEAR_TIME_ID_'
        }, config);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method MemoryCache#has
     *
     * @description
     * Has cached value
     * @return {object}
     */
    has: function (key) {
        return this.cache.hasOwnProperty(key) && this.cache[key] !== null;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method MemoryCache#set
     *
     * @description
     * Add value to cache
     * @return {object}
     */
    set: function MemoryCache_setValue(key, value, ttl) {
        var id;
        if (!this.has(key)) {
            this.cache[key] = value;
        } else {
            return false;
        }

        if (Type.isNumber(ttl) && !isNaN(ttl) && ttl > 0) {
            id = setTimeout(clearCache.bind(this), ttl);
        } else {
            id = setTimeout(clearCache.bind(this), this.config.ttl);
        }

        this.cache[this.config.timeKeyPrefix + key] = id;

        function clearCache() {
            this.remove(key);
        }

        return true;
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
        if (this.has(key)) {
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
        if (this.has(key)) {
            this.cache[key] = null;
            clearTimeout(this.cache[this.config.timeKeyPrefix + key]);
            this.cache[this.config.timeKeyPrefix + key] = null;
        }
    }
});

module.exports = MemoryCache;