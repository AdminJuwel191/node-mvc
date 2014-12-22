var di = require('../../'), fs = di.load('fs'), path = di.load('path');
describe('core/request', function () {
    "use strict";
    var request,
        config = {},
        Promise = di.load('promise'),
        logger = {
            print: function () {
            },
            log: function () {
            }
        },
        router = {
            createUrl: function () {
            },
            process: function () {
                return Promise.resolve('handler');
            },
            getErrorRoute: function () {

            }
        },
        hooks = {
            process: function () {
            }
        },
        error = di.load('error'),
        componentMock = {
            get: function (name) {
                if (name == "core/logger") {
                    return logger;
                } else if (name == "core/router") {
                    return router;
                } else if (name == "hooks/request") {
                    return hooks;
                }
            }
        },
        Constructor,
        mock,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        config = {
            request: {
                method: 'GET',
                on: function () {

                },
                headers: {
                    'content-type': 'text/html',
                    'content-length': '180',
                    'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
                    'if-none-match': '*',
                    'cache-control': 'max-age=180'
                }
            },
            response: {
                writeHead: function () {
                },
                end: function () {
                }
            }
        };

        mock = {
            typejs: Type,
            core: core,
            error: error,
            promise: Promise,
            util: di.load('util'),
            url: di.load('url'),
            "interface/controller": di.load('interface/controller'),
            "core/component": componentMock
        };
        Constructor = di.mock('core/request', mock);
    });


    it('construct', function () {
        request = new Constructor(config, '/home/index');
        expect(request.request).toBe(config.request);
        expect(request.response).toBe(config.response);
        expect(request.url).toBe('/home/index');
        expect(request.statusCode).toBe(200);
        expect(request.parsedUrl.pathname).toBe('/home/index');
    });


    it('onEnd', function () {
        request = new Constructor(config, '/home/index');
        spyOn(config.request, "on").and.callThrough();
        request.onEnd(function () {

        });
        expect(config.request.on).toHaveBeenCalled();
    });


    it('getHeaders|addHeader|getHeader|hasHeader|getMethod|sendNoChange', function () {
        config.response.writeHead = function (code, headers) {
            expect(code).toBe(304);
            expect(headers['content-type']).toBe('text/html');
            expect(headers['content-length']).toBe('180');
        };
        request = new Constructor(config, '/home/index');

        request.addHeader('Content-Type', 'text/html');
        request.addHeader('Content-Length', 180);
        var headers = request.getHeaders();
        expect(headers['content-type']).toBe('text/html');
        expect(headers['content-length']).toBe('180');

        var message = tryCatch(function () {
            request.addHeader(1, '180');
        });
        expect(message.customMessage).toBe('Request.addHeader: Header key must be string type');

        expect(request.getHeader('content-type')).toBe('text/html');
        expect(request.getHeader('non-existing')).toBe(false);

        message = tryCatch(function () {
            request.hasHeader(1);
        });
        expect(message.customMessage).toBe('Request.hasHeader: Header key must be string type');

        expect(request.getMethod()).toBe('GET');

        spyOn(config.response, 'writeHead').and.callThrough();
        spyOn(config.response, 'end').and.callThrough();

        request.sendNoChange();

        expect(config.response.writeHead).toHaveBeenCalled();
        expect(config.response.end).toHaveBeenCalled();
    });


    it('getRequestHeaders|getRequestHeader', function () {
        var request = new Constructor({
            request: {
                method: 'GET',
                on: function () {

                },
                headers: {
                    'content-type': 'text/html',
                    'content-length': '180',
                    'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
                    'if-none-match': '*',
                    'cache-control': 'max-age=180'
                }
            },
            response: {
                writeHead: function () {
                },
                end: function () {
                }
            }
        }, '/home/index');
        var headers = request.getRequestHeaders();
        expect(headers['content-type']).toBe('text/html');
        expect(headers['content-length']).toBe('180');
        expect(request.getRequestHeader('content-type')).toBe('text/html');


        var message = tryCatch(function () {
            request.getRequestHeader(1);
        });
        expect(message.customMessage).toBe('Request.getRequestHeader: Header key must be string type');
    });


    it('isHeaderCacheUnModified', function () {

        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '180',
            'cache-control': 'max-age=180'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:21:20 GMT');
        request.addHeader('etag', 180);

        expect(request.isHeaderCacheUnModified()).toBe(true);

        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '180',
            'cache-control': 'max-age=180'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:24:20 GMT');
        request.addHeader('etag', 180);

        expect(request.isHeaderCacheUnModified()).toBe(false);

        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '180',
            'cache-control': 'max-age=180'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:24:20 GMT');
        request.addHeader('etag', 170);

        expect(request.isHeaderCacheUnModified()).toBe(false);


        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '*',
            'cache-control': 'max-age=180'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:24:20 GMT');
        request.addHeader('etag', 170);

        expect(request.isHeaderCacheUnModified()).toBe(false);


        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            //'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '*',
            'cache-control': 'max-age=180'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:24:20 GMT');
        request.addHeader('etag', 170);

        expect(request.isHeaderCacheUnModified()).toBe(true);

        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            //'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            //'if-none-match': '*',
            'cache-control': 'max-age=180'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:24:20 GMT');
        request.addHeader('etag', 170);

        expect(request.isHeaderCacheUnModified()).toBe(false);

        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '*',
            'cache-control': 'no-cache'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:24:20 GMT');
        request.addHeader('etag', 170);

        expect(request.isHeaderCacheUnModified()).toBe(false);

        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '*'
            //'cache-control': 'no-cache'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:24:20 GMT');
        request.addHeader('etag', 170);

        expect(request.isHeaderCacheUnModified()).toBe(false);

        config.request.headers = {
            'content-type': 'text/html',
            'content-length': '180',
            'if-modified-since': 'Fri, 19 Dec 2014 10:22:20 GMT',
            'if-none-match': '*'
            //'cache-control': 'no-cache'
        };

        request = new Constructor(config, '/home/index');
        request.addHeader('last-modified', 'Fri, 19 Dec 2014 10:20:20 GMT');
        request.addHeader('etag', 170);

        expect(request.isHeaderCacheUnModified()).toBe(true);
    });


    it('redirect 301', function () {
        config.response.writeHead = function (code, headers) {
            expect(code).toBe(301);
            expect(Type.isObject(headers)).toBe(true);
        };
        request = new Constructor(config, '/home/index');

        spyOn(config.response, 'writeHead').and.callThrough();
        spyOn(config.response, 'end').and.callThrough();

        request.redirect('/home', false);

        expect(config.response.writeHead).toHaveBeenCalled();
        expect(config.response.end).toHaveBeenCalled();
    });

    it('redirect 302', function () {
        config.response.writeHead = function (code, headers) {
            expect(code).toBe(302);
            expect(Type.isObject(headers)).toBe(true);
        };
        request = new Constructor(config, '/home/index');

        spyOn(config.response, 'writeHead').and.callThrough();
        spyOn(config.response, 'end').and.callThrough();

        request.redirect('/home', true);

        expect(config.response.writeHead).toHaveBeenCalled();
        expect(config.response.end).toHaveBeenCalled();
    });


    it('_checkContentType', function () {
        config.request.headers = {};
        request = new Constructor(config, '/home/index');
        expect(request.hasHeader('content-type')).toBe(false);
        request._checkContentType('text/html');
        expect(request.hasHeader('content-type')).toBe(true);
        expect(request.getHeader('content-type')).toBe('text/html');

        config.request.headers = {};
        request = new Constructor(config, '/home/index');
        expect(request.hasHeader('content-type')).toBe(false);
        request._checkContentType();
        expect(request.hasHeader('content-type')).toBe(true);
        expect(request.getHeader('content-type')).toBe('text/plain');
    });


    it('_getApi', function () {
        config.request.headers = {};
        request = new Constructor(config, '/home/index');
        var api = request._getApi();
        expect(Type.isFunction(api.redirect)).toBe(true);
        expect(Type.isFunction(api.forward)).toBe(true);
        expect(Type.isFunction(api.hasHeader)).toBe(true);
        expect(Type.isFunction(api.addHeader)).toBe(true);
        expect(Type.isFunction(api.getHeaders)).toBe(true);
        expect(Type.isFunction(api.getMethod)).toBe(true);
        expect(Type.isFunction(api.getRequestHeaders)).toBe(true);
        expect(Type.isFunction(api.getRequestHeader)).toBe(true);
        expect(Type.isFunction(api.isHeaderCacheUnModified)).toBe(true);
        expect(Type.isFunction(api.onEnd)).toBe(true);
        expect(Type.isFunction(api.sendNoChange)).toBe(true);
        expect(Type.isFunction(api.createUrl)).toBe(true);
        expect(Type.isObject(api.parsedUrl)).toBe(true);
    });


    it('_resolveRoute', function () {
        config.request.headers = {};
        request = new Constructor(config, '/home/index');
        var params = {id: 1};

        var ctx = {};
        ctx._handleRoute = function () {
        };
        spyOn(ctx, '_handleRoute');
        request._resolveRoute.call(ctx, ['user/home/index', params]);

        expect(ctx._handleRoute).toHaveBeenCalled();
        expect(ctx.statusCode).toBe(200);
        expect(ctx.route).toBe('user/home/index');
        expect(ctx.params).toBe(params);
        expect(ctx.module).toBe('user');
        expect(ctx.controller).toBe('home');
        expect(ctx.action).toBe('index');

    });


    it('_chain', function (done) {
        var ctx = {
            _handleError: function () {
            }
        };
        request = new Constructor(config, '/home/index');

        var promise = request._chain(null, function () {
            return 1;
        });

        promise = request._chain(promise, function (n) {
            return n + 1;
        });
        promise = request._chain(promise, function (n) {
            return n + 1;
        });

        promise.then(function (n) {
            expect(n).toBe(3);
            done();
        });
    });

    it('_chain error', function (done) {
        var ctx = {
            _handleError: function (error) {
                expect(error.customMessage).toBe('Error on executing action');
            }
        };
        request = new Constructor(config, '/home/index');

        spyOn(ctx, '_handleError').and.callThrough();

        var promise = request._chain.call(ctx, null, function () {
            return 1;
        });

        promise = request._chain.call(ctx, promise, function (n) {
            return n + 1;
        });
        promise = request._chain.call(ctx, promise, function (n) {
            return n.aa.a + 1;
        });


        promise.then(null, done);
    });

    it('_chain error2', function (done) {
        var ctx = {
            _handleError: function (error) {
                expect(error.customMessage).toBe('Error on executing action');
            }
        };
        request = new Constructor(config, '/home/index');

        spyOn(ctx, '_handleError').and.callThrough();

        var promise = request._chain.call(ctx, null, function () {
            return {}.b.c;
        });

        promise.then(null, done);
    });

    it('_render', function () {
        var ctx = {
            addHeader: function () {
            },
            response: {
                writeHead: function () {

                }
            },
            isRendered: false,
            _checkContentType: function () {
            }
        };
        var response = 'TEST';

        request = new Constructor(config, '/home/index');

        ctx.response.end = function (r) {
            expect(r).toBe(response);
        };
        spyOn(ctx, '_checkContentType');
        spyOn(ctx, 'addHeader');
        request._render.call(ctx, response);
        expect(ctx.addHeader).toHaveBeenCalled();
        expect(ctx._checkContentType).toHaveBeenCalled();

        ctx.isRendered = false;
        var response = new Buffer(111);
        ctx.response.end = function (r) {
            expect(r).toBe(response);
        };
        request._render.call(ctx, response);

        var message = tryCatch(function () {
            ctx.isRendered = false;
            request = new Constructor(config, '/home/index');
            request._render.call(ctx);
        });
        expect(message.code).toBe(500);
        expect(message.customMessage).toBe('No data to render');

        message = tryCatch(function () {
            ctx.isRendered = false;
            request = new Constructor(config, '/home/index');
            request._render.call(ctx, {});
        });
        expect(message.code).toBe(500);
        expect(message.customMessage).toBe('Invalid response type, string or buffer is required!');
    });


    it('parse', function (done) {

        hooks.process = function () {
            return Promise.resolve(10);
        };
        router.process = function () {
            return Promise.resolve(10);
        };

        var _d, _e;
        var ctx = {
            _render: function () {
                return 'render';
            },
            _resolveRoute: function () {
                return 'resolveRoute';
            },
            _getApi: function () {
                return 'getApi';
            },
            _handleError: function () {
                return '_handleError';
            }
        };

        spyOn(ctx, '_render').and.callThrough();
        spyOn(ctx, '_resolveRoute').and.callThrough();
        spyOn(ctx, '_getApi').and.callThrough();
        spyOn(ctx, '_handleError').and.callThrough();

        var request = new Constructor(config, '/home/index');
        request.parse.call(ctx).then(function (data) {
            _d = data;
        }, function (error) {
            _e = error;
        });
        expect(ctx._getApi).toHaveBeenCalled();
        var rSpy = expect(ctx._render);


        setTimeout(function () {
            expect(_d).toBe('render');
            rSpy.toHaveBeenCalled();
            done();
        }, 100);
    });


    it('parse 2', function (done) {
        var _d, _e;

        hooks.process = function () {
            return Promise.resolve(null);
        };

        var ctx = {
            _render: function (a) {
                return a;
            },
            _resolveRoute: function () {
                return 'resolveRoute';
            },
            _getApi: function () {
                return 'getApi';
            },
            _handleError: function () {
                return '_handleError';
            }
        };


        spyOn(ctx, '_render').and.callThrough();
        spyOn(ctx, '_resolveRoute').and.callThrough();
        spyOn(ctx, '_getApi').and.callThrough();
        spyOn(ctx, '_handleError').and.callThrough();

        var request = new Constructor(config, '/home/index');
        request.parse.call(ctx).then(function (data) {
            _d = data;
        }, function (error) {
            _e = error;
        });


        expect(ctx._getApi).toHaveBeenCalled();


        var rSpy = expect(ctx._render);
        var rSpy2 = expect(ctx._handleError);


        setTimeout(function () {
            expect(_d).toBe('_handleError');
            rSpy.toHaveBeenCalled();
            rSpy2.toHaveBeenCalled();
            done();
        }, 100);
    });


    it('_handleError', function () {

        var ctx = {
            addHeader: function () {
            },
            _render: function () {
                return 'RENDERED';
            },
            statusCode: 0,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/error'.split('/');
        };
        var response = {};

        spyOn(ctx, '_render').and.callThrough();

        var request = new Constructor(config, '/home/index');
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();

        response = {};
        ctx.isERROR = true;
        ctx._render = function (a) {
            expect(a).toBe('{}');
        };
        spyOn(ctx, '_render').and.callThrough();
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();


        response = {};
        response.trace = 'TRACE';
        ctx.isERROR = true;
        ctx._render = function (a) {
            expect(a).toBe('TRACE');
        };
        spyOn(ctx, '_render').and.callThrough();
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();


        response = {};
        response.stack = 'TRACE';
        ctx.isERROR = true;
        ctx._render = function (a) {
            expect(a).toBe('TRACE');
        };
        spyOn(ctx, '_render').and.callThrough();
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();


    });


    it('_handleError controller/core/error', function () {

        var ctx = {
            addHeader: function () {
            },
            _render: function () {
                return 'RENDERED';
            },
            statusCode: 0,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/error'.split('/');
        };


        spyOn(ctx, '_render').and.callThrough();

        var request = new Constructor(config, '/home/index');
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var eExists = di.exists(di.normalizePath('@{controllersPath}/core') + '.js');
        expect(eExists).toBe(true);


        ctx._render = function (a) {
            expect(a.indexOf('CUSTOM ERROR HANDLER') > -1).toBe(true);
        };
        spyOn(ctx, '_render').and.callThrough();

        var response = new Error('Message');
        response.code = 404;
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();

        expect(ctx.statusCode).toBe(404);

        response.code = null;
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();
        expect(ctx.statusCode).toBe(500);
    });


    it('_handleError controller/core/handler', function () {

        var ctx = {
            addHeader: function () {
            },
            _render: function () {
                return 'RENDERED';
            },
            statusCode: 0,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/handler'.split('/');
        };


        spyOn(ctx, '_render').and.callThrough();

        var request = new Constructor(config, '/home/index');
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var eExists = di.exists(di.normalizePath('@{controllersPath}/core') + '.js');
        expect(eExists).toBe(true);


        ctx._render = function (a) {
            expect(a).toBe('trace');
        };
        spyOn(ctx, '_render').and.callThrough();

        var response = new Error('Message');
        response.trace = 'trace';
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();
        expect(ctx.statusCode).toBe(500);


        ctx._render = function (a) {
            expect(a).toBe('stack');
        };
        spyOn(ctx, '_render').and.callThrough();

        response = new Error('Message');
        response.stack = 'stack';
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();
        expect(ctx.statusCode).toBe(500);
    });


    it('_handleError controller/core/noaction', function () {

        var ctx = {
            addHeader: function () {
            },
            _render: function () {
                return 'RENDERED';
            },
            statusCode: 0,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/noaction'.split('/');
        };


        spyOn(ctx, '_render').and.callThrough();

        var request = new Constructor(config, '/home/index');
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var eExists = di.exists(di.normalizePath('@{controllersPath}/core') + '.js');
        expect(eExists).toBe(true);


        var response = new Error('Message');

        var message = tryCatch(function () {
            return request._handleError.call(ctx, response);
        });

        expect(ctx.isERROR).toBe(true);
        expect(message.customMessage).toBe('Error on executing error action');
        expect(ctx.statusCode).toBe(500);

    });



    xit('_handleRoute', function () {



    });

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
