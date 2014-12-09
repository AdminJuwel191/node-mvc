"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    RequestHooksInterface = di.load('interface/requestHooks'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
    Promise = di.load('promise'),
    RequestHooks;


/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Request
 *
 * @constructor
 * @description
 * Handle request
 */
RequestHooks = RequestHooksInterface.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RequestHooks#add
     *
     * @description
     * Add a hook
     */
    set: function RequestHooks_set(key, value) {
        if (this.has(key)) {
            throw new error.DataError({key: key, value: value}, "RequestHooks.add hook already exists");
        } else if (!Type.isFunction(value)) {
            throw new error.DataError({key: key, value: value}, "RequestHooks.add hook value must be function type");
        }
        this.hooks[key] = value;
        logger.print('RequestHooks.add', key, value.toString());
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RequestHooks#has
     *
     * @description
     * Has a hook
     */
    get: function RequestHooks_get(key) {
        if (this.has(key)) {
            return this.hooks[key];
        }
        throw new error.HttpError(500, {key: key}, "RequestHooks.get hook not found");
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RequestHooks#has
     *
     * @description
     * Has a hook
     */
    has: function RequestHooks_has(key) {
        return this.hooks.hasOwnProperty(key);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RequestHooks#remove
     *
     * @description
     * Remove hook
     */
    remove: function RequestHooks_remove(key) {
        if (this.has(key)) {
            delete this.hooks[key];
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RequestHooks#process
     *
     * @description
     * Process hook
     */
    process: function RequestHooks_process(api) {
        var that = this, route = api.parsedUrl.pathname;
        logger.print('RequestHooks.process', route);
        return new Promise(function (resolve) {
            if (that.has(route)) {
                try {
                    resolve(that.get(route)(api));
                } catch (e) {
                    throw new error.HttpError(500, {hook: route}, 'Hook error', e);
                }
            } else {
                resolve(false);
            }
        });
    }
});


module.exports = RequestHooks;