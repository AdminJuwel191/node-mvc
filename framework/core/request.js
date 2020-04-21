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
    zlib = di.load('zlib'),
    core = di.load('core'),
    error = di.load('error'),
    Promise = di.load('promise'),
    EventEmitter = di.load('events'),
    Request;


/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name getErrorCode
 *
 * @description
 * Get error code from request
 * @return number
 */
function getErrorCode(message) {
    var tokens = message.split('\n'),
        token;
    while (tokens.length) {
        token = tokens.shift();
        if (token.indexOf('CODE:') === 0) {
            token = parseInt(token.replace('CODE:', ''));
            if (Type.isNumber(token) && !isNaN(token)) {
                return token;
            }
        }
    }
    return 500;
}
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
    isCompressed: Type.BOOLEAN,
    isCompressionEnabled: Type.BOOLEAN,
    encoding: Type.STRING,
    body: Type.ARRAY,
    eventHandler: Type.OBJECT,
    id: Type.STRING
}, {
    _construct: function Request(config, url) {
        this.isForwarded = false;
        this.body = [];
        this.isERROR = false;
        this.isCompressionEnabled = false;
        // body and isForwarded are forwarded to request
        core.extend(this, config);

        this.statusCode = 200;
        this.headers = {};
        this.url = url;
        this.parsedUrl = URLParser.parse(this.url, true);
        this.isPromiseChainStopped = false;
        this.isRendered = false;
        this.isCompressed = false;
        this.eventHandler = new EventEmitter();
        this.eventHandler.setMaxListeners(1000);

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
        this.eventHandler.once('destroy', callback);
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
        if (Type.isArray(this.body) && this.body.length > 0) {
            return Buffer.concat(this.body);
        }
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
     * @method Request#getRequestDomain
     *
     * @description
     * Return request domain
     */
    getRequestDomain: function Request_getRequestDomain() {
        return this.request.connection.domain;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getRequestIpAddres
     *
     * @description
     * Request remote ip address
     */
    getRequestRemoteAddress: function Request_getRequestRemoteAddress() {
        return this.request.connection.remoteAddress;
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getRequestRemotePort
     *
     * @description
     * Request remote port
     */
    getRequestRemotePort: function Request_getRequestRemotePort() {
        return this.request.connection.remotePort;
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getRequestLocalAddress
     *
     * @description
     * Request locals address
     */
    getRequestLocalAddress: function Request_getRequestLocalAddress() {
        return this.request.connection.localAddress;
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#getRequestLocalPort
     *
     * @description
     * Request local port
     */
    getRequestLocalPort: function Request_getRequestLocalPort() {
        return this.request.connection.localPort;
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
        var item;
        if (Type.isString(key)) {
            key = key.toLowerCase();
            if (!Type.isString(value) && !!value && Type.isFunction(value.toString)) {
                value = value.toString();
            }
            if (Type.isString(value)) {
                if (this.hasHeader(key) && !Type.isArray(this.headers[key])) {
                    item = this.getHeader(key);
                    this.headers[key] = [];
                    this.headers[key].push(item);
                    this.headers[key].push(value);
                } else if (this.hasHeader(key) && Type.isArray(this.headers[key])) {
                    this.headers[key].push(value);
                } else {
                    this.headers[key] = value;
                }
            }
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
        var request, that = this;
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

            this.isRendered = true;

            logger.info('Request.forward.url:', {
                url: url
            });

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

            this.isRendered = true;

            logger.info('Request.forward.route:', {
                route: route,
                params: params
            });

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
        logger.info('Request.redirect:', {
            url: url,
            isTemp: isTemp
        });
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
        this._render('MVCJS_NO_STATUS_CHANGE');
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
     * @method Request#destroy
     *
     * @description
     * Destroy current instance
     */
    _destroy: function Request__destroy() {
        this.eventHandler.emit('destroy');
        this.eventHandler.removeAllListeners();
        this.destroy();
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
        var that = this, url = this.url;
        if (this.isForwarded) {
            return this._process()
                .then(function destroy() {
                    logger.info('Request.destroy', {
                        url: that.url,
                        status: that.statusCode,
                        id: that.id,
                        isRendered: that.isRendered,
                        content_type: that.getHeader('content-type')
                    });
                    that._destroy();
                })
                .catch(function error(e) {
                    logger.error('Request.destroy', {error: e, url: url});
                });
        }
        // receive body as buffer
        this.request.on('data', this.body.push.bind(this.body));

        return new Promise(this.request.on.bind(this.request, 'end'))
            .then(this._process.bind(this))
            .then(function destroy() {
                logger.info('Request.destroy', {
                    url: that.url,
                    status: that.statusCode,
                    id: that.id,
                    isRendered: that.isRendered,
                    content_type: that.getHeader('content-type')
                });
                that._destroy();
            })
            .catch(function error(e) {
                logger.error('Request.destroy', {error: e, url: url});
            });

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
                    .process(this.request.method, this.parsedUrl, this.getRequestHeaders()) // find route
                    .then(this._resolveRoute.bind(this)); // resolve route chain
            }.bind(this)) // handle hook chain
            .then(this._compress.bind(this))
            .then(this._render.bind(this)) // resolve route chain
            .catch(this._handleError.bind(this)) // catch hook error
            .then(this._compress.bind(this))
            .then(this._render.bind(this)) // render hook error
            .catch(this._handleError.bind(this)) // catch render error
            .then(this._compress.bind(this))
            .then(this._render.bind(this)); // resolve render error
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_compress
     *
     * @description
     * Compress output
     * @return object
     */
    _compress: function Request__compress(response) {
        var accept = this.getRequestHeader('Accept-Encoding'),
            isForCompress = (Type.isString(response) || response instanceof Buffer) && !this.isCompressed,
            that = this;

        if (this.isRendered) {
            // we have multiple recursion in parse for catching
            return false;
        }


        if (isForCompress && !!this.isCompressionEnabled && Type.isString(accept)) {
            if (!this.hasHeader('Vary')) {
                this.addHeader('Vary', 'Accept-Encoding');
            }
            if (accept.indexOf('gzip') > -1) {
                return new Promise(function (resolve, reject) {
                    zlib.gzip(response, function (err, data) {
                        if (err) {
                            return reject(err);
                        }
                        that.isCompressed = true;
                        that.addHeader('Content-Encoding', 'gzip');
                        resolve(data);
                    });
                });
            } else if (accept.indexOf('deflate') > -1) {
                return new Promise(function (resolve, reject) {
                    zlib.deflate(response, function (err, data) {
                        if (err) {
                            return reject(err);
                        }
                        that.isCompressed = true;
                        that.addHeader('Content-Encoding', 'deflate');
                        resolve(data);
                    });
                });
            }
        }

        return response;
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
        var request, code, that = this;

        if (this.isRendered) {
            // we have multiple recursion in parse for catching
            return false;
        }
        // log error request
        logger.error('Request:', {
            url: this.url,
            status: this.statusCode,
            id: this.id,
            isRendered: this.isRendered,
            content_type: this.getHeader('content-type'),
            message: response
        });

        if (response instanceof Error) {
            response = error.silentHttpError(500, {}, 'SlientHttpError: mvcjs error is not thrown', response);
        }
        // get error code from message
        code = getErrorCode(response);
        // set status codes
        this.setStatusCode(code);
        // stop current chain!!!
        this.stopPromiseChain();

        response += '\n';
        response += 'ROUTE:' + core.inspect(this._getRouteInfo());

        if (!this.isERROR && !!router.getErrorRoute()) {
            // return new request
            this.isRendered = true;

            request = new Request({
                request: this.request,
                response: this.response,
                isForwarded: true,
                body: this.body,
                isERROR: true
            }, router.createUrl(this._extractClientIdFromUrl(this.url) + router.getErrorRoute()));
            // pass exception response over parsed url query as query parameter
            // assign to exception
            request.parsedUrl.query.exception = response;
            // set status codes for new request
            request.setStatusCode(code);
            // return parsed request
            return request.parse();
        } else {
            this.addHeader('Content-Type', 'text/plain');
            return response;
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



        if (Type.isString(response)) {
            this._checkContentType('text/html');
            this.response.writeHead(this.statusCode, this.headers);

            this.addHeader('Content-Length', response.length);
            this.response.end(response);
            this.isRendered = true;
            logger.info('Request.render:', {
                url: this.url,
                status: this.statusCode,
                id: this.id,
                isRendered: this.isRendered,
                content_type: this.getHeader('content-type')
            });
            return true;
        } else if (response instanceof Buffer) {
            this._checkContentType('text/html');
            this.response.writeHead(this.statusCode, this.headers);
            this.addHeader('Content-Length', response.length);
            this.response.end(response);
            this.isRendered = true;
            logger.info('Request.render:', {
                url: this.url,
                status: this.statusCode,
                id: this.id,
                isRendered: this.isRendered,
                content_type: this.getHeader('content-type')
            });
            return true;
        } else if (!response) {
            logger.error('Request.error:', {
                url: this.url,
                status: this.statusCode,
                id: this.id,
                response: response,
                isRendered: this.isRendered,
                content_type: this.getHeader('content-type'),
                message: 'No data to render'
            });
            throw new error.HttpError(500, {}, 'No data to render');
        } else {
            logger.error('Request.error:', {
                url: this.url,
                status: this.statusCode,
                id: this.id,
                response: response,
                isRendered: this.isRendered,
                content_type: this.getHeader('content-type'),
                message: 'Invalid response type'
            });
            throw new error.HttpError(500, {}, 'Invalid response type, string or buffer is required!');
        }
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
            parsedUrl: this.parsedUrl,
            url: this.url,
            forwardUrl: this.forward.bind(this),
            uuid: this._uuid.bind(this),
            getRequestDomain: this.getRequestDomain.bind(this),
            getRequestRemoteAddress: this.getRequestRemoteAddress.bind(this),
            getRequestRemotePort: this.getRequestRemotePort.bind(this),
            getRequestLocalAddress: this.getRequestLocalAddress.bind(this),
            getRequestLocalPort: this.getRequestLocalPort.bind(this)
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
                    reject(new error.HttpError(500, {}, "Error on executing action", e));
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
                throw new error.HttpError(500, {}, "Error on executing action", e);
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
            url: this.url,
            id: this.id,
            viewsPath: viewsPath
        });

        if (!(controller instanceof  ControllerInterface)) {
            throw new error.HttpError(500, controller, 'Controller must be instance of ControllerInterface "core/controller"');
        }

        logger.info('Controller:', {
            controller: controller.__dynamic__,
            controllerToLoad: controllerToLoad,
            route: this._getRouteInfo()
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
                route: this._getRouteInfo()
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
            throw new error.HttpError(500, {module: module}, 'Module must be instance of ModuleInterface "core/module"');
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
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#_getRouteInfo
     *
     * @description
     * Return route info for easy debugging
     * @return {object}
     */
    _getRouteInfo: function Request__getRouteInfo() {
        return {
            id: this.id,
            url: this.url,
            controller: this.controller,
            action: this.action,
            module: this.module,
            params: this.params,
            method: this.getMethod(),
            requestDomain: this.getRequestDomain(),
            remoteAddress: this.getRequestRemoteAddress(),
            remotePort: this.getRequestRemotePort(),
            localAddress: this.getRequestLocalAddress(),
            localPort: this.getRequestLocalPort()
        };
    },
    _extractClientIdFromUrl: function extractClientIdFromUrl(url) {
        var clientId = '';
        var clientRegex = /\/([a-z|0-9]){32}/;
        var matches = url.match(clientRegex);
        if(matches.length) {
            clientId = matches[0] + '/';
        }
        return clientId;
    }
});


module.exports = Request;