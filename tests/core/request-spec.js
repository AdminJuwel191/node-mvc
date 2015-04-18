var di = require('../../'), fs = di.load('fs'), path = di.load('path');
describe('core/request', function () {
    "use strict";
    var request,
        config = {},
        Promise = di.load('promise'),
        logger = {
            info: function () {

            },
            error: function() {

            },
            log: function() {

            },
            warn: function() {

            }
        },
        router = {
            createUrl: function (a, params) {
                if (params) {
                    return '/' + a + '?id=' + params.id;
                }
                return '/' + a;
            },
            process: function () {
                return Promise.resolve('handler');
            },
            getErrorRoute: function () {
            },
            trim: function (a) {
                return a;
            }
        },
        hooks = {
            process: function () {
            }
        },
        view = {
            setPaths: function () {}
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
                } else if (name == "core/view") {
                    return view;
                }
            }
        },
        Constructor,
        mock,
        zLib = {
            gzip: function (response, callback) {
                return callback(false, response);
            },
            deflate: function (response, callback) {
                return callback(false, response);
            }
        },
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        config = {
            request: {
                connection: {},
                method: 'GET',
                on: function () {

                },
                once: function () {},
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
                },
                on: function () {

                },
                once: function () {}
            }
        };

        mock = {
            typejs: Type,
            core: core,
            error: error,
            promise: Promise,
            util: di.load('util'),
            url: di.load('url'),
            zlib: zLib,
            "interface/controller": di.load('interface/controller'),
            "core/component": componentMock,
            "interface/module": di.load('interface/module')
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
        expect(request.id.length).toBe(36);
    });


    
    it('parse', function (done) {
        request = new Constructor(config, '/home/index');

        var ctx = {
            body: [],
            isForwarded: false,
            isRendered: true,
            request: {
                on: function(name, resolve) {

                    resolve();
                    return true;
                },
                emit: function() {
                    return true;
                }
            },
            _destroy: function () {},
            _process: function() {
                return 'process';
            }
        };

        spyOn(ctx.request, 'on').and.callThrough();
        spyOn(ctx, '_destroy').and.callThrough();
        spyOn(ctx, '_process').and.callThrough();


        request.parse.call(ctx).then(function(data) {
            expect(ctx.request.on).toHaveBeenCalled();
            expect(ctx._destroy).toHaveBeenCalled();
            expect(ctx._process).toHaveBeenCalled();
            done();
        });
    });


    it('parse forward', function () {
        request = new Constructor(config, '/home/index');

        var ctx = {
            isForwarded: true,
            isRendered: true,
            request: {
                emit: function() {
                    return true;
                }
            },
            _destroy: function () {},
            _process: function() {
                return {
                    then: function(a, b) {
                        a();
                        b();
                    }
                };
            }
        };

        spyOn(ctx, '_destroy').and.callThrough();
        spyOn(ctx, '_process').and.callThrough();


        request.parse.call(ctx);

        expect(ctx._destroy).toHaveBeenCalled();
        expect(ctx._process).toHaveBeenCalled();
    });

    it('getRequestBody', function () {
        request = new Constructor(config, '/home/index');
        request.body = [new Buffer('a'), new Buffer('b')];
        expect(request.getRequestBody().toString('utf8')).toBe('ab');

        request.body = [];
        expect(request.getRequestBody()).toEqual([]);
    });

    it('onEnd', function () {
        request = new Constructor(config, '/home/index');
        spyOn(config.request, "once").and.callThrough();
        request.onEnd(function () {

        });
        expect(config.request.once).toHaveBeenCalled();
    });


    it('setStatusCode', function () {
        request = new Constructor(config, '/home/index');
        request.setStatusCode(500);
        expect(request.statusCode).toBe(500);

        var message = tryCatch(function() {
            request.setStatusCode('500');
        });
        expect(message.indexOf('Status code must be number type') > -1).toBe(true);
    });



    it('getHeaders|addHeader|getHeader', function () {
        config.response.writeHead = function (code, headers) {
            expect(code).toBe(304);
            expect(headers['content-type']).toBe('text/html');
            expect(headers['content-length']).toBe('180');
        };
        request = new Constructor(config, '/home/index');

        request.addHeader('Content-Type', 'text/html');
        request.addHeader('Content-Length', 180);
        request.addHeader('Set-cookie', "one=1");
        request.addHeader('Set-cookie', "three=3");
        request.addHeader('Set-cookie', "three=5");
        request.addHeader('a', undefined);
        request.addHeader('b', null);

        var headers = request.getHeaders();
        expect(headers['content-type']).toBe('text/html');
        expect(headers['content-length']).toBe('180');
        expect(headers['set-cookie']).toEqual([ 'one=1', 'three=3', 'three=5' ]);
        var message = tryCatch(function () {
            request.addHeader(1, '180');
        });
        expect(message.indexOf('Request.addHeader: Header key must be string type') > -1).toBe(true);
        expect(request.getHeader('content-type')).toBe('text/html');
        expect(request.getHeader('non-existing')).toBe(false);


        expect(request.getHeader('a')).toBe(false);
        expect(request.getHeader('b')).toBe(false);
    });


    it('hasHeader', function () {
        request = new Constructor(config, '/home/index');

        request.addHeader('Content-Type', 'text/html');
        request.addHeader('Content-Length', 180);

        expect(request.hasHeader('Content-Type')).toBe(true);
        expect(request.hasHeader('Content-Length')).toBe(true);
        var message = tryCatch(function () {
            request.hasHeader(1);
        });
        expect(message.indexOf('Request.hasHeader: Header key must be string type') > -1).toBe(true);
    });


    it('getMethod', function () {
        request = new Constructor(config, '/home/index');
        expect(request.getMethod()).toBe('GET');
    });

    it('sendNoChange', function () {
        config.response.writeHead = function (code, headers) {
            expect(code).toBe(304);
        };
        request = new Constructor(config, '/home/index');


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
        expect(message.indexOf('Request.getRequestHeader: Header key must be string type') > -1).toBe(true);
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
        di.setAlias('modulesPath', __dirname + '/../tf/modules/');
        request = new Constructor(config, '/user/home/index');
        var params = {id: 1};

        var ctx = {};
        ctx._handleController = function () {};
        ctx._handleModule = function () {};


        spyOn(ctx, '_handleModule');
        request._resolveRoute.call(ctx, ['user/home/index', params]);

        expect(ctx._handleModule).toHaveBeenCalled();
        expect(ctx.statusCode).toBe(undefined);
        expect(ctx.route).toBe('user/home/index');
        expect(ctx.params).toBe(params);
        expect(ctx.module).toBe('user');
        expect(ctx.controller).toBe('home');
        expect(ctx.action).toBe('index');

    });


    it('_resolveRoute 2', function () {
        config.request.headers = {};
        di.setAlias('modulesPath', __dirname + '/../tf/modules/');
        di.setAlias('controllersPath', di.getAlias('modulesPath') + 'controllers/');
        di.setAlias('viewsPath', __dirname + '/../tf/templates/theme/');
        request = new Constructor(config, '/home/index');
        var params = {id: 1};

        var ctx = {};
        ctx._handleController = function () {};
        ctx._handleModule = function () {};

        spyOn(ctx, '_handleController');
        request._resolveRoute.call(ctx, ['home/index', params]);

        expect(ctx._handleController).toHaveBeenCalled();
        expect(ctx.statusCode).toBe(undefined);
        expect(ctx.route).toBe('home/index');
        expect(ctx.params).toBe(params);
        expect(ctx.module).toBe(undefined);
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
                expect(error.message).toBe('CUSTOM');
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
            return new error.HttpError(500, {}, "CUSTOM");
        });


        promise.then(null, function () {
            done();
        });
    });


    it('_chain error 1', function (done) {
        var ctx = {
            _handleError: function (error) {
                expect(error.message).toBe('Error on executing action');
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
            return a.b.c.a.d;
        });


        promise.then(null, function () {
            done();
        });
    });

    it('_chain error2', function (done) {
        var ctx = {
            _handleError: function (error) {
                expect(error.message).toBe('Error on executing action');
            }
        };
        request = new Constructor(config, '/home/index');

        spyOn(ctx, '_handleError').and.callThrough();

        var promise = request._chain.call(ctx, null, function () {
            return {}.b.c;
        });

        promise.then(null, function () {

            done();
        });
    });

    it('_chain error2 2', function (done) {
        var ctx = {
            _handleError: function (error) {
                expect(error.message).toBe('CUSTOM');
            }
        };
        request = new Constructor(config, '/home/index');

        spyOn(ctx, '_handleError').and.callThrough();

        var promise = request._chain.call(ctx, null, function () {
            return new error.HttpError(500, {}, "CUSTOM");
        });

        promise.then(null, function () {

            done();
        });
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
            },
            getHeader: function () {

            }
        };
        var response = 'TEST';

        request = new Constructor(config, '/home/index');

        ctx.response.end = function (r) {
            expect(r).toBe(response);
        };
        spyOn(ctx, '_checkContentType');
        spyOn(ctx, 'addHeader');
        spyOn(ctx, 'getHeader');
        expect(request._render.call(ctx, response)).toBe(true);
        expect(ctx.addHeader).toHaveBeenCalled();
        expect(ctx.getHeader).toHaveBeenCalled();
        expect(ctx._checkContentType).toHaveBeenCalled();

        ctx.isRendered = false;
        var response = new Buffer(111);
        ctx.response.end = function (r) {
            expect(r).toBe(response);
        };
        expect(request._render.call(ctx, response)).toBe(true);

        var message = tryCatch(function () {
            ctx.isRendered = false;
            request = new Constructor(config, '/home/index');
            request._render.call(ctx);
        });

        expect(message.indexOf('No data to render') > -1).toBe(true);
        expect(message.indexOf('500') > -1).toBe(true);


        message = tryCatch(function () {
            ctx.isRendered = false;
            request = new Constructor(config, '/home/index');
            request._render.call(ctx, {});
        });
        expect(message.indexOf('Invalid response type, string or buffer is required!') > -1).toBe(true);
        expect(message.indexOf('500') > -1).toBe(true);
        ctx.isRendered = true;
        expect(request._render.call(ctx, response)).toBe(false);
    });


    it('_process', function (done) {

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

            _compress: function (data) {
                return data;
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
        request._process.call(ctx).then(function (data) {
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


    it('_process 2', function (done) {
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
            _compress: function (data) {
                return data;
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
        request._process.call(ctx).then(function (data) {
            _d = data;
        }, function (error) {
            _e = error;
        });


        expect(ctx._getApi).toHaveBeenCalled();


        var rSpy = expect(ctx._render);
        var rSpy2 = expect(ctx._handleError);


        setTimeout(function () {

            rSpy.toHaveBeenCalled();
            rSpy2.toHaveBeenCalled();
            done();
        }, 100);
    });


    it('_process 3', function (done) {


        hooks.process = function (api) {
            api.sendNoChange();
            return Promise.resolve(false);
        };

        var ctx = {
            response: {
                writeHead: function () {}
            },
            _render: function (a) {
                return a;
            },
            _resolveRoute: function () {
                return 'resolveRoute';
            },
            _getApi: function () {
                var that = this;
                return {
                    sendNoChange: function() {
                        that.isPromiseChainStopped = true;
                    }
                };
            },
            _handleError: function () {
                return '_handleError';
            },
            _compress: function (data) {
                return data;
            },
            isPromiseChainStopped: false
        };



        var request = new Constructor(config, '/home/index');
        request.body = [];
        request._process.call(ctx).then(function (data) {
            expect(data).toBe(false);
            expect(ctx.isPromiseChainStopped).toBe(true);
            done();
        });


    });


    it('_handleError', function () {

        var ctx = {
            request: {},
            response: {
                writeHead: function () {},
                end: function () {}
            },

            addHeader: function () {
            },
            _render: function () {
                return 'RENDERED';
            },
            stopPromiseChain: function () {

            },
            _checkContentType: function () {},
            destroy: function () {},
            _getRouteInfo: function() {},
            getHeader: function () {},
            setStatusCode: function () {},
            statusCode: 0,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/error'.split('/');
        };
        var response = 'THIS IS AN ERROR MESSAGE, \n CODE:500 \n this is an error';

        spyOn(ctx, '_render').and.callThrough();
        spyOn(ctx, 'setStatusCode').and.callThrough();

        var request = new Constructor(config, '/home/index');

        ctx.isERROR = true;
        request._handleError.call(ctx, response);
        expect(ctx._render).toHaveBeenCalled();
        expect(ctx.setStatusCode).toHaveBeenCalled();

    });

    it('_handleError async', function (done) {

        // @todo update this test
        var ctx = {
            response: {
                writeHead: function () {},
                end: function (data) {
                    console.log('Data', data);
                }
            },
            request: {

                method: 'GET',
                on: function (name, resolve) {
                    if (name !== 'destory') {
                        resolve();
                    }
                },
                once: function (name, resolve) {
                    if (name !== 'destory') {
                        resolve();
                    }
                },
                connection: {},
                headers: {},
                getRequestHeader: function () { return ''; },
                emit: function () {}
            },

            stopPromiseChain: function () {

            },
            _destroy: function () {},
            _getRouteInfo: function() {},
            getHeader: function () {},
            setStatusCode: function () {},
            statusCode: 0,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/error'.split('/');
        };
        var response = 'THIS IS AN ERROR MESSAGE, \n CODE:500 \n this is an error';

        spyOn(ctx, 'setStatusCode').and.callThrough();


        var request = new Constructor(config, '/home/index');

        request._handleError.call(ctx, response).then(function (data) {

            expect(ctx.setStatusCode).toHaveBeenCalled();
            done();
        }).catch(function(data) {
            fail(data.stack);
            done();
        })
    });


    it('_handleError controller/core/error 404', function () {

        var ctx = {
            addHeader: function () {
            },
            _render: function () {
                return 'RENDERED';
            },
            _destroy: function () {},
            _resolveRoute: function(a) {
                var a1 = a.shift(), a2 = a.shift();
                expect(a1).toBe('core/error');
                expect(a2 instanceof Error).toBe(true);
                return Promise.reject('RESOLVED');
            },
            setStatusCode: function(code) {
                this.statusCode = code;
            },
            _getRouteInfo: function () {},
            stopPromiseChain: function () {

            },
            getHeader: function () {},
            statusCode: 0,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/error';
        };

        Constructor.prototype.parse = function () {
            return true;
        };
        spyOn(ctx, 'stopPromiseChain').and.callThrough();
        spyOn(Constructor.prototype, 'parse').and.callThrough();

        var request = new Constructor(config, '/home/index');
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var eExists = di.exists(di.normalizePath('@{controllersPath}/core') + '.js');
        expect(eExists).toBe(true);


        ctx._render = function (a) {
            expect(a.indexOf('Error') > -1).toBe(true);
        };


        var response = new Error('Message');

        request._handleError.call(ctx, response);
        expect(Constructor.prototype.parse).toHaveBeenCalled();

        expect(ctx.statusCode).toBe(500);

    });



    it('_handleError controller/core/error 500', function () {

        var ctx = {
            addHeader: function () {
            },
            _render: function () {
                return 'RENDERED';
            },
            setStatusCode: function(code) {
                this.statusCode = code;
            },
            stopPromiseChain: function () {

            },
            _getRouteInfo: function() {},
            getHeader: function () {},
            _destroy: function () {},
            statusCode: 0,
            id: 1,
            isERROR: false
        };
        router.getErrorRoute = function () {
            return 'core/error';
        };

        Constructor.prototype.parse = function () {
            return true;
        };


        spyOn(ctx, 'stopPromiseChain').and.callThrough();
        spyOn(Constructor.prototype, 'parse').and.callThrough();

        var request = new Constructor(config, '/home/index');
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var eExists = di.exists(di.normalizePath('@{controllersPath}/core') + '.js');
        expect(eExists).toBe(true);


        ctx._render = function (a) {
            expect(a.indexOf('Error') > -1).toBe(true);
        };


        var response = new Error('Message');
        request._handleError.call(ctx, response);
        expect(Constructor.prototype.parse).toHaveBeenCalled();
        expect(ctx.stopPromiseChain).toHaveBeenCalled();
        expect(ctx.statusCode).toBe(500);

    });


    it('_compress gzip', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        var headers = [];
        var ctx = {
            getRequestHeader: function () {
                return 'gzip';
            },
            hasHeader: function (key) {
                expect(key).toBe('Vary');
                return false;
            },
            addHeader: function (key, value) {
                headers.push({
                    key: key,
                    value: value
                });
            },
            isCompressionEnabled: true,
            isCompressed: false
        };
        spyOn(ctx, 'addHeader').and.callThrough();

        var promise = request._compress.call(ctx, 'STRING');

        promise.then(function (data) {
            expect(data).toBe('STRING');
            expect(ctx.isCompressed).toBe(true);
            expect(headers).toEqual([{ key : 'Vary', value : 'Accept-Encoding' }, { key : 'Content-Encoding', value : 'gzip' }]);
            done();
        }).catch(function (error) {
            fail(error);
            done();
        });
    });


    it('_compress deflate', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        var headers = [];
        var ctx = {
            getRequestHeader: function () {
                return 'deflate';
            },
            hasHeader: function (key) {
                expect(key).toBe('Vary');
                return false;
            },
            addHeader: function (key, value) {
                headers.push({
                    key: key,
                    value: value
                });
            },
            isCompressionEnabled: true,
            isCompressed: false
        };
        spyOn(ctx, 'addHeader').and.callThrough();

        var promise = request._compress.call(ctx, 'STRING');

        promise.then(function (data) {
            expect(data).toBe('STRING');
            expect(ctx.isCompressed).toBe(true);
            expect(headers).toEqual([{ key : 'Vary', value : 'Accept-Encoding' }, { key : 'Content-Encoding', value : 'deflate' }]);
            done();
        }).catch(function (error) {
            fail(error);
            done();
        });
    });

    it('_compress deflate 2', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        var headers = [];
        var ctx = {
            getRequestHeader: function () {
                return 'deflate';
            },
            hasHeader: function (key) {
                expect(key).toBe('Vary');
                return true;
            },
            addHeader: function (key, value) {
                headers.push({
                    key: key,
                    value: value
                });
            },
            isCompressionEnabled: true,
            isCompressed: false
        };
        spyOn(ctx, 'addHeader').and.callThrough();

        var promise = request._compress.call(ctx, 'STRING');

        promise.then(function (data) {
            expect(data).toBe('STRING');
            expect(ctx.isCompressed).toBe(true);
            expect(headers).toEqual([ { key : 'Content-Encoding', value : 'deflate' }]);
            done();
        }).catch(function (error) {
            fail(error);
            done();
        });
    });


    it('_compress reject deflate', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        var headers = [];
        var ctx = {
            getRequestHeader: function () {
                return 'deflate';
            },
            hasHeader: function (key) {
                expect(key).toBe('Vary');
                return true;
            },
            addHeader: function (key, value) {
                headers.push({
                    key: key,
                    value: value
                });
            },
            isCompressionEnabled: true,
            isCompressed: false
        };
        spyOn(ctx, 'addHeader').and.callThrough();

        zLib.deflate = function (response, callback) {
            return callback(true, response);
        }

        var promise = request._compress.call(ctx, 'STRING');

        promise.then(null, function (data) {
            expect(data).toBe(true);
            expect(ctx.isCompressed).toBe(false);
            expect(headers).toEqual([]);
            done();
        }).catch(function (error) {
            fail(error);
            done();
        });
    });

    it('_compress reject gzip', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        var headers = [];
        var ctx = {
            getRequestHeader: function () {
                return 'gzip';
            },
            hasHeader: function (key) {
                expect(key).toBe('Vary');
                return true;
            },
            addHeader: function (key, value) {
                headers.push({
                    key: key,
                    value: value
                });
            },
            isCompressionEnabled: true,
            isCompressed: false
        };
        spyOn(ctx, 'addHeader').and.callThrough();

        zLib.gzip = function (response, callback) {
            return callback(true, response);
        }

        var promise = request._compress.call(ctx, 'STRING');

        promise.then(null, function (data) {
            expect(data).toBe(true);
            expect(ctx.isCompressed).toBe(false);
            expect(headers).toEqual([]);
            done();
        }).catch(function (error) {
            fail(error);
            done();
        });
    });

    it('_compress no compression', function () {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        var headers = [];
        var ctx = {
            getRequestHeader: function () {
                return 'deflate';
            },
            hasHeader: function (key) {
                expect(key).toBe('Vary');
                return false;
            },
            addHeader: function (key, value) {
                headers.push({
                    key: key,
                    value: value
                });
            },
            isCompressionEnabled: false,
            isCompressed: false
        };
        spyOn(ctx, 'addHeader').and.callThrough();

        var buff = new Buffer('STRING');

        expect(request._compress.call(ctx, buff)).toBe(buff);
    });




    it('_handleModule', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'core';
        request.action = 'index';
        request.module = 'admin';
        request.params = {id: 1};
        var promise = request._handleModule('@{modulesPath}/');


        promise.then(function (data) {
            expect(data.indexOf('bindex') > -1).toBe(true);
            expect(data.indexOf('before_i') > -1).toBe(true);
            expect(data.indexOf('action_i') > -1).toBe(true);
            expect(data.indexOf('beforeEach') > -1).toBe(true);

            expect(data.indexOf('after_i') > -1).toBe(true);
            expect(data.indexOf('afterEach') > -1).toBe(true);
            expect(data.indexOf('aindex') > -1).toBe(true);
            done();
        });
    });




    it('_handleModule error', function () {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'core';
        request.action = 'index';
        request.module = 'test';
        request.params = {id: 1};
        var message = tryCatch(function () {
            request._handleModule('@{modulesPath}/');
        });
        expect(message.indexOf('Missing module') > -1).toBe(true);


        request.module = 'invalid2';
        message = tryCatch(function () {
            request._handleModule('@{modulesPath}/');
        });
        expect(message.indexOf('Module must be function type') > -1).toBe(true);


    });

    it('_handleModule error 2', function () {
        var cpath = path.normalize(__dirname + "/../tf/modules");
        di.setAlias('modulesPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'core';
        request.action = 'index';
        request.module = 'user';
        request.params = {id: 1};
        var message;
        message = tryCatch(function () {
            request._handleModule('@{modulesPath}/');
        });
        expect(message.indexOf('Module must be instance of ModuleInterface "core/module"') > -1).toBe(true);

    });


    it('_handleController', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'core';
        request.action = 'index';
        request.params = {id: 1};
        var promise = request._handleController('@{controllersPath}/');


        promise.then(function (data) {
            expect(data.indexOf('bindex') > -1).toBe(true);
            expect(data.indexOf('before_i') > -1).toBe(true);
            expect(data.indexOf('action_i') > -1).toBe(true);
            expect(data.indexOf('beforeEach') > -1).toBe(true);

            expect(data.indexOf('after_i') > -1).toBe(true);
            expect(data.indexOf('afterEach') > -1).toBe(true);
            expect(data.indexOf('aindex') > -1).toBe(true);
            done();
        });
    });


    it('_handleController stopChain', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/stop');
        request.controller = 'core';
        request.action = 'stop';
        request.params = {id: 1};
        var promise = request._handleController('@{controllersPath}/');


        promise.then(function (data) {
            expect(request.isPromiseChainStopped).toBe(true);
            expect(data.indexOf('beforeEach') > -1).toBe(true);
            expect(data.indexOf('bstop') > -1).toBe(true);
            expect(data.indexOf('before_stop') > -1).toBe(true);

            expect(data.indexOf('action_stop') > -1).toBe(false);

            expect(data.indexOf('after_stop') > -1).toBe(false);
            expect(data.indexOf('afterEach') > -1).toBe(false);
            expect(data.indexOf('astop') > -1).toBe(false);
            done();
        });
    });

    it('_handleController stopChain 2', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/stop');
        request.controller = 'core';
        request.action = 'test';
        request.params = {id: 1};
        var promise = request._handleController('@{controllersPath}/');


        promise.then(function (data) {
            expect(request.isPromiseChainStopped).toBe(true);
            expect(data.indexOf('beforeEach') > -1).toBe(true);
            expect(data.indexOf('btest') > -1).toBe(true);
            expect(data.indexOf('before_test') > -1).toBe(true);

            expect(data.indexOf('action_test') > -1).toBe(true);

            expect(data.indexOf('after_test') > -1).toBe(false);
            expect(data.indexOf('afterEach') > -1).toBe(false);
            expect(data.indexOf('atest') > -1).toBe(false);
            done();
        });
    });



    it('_handleController stopChain 3', function (done) {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/stop');
        request.controller = 'core';
        request.action = 'test2';
        request.params = {id: 1};
        var promise = request._handleController('@{controllersPath}/');


        promise.then(function (data) {
            expect(request.isPromiseChainStopped).toBe(true);
            expect(data.indexOf('beforeEach') > -1).toBe(true);
            expect(data.indexOf('btest2') > -1).toBe(true);
            expect(data.indexOf('before_test2') > -1).toBe(true);

            expect(data.indexOf('action_test2') > -1).toBe(true);

            expect(data.indexOf('after_test2') > -1).toBe(true);
            expect(data.indexOf('afterEach') > -1).toBe(false);
            expect(data.indexOf('atest2') > -1).toBe(false);
            done();
        });
    });



    it('_handleController', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'invalid';
        request.action = 'undefined';

        var message = tryCatch(function () {
            return request._handleController('@{controllersPath}/');
        });
        expect(message.indexOf('Controller must be function type') > -1).toBe(true);
    });



    it('_handleController', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'core';
        request.action = 'undefined';

        var message = tryCatch(function () {
            return request._handleController('@{controllersPath}/');
        });
        expect(message.indexOf('Missing action in controller') > -1).toBe(true);
    });


    it('_handleController 2', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'index';
        request.action = 'test';

        var message = tryCatch(function () {
            return request._handleController('@{controllersPath}/');
        });
        expect(message.indexOf('Missing controller') > -1).toBe(true);
    });


    it('_handleController 3', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/home/index');
        request.controller = 'test';
        request.action = 'test';

        var message = tryCatch(function () {
            return request._handleController('@{controllersPath}/');
        });
        expect(message.indexOf('Controller must be instance of ControllerInterface "core/controller"') > -1).toBe(true);
    });

    it('forward', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        Constructor.prototype.parse = function () {
            return this;
        };
        var request = new Constructor(config, '/core/index');
        var route = request.forward('test/index', {id: 1});
        expect(route.url).toBe('/test/index?id=1');
        expect(request.isPromiseChainStopped).toBe(true);

    });


    it('forwardUrl', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        Constructor.prototype.parse = function () {
            return this;
        };
        var request = new Constructor(config, '/core/index');
        var route = request.forwardUrl('/test/index?id=1');
        expect(route.url).toBe('/test/index?id=1');
        expect(request.isPromiseChainStopped).toBe(true);

        request.url = '/test/index?id=1';
        var message = tryCatch(function () {
            request.forwardUrl('/test/index?id=1');
        });
        expect(message.indexOf('Cannot forward to same url') > -1).toBe(true);
    });

    it('forward error', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        Constructor.prototype.parse = function () {
            return this;
        };
        var request = new Constructor(config, '/index/index');
        request.route = 'index/index';
        var message = tryCatch(function() {
            request.forward('index/index', {id: 1});
        });
        expect(message.indexOf('Cannot forward to same route') > -1).toBe(true);
    });


    it('getRequestDomain', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/index/index');
        request.request.connection.domain = 'www.igorivanovic.info';
        expect(request.getRequestDomain()).toBe('www.igorivanovic.info');
    });

    it('getRequestRemoteAddress', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/index/index');
        request.request.connection.remoteAddress = 'www.igorivanovic.info';
        expect(request.getRequestRemoteAddress()).toBe('www.igorivanovic.info');
    });

    it('getRequestRemotePort', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/index/index');
        request.request.connection.remotePort = 'www.igorivanovic.info';
        expect(request.getRequestRemotePort()).toBe('www.igorivanovic.info');
    });

    it('getRequestLocalAddress', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/index/index');
        request.request.connection.localAddress = 'www.igorivanovic.info';
        expect(request.getRequestLocalAddress()).toBe('www.igorivanovic.info');
    });

    it('getRequestLocalPort', function () {
        var cpath = path.normalize(__dirname + "/../tf/controllers");
        di.setAlias('controllersPath', cpath);
        var request = new Constructor(config, '/index/index');
        request.request.connection.localPort = 'www.igorivanovic.info';
        expect(request.getRequestLocalPort()).toBe('www.igorivanovic.info');
    });

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
