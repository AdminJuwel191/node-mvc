"use strict";
/* global loader: true, Promise: true, Type: true, core: true, error: true, util: true, RouteRule: true, URLParser: true, Router: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    Promise = di.load('promise'),
    RouteRuleInterface = di.load('interface/routeRule'),
    RouteRule = di.load('core/routeRule'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
    Router;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Router
 *
 * @constructor
 * @description
 * Router is used to provide route api
 */
Router = Type.create({
    routes: Type.ARRAY,
    createUrlRgx: Type.REGEX,
    config: Type.OBJECT
}, {
    _construct: function Router(config) {
        this.routes = [];
        this.createUrlRgx = /\/\//g;
        this.config = core.extend({
            errorRoute: false,
            errorUrl: '/error'
        }, config);
        // add error route so we can resolve it
        this.add({
            pattern: this.config.errorUrl,
            route: this.config.errorRoute ? this.config.errorRoute : 'core/error',
            method: ['GET',  'HEAD', 'POST',  'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'CONNECT', 'PATCH']
        });
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#getErrorRoute
     *
     * @description
     * Get default error route
     * @return {object}
     */
    getErrorRoute: function Router_getErrorRoute() {
        return this.config.errorRoute;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#add
     *
     * @description
     * Router add route
     */
    add: function Router_add(route) {
        var rule;
        if (Array.isArray(route)) {
            route.forEach(Router_add.bind(this));
            return;
        }
        if (route.dynamic) {
            if (Type.isFunction(route.constructor)) {
                rule = new route.constructor();
            } else {
                throw new error.HttpError(500, {route: route}, 'Router.add: dynamic route is not function');
            }
        } else {
            rule = new RouteRule(route);
        }

        if (!(rule instanceof RouteRuleInterface)) {
            throw new error.HttpError(500, {rule: rule, route: route}, 'Router.add: rule must be instance of RouteRuleInterface');
        }

        logger.info('Router.add:', route);

        this.routes.push(rule);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#normalizeUrl
     *
     * @description
     * Create url
     * @return {string}
     */
    normalizeUrl: function Router_normalizeUrl(url) {
        return url.replace(this.createUrlRgx, '/').replace(this.createUrlRgx, '/');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#createUrl
     *
     * @description
     * Create url
     * @return {string}
     */
    createUrl: function Router_createUrl(route, params) {
        var routeRule, url, anchor = '', routes;

        if (!Type.isString(route)) {
            throw new error.HttpError(500, {route: route}, 'RouteRule.createUrl: route must be string type');
        }
        if (!params) {
            params = {};
        } else if (!Type.isObject(params)) {
            throw new error.HttpError(500, {params: params}, 'RouteRule.createUrl: params must be object type');
        }

        Object.keys(params).forEach(function (item) {
            if (item === '#') {
                anchor = '#' + params['#'];
                delete params['#'];
            }
        });

        params = core.copy(params);
        routes = this.routes.slice();

        while (routes.length) {
            routeRule = routes.shift();
            url = routeRule.createUrl(route, params);
            if (url) {
                return this.normalizeUrl('/' + url + anchor);
            }
        }

        url = '/' + this.trim(route, '/');

        if (Object.keys(params).length > 0) {
            url += '?' + this.buildQuery(params);
        }

        return this.normalizeUrl(url + anchor);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#parseRequest
     *
     * @description
     * Parse request
     */
    parseRequest: function Router_parseRequest(method, parsedUrl, headers) {
        var all = [];

        this.routes.forEach(function (routeRule) {
            all.push(
                new Promise(function (resolve, reject) {
                    try {
                        resolve(routeRule.parseRequest(method, parsedUrl, headers));
                    } catch (e) {
                        reject(e);
                    }
                })
            );
        });
        return Promise.all(all).then(function (data) {
            var route;
            while (data.length) {
                route = data.shift();
                if (Type.isArray(route) && route.length === 2) {
                    return route;
                }
            }
            return [];
        });
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#buildQuery
     *
     * @description
     * Build query string
     * @return {string}
     */
    buildQuery: function Router_buildQuery(params) {
        var data = [];
        Object.keys(params).forEach(function (key) {
            data.push(key + '=' + encodeURIComponent(params[key]));
        });
        return data.join('&');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#trim
     *
     * @description
     * Strip whitespace in string and as well strip extra parameter
     */
    trim: function Router_trim(str, strip) {
        if (!Type.isString(str)) {
            return str;
        }
        str = str.trim();
        if (strip) {
            str = str.replace(core.createRegex('^' + strip), '');
            str = str.replace(core.createRegex(strip + '$'), '');
        }
        return str;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#process
     *
     * @description
     * Process request
     */
    process: function Router_process(method, parsedUrl, headers) {

        return this.parseRequest(method, parsedUrl, headers)
            .then(function (routeRule) {
                if (Type.isArray(routeRule) && routeRule.length === 2) {
                    return Promise.resolve(routeRule);
                }
                // only on not found throw an error 404
                throw new error.HttpError(404, core.toObject(routeRule), 'Not found');
            }, function (e) {
                throw new error.HttpError(500, {}, 'Not found', e);
            });
    }
});


// exports Router
module.exports = Router;