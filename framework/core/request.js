"use strict";
/* global loader: true, Promise: true, Type: true, core: true, error: true, util: true, Request: true, Controller: true */
var di = require('../di'),
    ControllerInterface = di.load('interface/controller'),
    ModuleInterface = di.load('interface/module'),
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
    url: Type.STRING,
    parsedUrl: Type.OBJECT,
    route: Type.STRING,
    params: Type.OBJECT,
    controller: Type.STRING,
    module: Type.STRING,
    action: Type.STRING,
    statusCode: Type.NUMBER,
    headers: Type.OBJECT,
    isRendered: Type.BOOLEAN,
    isERROR: Type.BOOLEAN,
    isPromiseChainStopped: Type.BOOLEAN,
    isForwarded: Type.BOOLEAN,
    encoding: Type.STRING,
    body: Type.STRING,
    id: Type.STRING
}, {
    _construct: function Request(config, url) {
        this.isForwarded = false;
        this.body = '';
        this.isERROR = false;
        // body and isForwarded can be overriden
        core.extend(this, config);

        this.statusCode = 200;
        this.headers = {};
        this.url = url;
        this.parsedUrl = URLParser.parse(this.url, true);
        this.isPromiseChainStopped = false;
        this.isRendered = false;
        this.id = this._uuid();
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
        this.request.on('destory', callback);
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
     * @method Request#setStatusCode
     *
     * @description
     * HTTP status code
     */
    setStatusCode: function Request_setStatusCode(code) {
        if (!Type.isNumber(code)) {
            throw new error.HttpError(500, {code: code}, "Status code must be number type");
        }
        this.statusCode = code;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#stopPromiseChain
     *
     * @description
     * Stop promise chain
     */
    stopPromiseChain: function Request_stopPromiseChain() {
        this.isPromiseChainStopped = true;
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
     * @method Request#getRequestBody
     *
     * @description
     * Return body data
     */
    getRequestBody: function Request_getRequestBody() {
        return this.body;
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
            throw new error.HttpError(500, {key: key}, "Request.getRequestHeader: Header key must be string type");
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getHeader
     *
     * @description
     * Return header
     * @return {object}
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
            this.headers[key.toLowerCase()] = Type.isString(value) ? value : value.toString();
        } else {
            throw new error.HttpError(500, {
                key: key,
                value: value
            }, "Request.addHeader: Header key must be string type");
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#forwardUrl
     *
     * @description
     * Forward to route
     */
    forwardUrl: function Request_forwardUrl(url) {
        var request;
        if (this.url === url) {
            throw new error.HttpError(500, {
                url: url
            }, 'Cannot forward to same url');
        } else {
            this.stopPromiseChain();
            request = new Request({
                request: this.request,
                response: this.response,
                isForwarded: true,
                body: this.body
            }, url);

            logger.print('Request.forward.url', url);

            return request.parse();
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
            throw new error.HttpError(500, {
                route: route,
                params: params
            }, 'Cannot forward to same route');
        } else {

            this.stopPromiseChain();

            request = new Request({
                request: this.request,
                response: this.response,
                isForwarded: true,
                body: this.body
            }, router.createUrl(route, params));

            logger.print('Request.forward.route', route, params);

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
        this.stopPromiseChain();
        this.isRendered = true;
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
        this.stopPromiseChain();
        this.setStatusCode(304);
        this._render('');
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
     * @method Request#parseRequest
     *
     * @description
     * Parse request
     */
    parse: function Request_parse() {

        if (this.isForwarded) {
            return this._process().then(
                this.request.emit.bind(this.request, 'destory'),
                this.request.emit.bind(this.request, 'destory')
            );  // emit destroy on error and resolve
        }

        this.request.setEncoding(this.encoding);
        this.request.on('data', function (body) {
            this.body += body;
        }.bind(this));

        return new Promise(this.request.on.bind(this.request, 'end'))
            .then(this._process.bind(this))
            .then(
            this.request.emit.bind(this.request, 'destory'),
            this.request.emit.bind(this.request, 'destory')
        );  // emit destroy on error and resolve
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_uuid
     *
     * @description
     * Generate uuid
     */
    _uuid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_process
     *
     * @description
     * Process request
     */
    _process: function () {
        return hooks.process(this._getApi())
            .then(function handleHooks(data) {
                if (Type.isInitialized(data) && !!data) {
                    return data;
                } else if (this.isPromiseChainStopped) {
                    return false;
                }
                return router
                    .process(this.request.method, this.parsedUrl) // find route
                    .then(this._resolveRoute.bind(this)); // resolve route chain

            }.bind(this)) // handle hook chain
            .then(this._render.bind(this)) // resolve route chain
            .catch(this._handleError.bind(this)) // catch hook error
            .then(this._render.bind(this)) // render hook error
            .catch(this._handleError.bind(this)) // catch render error
            .then(this._render.bind(this)); // resolve render error
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
     * @method Request#_handleError
     *
     * @description
     * Handle error
     * @return boolean
     */
    _handleError: function Request_handleError(response) {
        var request;

        if (this.isRendered) {
            // we have multiple recursion in parse for catching
            return false;
        }
        // log error request
        logger.print('Request.error', {
            url: this.url,
            status: this.statusCode,
            id: this.id,
            isRendered: this.isRendered,
            content_type: this.getHeader('content-type')
        }, response);
        // set status codes
        if (response.code) {
            this.setStatusCode(response.code);
        } else {
            this.setStatusCode(500);
        }
        // stop current chain!!!
        this.stopPromiseChain();

        if (response instanceof Error && !this.isERROR && !!router.getErrorRoute()) {
            // return new request
            request = new Request({
                request: this.request,
                response: this.response,
                isForwarded: true,
                body: this.body,
                isERROR: true
            }, router.createUrl(router.getErrorRoute()));
            // pass exception response over parsed url query as query parameter
            request.parsedUrl.query.exception = response;
            // set status codes for new request
            if (response.code) {
                request.setStatusCode(response.code);
            } else {
                request.setStatusCode(500);
            }
            // return parsed request
            return request.parse();
        } else if (response.trace) {
            this.addHeader('Content-Type', 'text/plain');
            return this._render(response.trace);
        } else if (response.stack) {
            this.addHeader('Content-Type', 'text/plain');
            return this._render(response.stack);
        } else if (this.isERROR) {
            this.addHeader('Content-Type', 'text/plain');
            return this._render(util.inspect(response));
        } else {
            return this._render(response);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#end
     *
     * @description
     * End request
     * @return boolean
     */
    _render: function Request__render(response) {

        if (this.isRendered) {
            return false;
        }

        this._checkContentType('text/html');

        this.response.writeHead(this.statusCode, this.headers);

        if (Type.isString(response)) {
            this.addHeader('Content-Length', response.length);
            this.response.end(response);
        } else if (response instanceof Buffer) {
            this.addHeader('Content-Length', response.length);
            this.response.end(response);
        } else if (!response) {
            throw new error.HttpError(500, {}, 'No data to render');
        } else {
            throw new error.HttpError(500, {}, 'Invalid response type, string or buffer is required!');
        }

        logger.print('Request.render', {
            url: this.url,
            status: this.statusCode,
            id: this.id,
            isRendered: this.isRendered,
            content_type: this.getHeader('content-type')
        });

        this.isRendered = true;

        return true;
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
            getRequestBody: this.getRequestBody.bind(this),
            getRequestHeaders: this.getRequestHeaders.bind(this),
            getRequestHeader: this.getRequestHeader.bind(this),
            isHeaderCacheUnModified: this.isHeaderCacheUnModified.bind(this),
            onEnd: this.onEnd.bind(this),
            sendNoChange: this.sendNoChange.bind(this),
            stopPromiseChain: this.stopPromiseChain.bind(this),
            setStatusCode: this.setStatusCode.bind(this),
            createUrl: router.createUrl.bind(router),
            parsedUrl: core.copy(this.parsedUrl),
            forwardUrl: this.forward.bind(this)
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
            return new Promise(function (resolve, reject) {
                try {
                    resolve(next.apply(next, arguments));
                } catch (e) {
                    reject(new error.HttpError(500, arguments, "Error on executing action", e));
                }
            });
        }

        return promise.then(function (data) {
            if (!!this.isPromiseChainStopped) {
                return promise;
            }
            return _handler(data);
        }.bind(this), this._handleError.bind(this));

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
     * @method Request#_handleController
     *
     * @description
     * Load response
     */
    _handleController: function Request_handleController(controllersPath, viewsPath) {
        var controllerToLoad = controllersPath + this.controller,
            LoadedController,
            controller,
            action,
            promise;

        try {
            LoadedController = di.load(controllerToLoad);
        } catch (e) {
            throw new error.HttpError(500, {path: controllerToLoad}, 'Missing controller', e);
        }

        if (!Type.assert(Type.FUNCTION, LoadedController)) {
            throw new error.HttpError(500, {path: controllerToLoad}, 'Controller must be function type');
        }

        controller = new LoadedController(this._getApi(), {
            controller: this.controller,
            action: this.action,
            module: this.module,
            viewsPath: viewsPath
        });

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

        if (controller.has("beforeEach")) {
            promise = this._chain(null, controller.beforeEach.bind(controller, this.action, this.params));
        }

        if (controller.has('before_' + this.action)) {
            promise = this._chain(promise, controller.get('before_' + this.action).bind(controller, this.params));
        }

        if (controller.has('action_' + this.action)) {
            promise = this._chain(promise, controller.get('action_' + this.action).bind(controller, this.params));
        } else {
            throw new error.HttpError(500, {
                controller: controller,
                hasAction: controller.has(this.action),
                route: {
                    controller: this.controller,
                    action: this.action,
                    module: this.module,
                    params: this.params
                }
            }, 'Missing action in controller');
        }


        if (controller.has('after_' + this.action)) {
            promise = this._chain(promise, controller.get('after_' + this.action).bind(controller, this.params));
        }

        if (controller.has("afterEach")) {
            promise = this._chain(promise, controller.afterEach.bind(controller, this.action, this.params));
        }

        this.onEnd(controller.destroy.bind(controller));

        return promise;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_handleModule
     *
     * @description
     * Handle module
     * @return {object} Promise
     */
    _handleModule: function Request__handleModule(path) {
        var moduleToLoad = path + this.module,
            LoadedModule,
            module;

        try {
            LoadedModule = di.load(moduleToLoad);
        } catch (e) {
            throw new error.HttpError(500, {path: moduleToLoad}, 'Missing module', e);
        }

        if (!Type.assert(Type.FUNCTION, LoadedModule)) {
            throw new error.HttpError(500, {path: moduleToLoad}, 'Module must be function type');
        }

        module = new LoadedModule(this.module);

        if (!(module instanceof  ModuleInterface)) {
            throw new error.HttpError(500, module, 'Module must be instance of ModuleInterface "core/module"');
        }


        return this._handleController(module.getControllersPath(), module.getViewsPath());
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
        this.route = routeRule.shift();
        this.params = routeRule.shift();
        route = this.route.split('/');
        if (route.length === 3) {
            this.module = route.shift();
        }
        this.controller = route.shift();
        this.action = route.shift();

        if (!!this.module) {
            return this._handleModule(di.getAlias('modulesPath'));
        }

        return this._handleController(di.getAlias('controllersPath'), di.getAlias('viewsPath'));
    }

});


module.exports = Request;