"use strict";
/* global loader: true, Type: true, Controller: true */
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    component = di.load('core/component'),
    ControllerInterface = di.load('interface/controller'),
    BodyParser = di.load('core/bodyParser'),
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
Controller = ControllerInterface.inherit({
    __cookies__: Type.OBJECT
}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#setStatusCode
     * @param code {number}
     * @description
     * Set status code
     */
    setStatusCode: function Controller_setStatusCode(code) {
        this.__requestApi__.setStatusCode(code);
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
        return this.__requestApi__.stopPromiseChain();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#hasHeader
     * @param key {string}
     * @description
     * has response header
     */
    hasHeader: function Controller_hasHeader(key) {
        return this.__requestApi__.hasHeader(key);
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
        return this.__requestApi__.getRequestBody();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getRequestHeader
     * @param key {string}
     * @description
     * Get request header
     */
    getRequestHeader: function Controller_getRequestHeader(key) {
        return this.__requestApi__.getRequestHeader(key);
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
        return this.__requestApi__.getHeaders();
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
        return this.__requestApi__.getMethod();
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
        return this.__requestApi__.getRequestHeaders();
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
        return this.__requestApi__.isHeaderCacheUnModified();
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
        return this.__requestApi__.sendNoChange();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getRequestUrl
     *
     * @description
     * Return request url
     */
    getRequestUrl: function Controller_getRequestUrl() {
        return this.__requestApi__.url;
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
        return this.__requestApi__.parsedUrl;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#onEnd
     * @param route {string}
     * @param params {object}
     * @description
     * Create an url depends on route an parameters to router service
     */
    createUrl: function Controller_createUrl(route, params) {
        return this.__requestApi__.createUrl(route, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#onEnd
     * @param callback {function}
     * @description
     * On end exec callback
     */
    onEnd: function Controller_onEnd(callback) {
        return this.__requestApi__.onEnd(callback);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#addHeader
     * @param key {string}
     * @param value {string}
     * @description
     * Add header to request
     */
    addHeader: function Controller_addHeader(key, value) {
        return this.__requestApi__.addHeader(key, value);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#forward
     * @param route {string}
     * @param params {object}
     * @description
     * Redirect to some url
     */
    forward: function Controller_forward(route, params) {
        return this.__requestApi__.forward(route, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#forwardUrl
     * @param url {string}
     * @description
     * Redirect to some url
     */
    forwardUrl: function Controller_forwardUrl(url) {
        return this.__requestApi__.forwardUrl(url);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#redirect
     * @param url {string}
     * @param isTemp {boolean}
     * @description
     * Redirect to some url
     */
    redirect: function Controller_redirect(url, isTemp) {
        return this.__requestApi__.redirect(url, isTemp);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#renderFile
     * @param pathName {string}
     * @param locals {object}
     * @description
     * Render file
     */
    renderFile: function Controller_renderFile(pathName, locals) {
        return view.renderFile(pathName, locals, this.__config__.viewsPath);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#render
     * @param source {string}
     * @param locals {object}
     * @param escape {boolean}
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
        return this.__config__.action;
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
        return this.__config__.controller;
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
        return this.__config__.module;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getSession
     * @param key {string}
     * @description
     * Get session key
     * @return {string}
     */
    getSession: function Controller_getSession(key) {
        var session = component.get('storage/session'),
            session_id = this.getCookie(session.getCookieKey());

        if (Type.isString(key)) {
            return session.get(session_id + key);
        }

        throw new error.HttpError(500, {key: key, session_id: session_id}, 'Controller.getSession: key must be string type');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#setSession key value
     * @param key {string}
     * @param value {object|mixed}
     * @description
     * Set session
     * @return {string}
     */
    setSession: function Controller_setSession(key, value) {
        var session = component.get('storage/session'),
            session_id = this.getCookie(session.getCookieKey());
        if (!Type.isString(key)) {
            throw new error.HttpError(500, {key: key, session_id: session_id}, 'Controller.getSession: key must be string type');
        } else if (!session_id) {
            session_id = this.__requestApi__.uuid() + '_' + (new Date).getTime();
            this.setCookie(session.getCookieKey(), session_id, session.getExpiredTime());
        }
        session.set(session_id + key, value);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#removeSession
     * @param key {string}
     * @description
     * Remove session key
     * @return {string}
     */
    removeSession: function Controller_removeSession(key) {
        var session = component.get('storage/session'),
            session_id = this.getCookie(session.getCookieKey());

        if (Type.isString(key)) {
            return session.remove(session_id + key);
        }

        throw new error.HttpError(500, {key: key, session_id: session_id}, 'Controller.removeSession: key must be string type');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#setCookie
     * @param key {string}
     * @param value {string}
     * @param expires {string|object|number}
     * @param path {string}
     * @param domain {string}
     * @param isHttpOnly {boolean}
     * @description
     * Set cookie header
     */
    setCookie: function Controller_setCookie(key, value, expires, path, domain, isHttpOnly) {
        var cookie, date;

        if (Type.isUndefined(key) || Type.isUndefined(value)) {
            throw new error.HttpError(500, {
                key: key,
                value: value,
                expires: expires,
                path: path,
                domain: domain,
                isHttpOnly: isHttpOnly
            }, 'Controller.setCookie: Key and Value must be provided!');
        }

        cookie = key + "=" + value;

        if (!!expires) {
            if (Type.isNumber(expires)) {
                date = new Date();
                date.setTime(date.getTime() + expires);
                cookie += "; Expires=" + date.toGMTString();
            } else if (Type.isString(expires)) {
                cookie += "; Expires=" + expires;
            } else if (Type.isDate(expires)) {
                cookie += "; Expires=" + expires.toGMTString();
            }
        }

        if (!!path) {
            cookie += "; Path=" + path;
        }

        if (!!domain) {
            cookie += "; Domain=" + domain;
        }

        if (!!isHttpOnly) {
            cookie += "; HttpOnly";
        }
        this.addHeader('Set-cookie', cookie);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getCookies
     *
     * @description
     * Parse cookies
     * @return {object}
     */
    getCookies: function Controller_getCookies() {
        var data;
        if (!!this.__cookies__) {
            return this.__cookies__;
        }
        this.__cookies__ = {};
        data = this.getRequestHeader('Cookie');
        if (!!data) {
            data.replace(/(\w+[^=]+)=([^;]+)/g, function (cookie, key, value) {
                this.__cookies__[key] = value;
            }.bind(this));
        }
        return this.__cookies__;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getCookie
     * @param key {string}
     * @description
     * Get all cookies
     * @return {null|string}
     */
    getCookie: function Controller_getCookie(key) {
        var cookies = this.getCookies();
        if (cookies.hasOwnProperty(key)) {
            return cookies[key];
        }
        return null;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getParsedBody
     *
     * @description
     * Parse body and return parsed object
     * @return {object}
     */
    getParsedBody: function Controller_getParsedBody() {
        var parser = new BodyParser(
            this.getRequestHeader('content-type'),
            this.getRequestBody()
        );
        parser.parse();
        return parser.getBody();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#hasAction
     * @param name {string}
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
     * @param name {string}
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
