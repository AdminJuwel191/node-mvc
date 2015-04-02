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
        this.hooks.push({
            key: key,
            func: value
        });

        logger.info('RequestHooks.set:', {
            key: key,
            func: value.toString()
        });
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RequestHooks#get
     *
     * @description
     * Get hook
     * @return {object}
     */
    get: function RequestHooks_get(value) {
        if (!Type.isString(value)) {
            throw new error.DataError({value: value}, "RequestHooks.get value must be string type");
        }
        return this.hooks.filter(function (item) {
            return item.key.test(value);
        }).shift();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method RequestHooks#has
     *
     * @description
     * Has a hook
     * @return {boolean}
     */
    has: function RequestHooks_has(regex) {
        if (!Type.isRegExp(regex)) {
            throw new error.DataError({regex: regex}, "RequestHooks.has regex must be regex type");
        }
        return !!this.hooks.filter(function (item) {
            return item.key.source === regex.source;
        }).shift();
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
        logger.info('RequestHooks.process:', route);
        return new Promise(function (resolve, reject) {
            var hook;
            try {
                hook = that.get(route);
                logger.info('RequestHooks.hook:', hook);
                if (!!hook) {
                    resolve(hook.func(api));
                } else {
                    resolve(false);
                }
            } catch (e) {
                logger.error('RequestHooks.hook:', {
                    hook: hook,
                    e: e
                });
                reject(new error.HttpError(500, {hook: route}, 'Hook error', e));
            }
        });
    }
});


module.exports = RequestHooks;