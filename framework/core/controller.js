"use strict";
/* global loader: true, Type: true, Controller: true */
var di = require('../di'),
    Type = di.load('typejs'),
    component = di.load('core/component'),
    ControllerInterface = di.load('interface/controller'),
    view = component.get('core/view'),
    Controller;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Controller
 *
 * @constructor
 * @description
 * Controller is a collection of Controller
 */
Controller = ControllerInterface.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#setStatusCode
     *
     * @description
     * Set status code
     */
    setStatusCode: function Controller_setStatusCode(code) {
        this._request.setStatusCode(code);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#stopChain
     *
     * @description
     * Stop promise chain
     */
    stopChain: function Controller_stopChain() {
        return this._request.stopPromiseChain();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#hasHeader
     *
     * @description
     * has response header
     */
    hasHeader: function Controller_hasHeader(key) {
        return this._request.hasHeader(key);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getRequestHeader
     *
     * @description
     * Get request header
     */
    getRequestHeader: function Controller_getRequestHeader(key) {
        return this._request.getRequestHeader(key);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getHeaders
     *
     * @description
     * Return response headers
     */
    getHeaders: function Controller_getHeaders() {
        return this._request.getHeaders();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getMethod
     *
     * @description
     * Return request method
     */
    getMethod: function Controller_getMethod() {
        return this._request.getMethod();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getRequestHeaders
     *
     * @description
     * Return request headers
     */
    getRequestHeaders: function Controller_getRequestHeaders() {
        return this._request.getRequestHeaders();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#isHeaderCacheUnModified
     *
     * @description
     * Check if cache is unmodified
     */
    isHeaderCacheUnModified: function Controller_isHeaderCacheUnModified() {
        return this._request.isHeaderCacheUnModified();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#sendNoChange
     *
     * @description
     * Send no change 304 response
     */
    sendNoChange: function Controller_sendNoChange() {
        return this._request.sendNoChange();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getParsedUrl
     *
     * @description
     * Return parsed url
     */
    getParsedUrl: function Controller_getParsedUrl() {
        return this._request.parsedUrl;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#onEnd
     *
     * @description
     * On end
     */
    createUrl: function Controller_createUrl(route, params) {
        return this._request.createUrl(route, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#onEnd
     *
     * @description
     * On end
     */
    onEnd: function Controller_onEnd(callback) {
        return this._request.onEnd(callback);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#addHeader
     *
     * @description
     * Add header to request
     */
    addHeader: function Controller_addHeader(key, value) {
        return this._request.addHeader(key, value);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#forward
     *
     * @description
     * Redirect to some url
     */
    forward: function Controller_forward(route, params) {
        return this._request.forward(route, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#redirect
     *
     * @description
     * Redirect to some url
     */
    redirect: function Controller_redirect(url, isTemp) {
        return this._request.redirect(url, isTemp);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#renderFile
     *
     * @description
     * Render file
     */
    renderFile: function Controller_renderFile(pathName, locals) {
        return view.renderFile(pathName, locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#render
     *
     * @description
     * Render view
     */
    render: function Controller_render(source, locals, escape) {
        return view.render(source, locals, escape);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#hasAction
     *
     * @description
     * Check if controller have action
     * @return {boolean}
     */
    has: function Controller_has(name) {
        return (name in this);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getAction
     *
     * @description
     * Get controller action
     * @return {object}
     */
    get: function Controller_get(name) {
        if (Type.isFunction(this[name])) {
            return this[name];
        }
        return false;
    }
});


// export Controller object
module.exports = Controller;
