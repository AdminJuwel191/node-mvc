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
        this._requestApi.setStatusCode(code);
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
        return this._requestApi.stopPromiseChain();
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
        return this._requestApi.hasHeader(key);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getRequestBody
     *
     * @description
     * Get request body
     */
    getRequestBody: function Controller_getRequestBody() {
        return this._requestApi.getRequestBody();
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
        return this._requestApi.getRequestHeader(key);
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
        return this._requestApi.getHeaders();
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
        return this._requestApi.getMethod();
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
        return this._requestApi.getRequestHeaders();
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
        return this._requestApi.isHeaderCacheUnModified();
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
        return this._requestApi.sendNoChange();
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
        return this._requestApi.parsedUrl;
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
        return this._requestApi.createUrl(route, params);
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
        return this._requestApi.onEnd(callback);
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
        return this._requestApi.addHeader(key, value);
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
        return this._requestApi.forward(route, params);
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
        return this._requestApi.redirect(url, isTemp);
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
        return view.renderFile(pathName, locals, this._config.themesPath,  this._config.viewsPath);
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
     * @method Controller#getActionName
     *
     * @description
     * Get action name
     * @return {string}
     */
    getActionName: function Controller_getActionName() {
        return this._config.action;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getControllerName
     *
     * @description
     * Get controller name
     * @return {string}
     */
    getControllerName: function Controller_getControllerName() {
        return this._config.controller;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getModuleName
     *
     * @description
     * Get module name
     * @return {string}
     */
    getModuleName: function Controller_getModuleName() {
        return this._config.module;
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
