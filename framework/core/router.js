"use strict";
/* global loader: true, Promise: true, Type: true, core: true, error: true, util: true, RouteRule: true, URLParser: true, Router: true */
var di = require('../loader'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    component = di.load('core/component'),
    RouteRule = di.load('core/routeRule'),
    Promise = di.load('promise'),
    URLParser = di.load('url'),
    RouteRuleInterface = di.load('interface/routeRule'),
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
    api: Type.OBJECT,
    logger: Type.OBJECT,
    config: Type.OBJECT
},{
    _construct: function Router(api, config) {
        this.routes = [];
        this.logger = component.get('core/logger');
        this.config = {
            defaultRoute: "home/index",
            errorRoute: "error/index"
        };
        core.extend(this.config, config);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#getErrorRoute
     *
     * @description
     * Get default error route
     */
    getErrorRoute: function Router_getErrorRoute() {
        return this.config.errorRoute;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#getDefaultRoute
     *
     * @description
     * Returns default route
     */
    getDefaultRoute: function Router_getDefaultRoute() {
        return this.config.defaultRoute;
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
            if (core.isFunction(route.constructor)) {
                rule = new route.constructor(component);
            } else {
                throw new error.HttpError(500, route, 'Router.add: dynamic route is not constructor');
            }
        } else {
            rule = new RouteRule(component, route);
        }

        if (!(rule instanceof RouteRuleInterface)) {
            throw new error.HttpError(500, rule, 'Router.add: rule must be instance of RouteRuleInterface');
        }

        this.logger.print('Router.add: route', route);
        this.routes.push(rule);

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#processFavicon
     *
     * @description
     * Process favicon
     */
    processFavicon: function Router_processFavicon(request, response) {
        var favicon, iconBuffer, key = 'APP_FAVICON',
            logger = component.get('core/logger'),
            cache = component.get('cache/memory'),
            fs = di.load('fs');

        if (request.url === '/favicon.ico') {
            iconBuffer = cache.get(key);
            if (iconBuffer) {
                response.writeHead(304);
                response.end();
            } else {
                fs.readFile(this.api.getFavicon(), function (err, buf) {
                    if (err) {
                        logger.error(err);
                        throw new error.HttpError(500, err,  'Cannot load favicon');
                    }
                    cache.set(key, buf);
                    response.writeHead(200, {
                        'Content-Length': buf.length,
                        'Content-Type': 'image/x-icon'
                    });
                    response.end(buf);
                });
            }
            return true;
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#createUrl
     *
     * @description
     * Create url
     */
    createUrl: function Router_createUrl(route, params) {
        var i, len = this.routes.length, routeRule, url, anchor = '';

        if (!Type.isString(route)) {
            throw new error.HttpError(500, route, 'RouteRule.createUrl: route must be string type');
        }
        if (!params) {
            params = {};
        } else if (!Type.isObject(params)) {
            throw new error.HttpError(500, params, 'RouteRule.createUrl: params must be object type');
        }

        Object.keys(params).forEach(function (item) {
            if (item === '#') {
                anchor = '#' + params['#'];
                delete params['#'];
            }
        });

        params = core.copy(params);

        for (i = len - 1; i > -1; --i) {
            routeRule = this.routes[i];
            url = routeRule.createUrl(route, params);
            if (url) {
                return '/' + url + anchor;
            }
        }

        url = '/' + this.trim(route, '/');

        if (Object.keys(params).length > 0) {
            url += '?' + this.buildQuery(params);
        }
        return url + anchor;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#parseRequest
     *
     * @description
     * Parse request
     */
    parseRequest: function Router_parseRequest(request) {
        var i, len = this.routes.length, routeRule, route = [], url;

        url = URLParser.parse(request.url, true);

        for (i = len - 1; i > -1; --i) {
            routeRule = this.routes[i];
            route = routeRule.parseRequest(request, url);
            if (Type.isArray(route) && route.length) {
                break;
            }
        }
        if (!Type.isArray(route)) {
            route = [];
        }

        this.logger.print('Router.parseRequest', route);
        return route;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Router#buildQuery
     *
     * @description
     * Build query string
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
    process: function Router_process(request, response) {
        if (this.processFavicon(request, response)) {
            return Promise.reject('favicon');
        }
        return Promise.resolve(this.parseRequest(request)).then(function(routeRule) {
            if (Type.isArray(routeRule) && routeRule.length === 2) {
                return Promise.resolve(routeRule);
            }
            // only on not found throw an error 500
            throw new error.HttpError(404, core.toObject(routeRule), 'Not found');
        }, function (error) {
            throw new error.HttpError(500, error, 'Not found');
        });
    }
});


// exports Router
module.exports = Router;