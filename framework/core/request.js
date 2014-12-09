"use strict";
/* global loader: true, Promise: true, Type: true, core: true, error: true, util: true, Request: true, Controller: true */
var di = require('../di'),
    ControllerInterface = di.load('interface/controller'),
    component = di.load('core/component'),
    router = component.get('core/router'),
    hooks = component.get('hooks/request'),
    logger = component.get('core/logger'),
    URLParser = di.load('url'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    util = di.load('util'),
    Promise = di.load('promise'),
    Request;
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
Request = Type.create({
    request: Type.OBJECT,
    response: Type.OBJECT,
    parsedUrl: Type.OBJECT,
    route: Type.STRING,
    params: Type.OBJECT,
    controller: Type.STRING,
    module: Type.STRING,
    action: Type.STRING,
    statusCode: Type.NUMBER,
    forwardUrl: Type.STRING,
    headers: Type.OBJECT,
    isRendered: Type.BOOLEAN
}, {
    _construct: function Request(config, url) {
        core.extend(this, config);
        this.statusCode = 200;
        this.headers = {};
        this.parsedUrl = URLParser.parse(url, true);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#addHeader
     *
     * @description
     * Write header
     */
    onEnd: function Request_onEnd(callback) {
        this.request.on('end', callback);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#isHeaderModified
     *
     * @description
     * Check if header is modified
     * @return {boolean}
     */
    isHeaderCacheUnModified: function Request_isHeaderCacheUnModified() {

        var etagMatches = true,
            notModified = true,
            modifiedSince = this.getRequestHeader('if-modified-since'),
            noneMatch = this.getRequestHeader('if-none-match'),
            cc = this.getRequestHeader('cache-control'),
            lastModified = this.getHeader('last-modified'),
            etag = this.getHeader('etag');


        // unconditional request
        if (!modifiedSince && !noneMatch) {
            return false;
            // check for no-cache cache request directive
        } else if (cc && cc.indexOf('no-cache') !== -1) {
            return false;
        }

        // parse if-none-match
        if (noneMatch) {
            noneMatch = noneMatch.split(/ *, */);
        }
        // if-none-match
        if (noneMatch) {
            etagMatches = ~noneMatch.indexOf(etag) || '*' == noneMatch[0];
        }
        // if-modified-since
        if (modifiedSince) {
            modifiedSince = Date.parse(modifiedSince);
            lastModified = Date.parse(lastModified);
            notModified = lastModified <= modifiedSince;
        }

        return !!(etagMatches && notModified);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getHeaders
     *
     * @description
     * Return headers
     */
    getHeaders: function Request_getHeaders() {
        return core.copy(this.headers);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getRequestHeaders
     *
     * @description
     * Return request headers
     */
    getRequestHeaders: function Request_getRequestHeaders() {
        return core.copy(this.request.headers);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getRequestHeader
     *
     * @description
     * Get request header
     */
    getRequestHeader: function Request_getRequestHeader(key) {
        if (Type.isString(key)) {
            return this.request.headers[key.toLowerCase()];
        } else {
            throw new error.HttpError(500, {key: key}, "Request.hasHeader: Header key must be string type");
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getHeader
     *
     * @description
     * Return header
     */
    getHeader: function Request_getHeader(key) {
        if (this.hasHeader(key)) {
            return this.headers[key.toLowerCase()];
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#hasHeader
     *
     * @description
     * Has header
     */
    hasHeader: function Request_hasHeader(key) {
        if (Type.isString(key)) {
            return this.headers.hasOwnProperty(key.toLowerCase());
        } else {
            throw new error.HttpError(500, {key: key}, "Request.hasHeader: Header key must be string type");
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#addHeader
     *
     * @description
     * Write header
     */
    addHeader: function Request_addHeader(key, value) {
        if (Type.isString(key)) {
            this.headers[key.toLowerCase()] = value;
        } else {
            throw new error.HttpError(500, {
                key: key,
                value: value
            }, "Request.addHeader: Header key and value must be string type");
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#forward
     *
     * @description
     * Forward to route
     */
    forward: function Request_forward(route, params) {
        var request;
        if (router.trim(this.route, "/") === router.trim(route, '/')) {
            throw new error.HttpError(500, {route: route, params: params}, 'Cannot forward to same route');
        } else {

            request = new Request({
                request: this.request,
                response: this.response
            }, router.createUrl(route, params));

            logger.print('Request.forward', route, params);

            return request.parse();
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#redirect
     *
     * @description
     * Redirect request
     */
    redirect: function Request_redirect(url, isTemp) {
        logger.print('Request.redirect', url, isTemp);
        this.addHeader('Location', url);
        if (Type.isBoolean(isTemp) && !!isTemp) {
            this.response.writeHead(302, this.headers);
        } else {
            this.response.writeHead(301, this.headers);
        }
        this.response.end('Redirect to:' + url);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#noChange
     *
     * @description
     * No change header
     */
    sendNoChange: function () {
        this.response.writeHead(304);
        this.response.end();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_checkContentType
     *
     * @description
     * Checks content type header and if no present set default one to text/html
     */
    _checkContentType: function (type) {
        if (!this.hasHeader('Content-Type')) {
            this.addHeader('Content-Type', Type.isString(type) ? type : 'text/plain');
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#end
     *
     * @description
     * End request
     */
    _render: function Request__render(response) {

        if (!this.isRendered) {

            logger.print('Request.render', response);

            this._checkContentType('text/html');

            if (response instanceof Error) {
                if (response.code) {
                    this.statusCode = response.code;
                } else {
                    this.statusCode = 500;
                }
                this.response.writeHead(this.statusCode, this.headers);
                if (response.trace) {
                    this.response.end(response.trace);
                } else {
                    this.response.end(util.inspect(response));
                }

            } else if (Type.isString(response)) {
                this.addHeader('Content-Length', response.length);
                this.response.end(response);
            } else if (response instanceof Buffer) {
                this.addHeader('Content-Length', response.length);
                this.response.end(response);
            } else if (!response) {
                throw new error.HttpError(500, {}, 'No data to render');
            } else {
                throw new error.HttpError(500, {}, 'Invalid response type, it must be string!!');
            }
        }

        this.isRendered = true;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getMethod
     *
     * @description
     * Return current request method
     */
    getMethod: function Request_getMethod() {
        return this.request.method;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getApi
     *
     * @description
     * Return api for controller/hooks
     */
    _getApi: function Request_getApi() {
        return {
            redirect: this.redirect.bind(this),
            forward: this.forward.bind(this),
            hasHeader: this.hasHeader.bind(this),
            addHeader: this.addHeader.bind(this),
            getHeaders: this.getHeaders.bind(this),
            getMethod: this.getMethod.bind(this),
            getRequestHeaders: this.getRequestHeaders.bind(this),
            getRequestHeader: this.getRequestHeader.bind(this),
            isHeaderCacheUnModified: this.isHeaderCacheUnModified.bind(this),
            onEnd: this.onEnd.bind(this),
            sendNoChange: this.sendNoChange.bind(this),
            createUrl: router.createUrl.bind(router),
            parsedUrl: core.copy(this.parsedUrl)
        };
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_chain
     *
     * @description
     * Chain promises
     */
    _chain: function Request__chain(promise, next) {
        if (!promise) {
            return Promise.resolve(_handler());
        }
        return promise.then(function (data) {
            return Promise.resolve(_handler(data));
        }, this._handleError.bind(this));

        function _handler() {
            try {
                return next.apply(next, arguments);
            } catch (e) {
                throw new error.HttpError(500, arguments, "Error on executing action", e);
            }
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_handleRoute
     *
     * @description
     * Load response
     */
    _handleRoute: function Request_handleRoute() {
        var controllerToLoad = '@{controllersPath}/' + this.controller,
            LoadedController,
            controller,
            action,
            promise;

        try {
            LoadedController = di.load(controllerToLoad);
        } catch (e) {
            throw new error.HttpError(500, {path: controllerToLoad}, 'Missing controller', e);
        }

        controller = new LoadedController(this._getApi());

        if (!(controller instanceof  ControllerInterface)) {
            throw new error.HttpError(500, controller, 'Controller must be instance of ControllerInterface "core/controller"');
        }

        logger.print('LoadRequest', {
            controller: controller.__dynamic__,
            controllerToLoad: controllerToLoad,
            route: {
                controller: this.controller,
                action: this.action,
                module: this.module,
                params: this.params
            }
        });

        if (controller.hasAction("beforeEach")) {
            promise = this._chain(null, controller.beforeEach.bind(controller, this.action, this.params));
        }

        if (controller.hasAction('before_' + this.action)) {
            promise = this._chain(promise, controller.getAction('before_' + this.action).bind(controller, this.params));
        }

        if (controller.hasAction('action_' + this.action)) {
            promise = this._chain(promise, controller.getAction('action_' + this.action).bind(controller, this.params));
        } else {
            throw new error.HttpError(500, {
                controller: controller,
                hasAction: controller.hasAction(this.action),
                route: {
                    controller: this.controller,
                    action: this.action,
                    module: this.module,
                    params: this.params
                }
            }, 'Missing action in controller');
        }


        if (controller.hasAction('after_' + this.action)) {
            promise = this._chain(promise, controller.getAction('after_' + this.action).bind(controller, this.params));
        }

        if (controller.hasAction("afterEach")) {
            promise = this._chain(promise, controller.afterEach.bind(controller, this.action, this.params));
        }

        this.onEnd(controller.destroy.bind(controller));

        return promise;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#parseRequest
     *
     * @description
     * Parse request
     */
    parse: function Request_parse() {

        return hooks.process(this._getApi())
            .then(function handleHooks(data) {
                if (Type.isInitialized(data) && !!data) {
                    return data;
                }
                return router
                    .process(this.request.method, this.parsedUrl) // find route
                    .then(this._resolveRoute.bind(this), this._handleError.bind(this)); // resolve route chain

            }.bind(this), this._handleError.bind(this))
            .then(this._render.bind(this), this._handleError.bind(this))  // render chain
            .then(this._render.bind(this), this._handleError.bind(this)); // render error thrown in render function
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_resolveRoute
     *
     * @description
     * Resolve valid route
     * @return {object} Promise
     */
    _resolveRoute: function Request__resolveRoute(routeRule) {
        var route;
        this.statusCode = 200;
        this.route = routeRule.shift();
        this.params = routeRule.shift();
        route = this.route.split('/');
        if (route.length === 3) {
            this.module = route.shift();
        }
        this.controller = route.shift();
        this.action = route.shift();

        return this._handleRoute();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#handleError
     *
     * @description
     * Handle error
     */
    _handleError: function Request_handleError(data) {
        this.statusCode = 500;
        this._checkContentType('text/plain');
        return this._render(data);
    }
});


module.exports = Request;