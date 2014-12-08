"use strict";
/* global loader: true, Promise: true, Type: true, core: true, error: true, util: true, Request: true, Controller: true */
var di = require('../di'),
    ControllerInterface = di.load('interface/controller'),
    component = di.load('core/component'),
    router = component.get('core/router'),
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
    headers: Type.OBJECT
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
     * @method Request#addHeader
     *
     * @description
     * Write header
     */
    addHeader: function Request_addHeader(key, value) {
        this.headers[key] = value;
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

            logger.print('Request.forward', route, params, request);

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
     * @method Request#end
     *
     * @description
     * End request
     */
    _render: function Request__render(response) {

        logger.print('Request.render', response);

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

        } else if (!response) {
            throw new error.HttpError(500, {}, 'No data to render');
        } else if (Type.isString(response)) {
            this.addHeader('Content-Length', response.length);
            this.response.end(response);
        } else {
            throw new error.HttpError(500, {}, 'Invalid response type, it must be string!!');
        }

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

        controller = new LoadedController({
            redirect: this.redirect.bind(this),
            forward: this.forward.bind(this),
            addHeader: this.addHeader.bind(this),
            onEnd: this.onEnd.bind(this),
            createUrl: router.createUrl.bind(router)
        });

        if (!(controller instanceof  ControllerInterface)) {
            throw new error.HttpError(500, controller, 'Controller must be instance of ControllerInterface "core/controller"');
        }

        logger.print('LoadRequest', {
            controller: controller,
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
        return router
            .process(this.request.method, this.parsedUrl) // find route
            .then(this._resolveRoute.bind(this), this._handleError.bind(this)) // resolve route chain
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
        this.addHeader('Content-type', 'text/html');
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
        this.addHeader('Content-type', 'text/plain');
        return this._render(data);
    }
});


module.exports = Request;