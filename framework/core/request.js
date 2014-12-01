"use strict";
/* global loader: true, Promise: true, Type: true, core: true, error: true, util: true, Request: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    core = loader.load('core'),
    error = loader.load('error'),
    util = loader.load('util'),
    Promise = loader.load('promise'),
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
    router: Type.OBJECT,
    logger: Type.OBJECT,
    request: Type.OBJECT,
    response: Type.OBJECT,
    route: Type.STIRNG,
    params: Type.OBJECT,
    controller: Type.STIRNG,
    module: Type.STIRNG,
    action: Type.STIRNG,
    statusCode: Type.NUMBER,
    headers: Type.OBJECT,
    createUrl: Type.FUNCTION
}, {
    _construct: function Request(request, response, api) {
        this.router = api.getComponent('core/router');
        this.logger = api.getComponent('core/logger');
        this.createUrl = api.createUrl.bind(api);
        this.request = request;
        this.response = response;
        this.statusCode = 200;
        this.headers = {};
        this._parse();
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
     * @method Request#getView
     *
     * @description
     * This is an temp get view, to load view
     */
    getView: function (route) {
        var template;
        try {
            template = loader.readFileSync('@{viewsPath}/' + route + '.html');
        } catch (e) {
            throw new error.HttpError(404, {}, 'Cannot load template !', e);
        }
        return template;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#forward
     *
     * @description
     * Forward to route
     */
    forward: function () {

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#redirect
     *
     * @description
     * Redirect request
     */
    redirect: function () {

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#end
     *
     * @description
     * End request
     */
    _render: function Request_render(response) {

        if (response instanceof Error) {
            this.statusCode = 404;
            this.response.writeHead(this.statusCode, this.headers);
            if (response.trace) {
                this.response.end(response.trace);
            } else {
                this.response.end(util.inspect(response));
            }

        } else if (!response) {
            throw new error.HttpError(404, {}, 'No data to render');
        } else if (Type.isString(response)) {
            this.addHeader('Content-Length', response.length);
            this.response.end(response);
        } else {
            throw new error.HttpError(404, {}, 'Invalid response type, it must be string!!');
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
    _chain: function (promise, next) {
        if (!promise) {
            return Promise.resolve(next());
        }
        return promise.then(function (data) {
            return Promise.resolve(next(data));
        }, this._handleError.bind(this));
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
        var api = {
                forward: this.forward.bind(this),
                redirect: this.redirect.bind(this),
                createUrl: this.createUrl.bind(this),
                addHeader: this.addHeader.bind(this),
                getView: this.getView.bind(this)
            },
            controllerToLoad = '@{controllersPath}/' + this.controller,
            LoadedController,
            controller,
            action,
            promise;

        this.logger.print(controllerToLoad);
        this.logger.print('LoadingController', controllerToLoad);

        try {
            LoadedController = loader.load(controllerToLoad);
        } catch (e) {
            throw new error.HttpError(404, {path: controllerToLoad}, 'Missing controller', e);
        }

        controller = new LoadedController(api);

        this.logger.print('LoadRequest', {
            controller: controller,
            route: {
                controller: this.controller,
                action: this.action,
                module: this.module,
                params: this.params
            }
        });

        if (Type.isFunction(controller.beforeEach)) {
            promise = this._chain(null, controller.beforeEach.bind(controller, this.action));
        }
        action = 'before_' + this.action;
        if (Type.isFunction(controller[action])) {
            promise = this._chain(promise, controller[action].bind(controller, this.params));
        }
        action = this.action;
        if (Type.isFunction(controller[action])) {
            promise = this._chain(promise, controller[action].bind(controller, this.params));
        } else {
            throw new error.HttpError(404, {
                controller: controller,
                route: {
                    controller: this.controller,
                    action: this.action,
                    module: this.module,
                    params: this.params
                }
            }, 'Missing action in controller');
        }
        action = 'after_' + this.action;
        if (Type.isFunction(controller[action])) {
            promise = this._chain(promise, controller[action].bind(controller, this.params));
        }
        if (Type.isFunction(controller.afterEach)) {
            promise = this._chain(promise, controller.afterEach.bind(controller, this.action, this.params));
        }

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
    _parse: function Request_parse() {
        this.router
            .process(this.request, this.response)
            .then(resolveRoute.bind(this), this._handleError.bind(this)) // resolve route chain
            .then(this._render.bind(this), this._handleError.bind(this)) // render chain
            .then(this._render.bind(this), this._handleError.bind(this)); // error render chain

        /**
         * Resolve route
         * @param routeRule
         */
        function resolveRoute(routeRule) {
            var route;
            this.statusCode = 200;
            this.route = routeRule.shift();
            this.params = routeRule.shift();
            route = this.route.split('/'); // copy
            if (route.length === 3) {
                this.module = route.shift();
            }
            this.controller = route.shift();
            this.action = route.shift();
            this.addHeader('Content-type', 'text/html');

            return this._handleRoute();
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Request#handleError
     *
     * @description
     * Handle error
     */
    _handleError: function Request_handleError(message) {
        this.statusCode = 404;
        this.addHeader('Content-type', 'text/plain');
        return this._render(message);
    }
});


module.exports = Request;