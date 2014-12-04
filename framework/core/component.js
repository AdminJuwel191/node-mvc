"use strict";
/* global loader: true, Type: true, CacheInterface: true, MemoryCache: true */
var di = require('../di'),
    error = di.load('error'),
    Type = di.load('typejs'),
    ComponentInterface = di.load('interface/component'),
    Component;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Component
 *
 * @constructor
 * @description
 * Component
 */
Component = ComponentInterface.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Component#set
     *
     * @description
     * Set component to system
     */
    set: function Component_set(name, config, Func) {
        if (!this.has(name)) {
            try {
                if (!Type.isFunction(Func)) {
                    if (config.filePath) {
                        Func = di.load(config.filePath);
                    } else {
                        Func = di.load(name);
                    }
                }
                this.components[name] = new Func(config);
            } catch (e) {
                throw new error.Exception('Component "' + name + '" is not initialized', e);
            }
        } else {
            throw new error.DataError(config, 'Component "' + name + '" already exist in system');
        }
        return this.get(name);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Component#has
     *
     * @description
     * Has component
     */
    has: function (name) {
        return this.components.hasOwnProperty(name);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Component#get
     *
     * @description
     * Get component from system
     */
    get: function Component_get(name) {
        if (this.has(name)) {
            return this.components[name];
        }
        throw new error.DataError({name: name}, 'Component "' + name + '" is not registered in system');
    }
});

module.exports = new Component;