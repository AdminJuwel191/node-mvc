"use strict";
/* global loader: true, Type: true, CacheInterface: true, MemoryCache: true */
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    core = di.load('core'),
    StorageInterface = di.load('interface/storage'),
    component = di.load('core/component'),
    cache = component.get('storage/memory'),
    SessionStorage;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name SessionStorage
 *
 * @constructor
 * @description
 * Session storage
 */
SessionStorage = Type.create({
    config: Type.OBJECT,
    timeouts: Type.OBJECT
}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method SessionStorage#_construct
     *
     * @description
     * Set configuration for session
     * @return {object}
     */
    _construct: function SessionStorage_construct(config) {
        this.timeouts = {};
        this.config = core.extend(
            {
                cookieKey: 'testttt',
                time: 60 * 20 * 1000, // 20 min default session time
                storage: null,
                key_prefix: 'xxx'
            },
            config
        );

        if (!this.config.storage) {
            this.config.storage = cache;
        } else if (Type.isString(this.config.storage)) {
            this.config.storage = di.load(this.config.storage);
        }

        if(!(this.config.storage instanceof StorageInterface)) {
            throw new error.HttpError(500, this.config, 'Session storage must be instance of interface/storage');
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method SessionStorage#getExpiredTime
     *
     * @description
     * Get session expired tome
     * @return {object}
     */
    getExpiredTime: function SessionStorage_getExpiredTime() {
        return parseInt(this.config.time);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method SessionStorage#getCookieKey
     *
     * @description
     * Return key so we can recognize user from cookie
     * @return {object}
     */
    getCookieKey: function SessionStorage_getCookieKey() {
        return this.config.cookieKey;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method SessionStorage#set
     *
     * @description
     * Add value to cache
     * @return {object}
     */
    set: function SessionStorage_setValue(key, value) {
        var nKey = this.config.key_prefix + key,
            tKey = nKey + '_TIME';

        // if has key refresh it
        if (this.config.storage.has(nKey)) {
            // remove key
            this.config.storage.remove(nKey);
            // clear old timeout to avoid memory leak
            if (this.timeouts.hasOwnProperty(tKey) ) {
                clearTimeout(this.timeouts[tKey]);
                // remove old time key
                delete this.timeouts[tKey];
            }
        }
        // set new value
        this.config.storage.set(nKey, value, this.getExpiredTime());
        // set clear timeout
        // set id value
        this.timeouts[tKey] = setTimeout(function ()  {
            this.config.storage.remove(nKey);
            this.config.storage.remove(tKey);
        }.bind(this), this.getExpiredTime());
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method SessionStorage#get
     *
     * @description
     * Get cache value
     */
    get: function SessionStorage_getValue(key) {
        return this.config.storage.get(this.config.key_prefix + key);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method SessionStorage#remove
     *
     * @description
     * Remove key from cache
     */
    remove: function SessionStorage_remove(key) {
        var nKey = this.config.key_prefix + key,
            tKey = nKey + '_TIME';
        // clear old timeout to avoid memory leak
        if (this.timeouts.hasOwnProperty(tKey)) {
            clearTimeout(this.timeouts[tKey]);
            // remove old time key
            delete this.timeouts[tKey];
        }
        return this.config.storage.remove(nKey);
    }
});

module.exports = SessionStorage;