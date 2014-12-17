var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/router', function () {
    var router,
        config = {
            errorRoute: "core/error"
        },
        logger = {
            print: function () {

            },
            log: function () {

            }
        },
        componentMock = {
            get: function (name) {
                if (name == "core/logger") {
                    return logger;
                }
            }
        },
        Constructor,
        RouteRule,
        RouteRuleInterface,
        mock,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {

        RouteRuleInterface = di.load('interface/routeRule');
        RouteRule = RouteRuleInterface.inherit({}, {
            parseRequest: function () {

            },
            createUrl: function () {

            }
        });
        mock = {
            typejs: Type,
            core: core,
            error: di.load('error'),
            promise: di.load('promise'),

            "core/routeRule": RouteRule,
            "interface/routeRule": RouteRuleInterface,

            "core/component": componentMock
        };
        Constructor = di.mock('core/router', mock);
    });


    it('construct', function () {
        router = new Constructor(config);
        expect(router.config.errorRoute).toBe('core/error');
        var message = tryCatch(function () {
            new Constructor({
                errorRoute: 1
            });
        });
        expect(message.data.errorRoute).toBe(1);
        expect(message.customMessage).toBe('Router.construct: errorRoute must be string type');
    });


    it('getErrorRoute', function () {
        router = new Constructor(config);
        var error = router.getErrorRoute();
        expect(error[0]).toBe('core');
        expect(error[1]).toBe('error');
    });


    it('add', function () {
        router = new Constructor(config);
        router.add({
            pattern: 'test/redirect',
            route: 'test/redirect',
            method: ['GET']
        });
        router.add([
            {
                pattern: 'a/redirect',
                route: 'test/redirect',
                method: ['GET']
            },
            {
                pattern: 'b/redirect',
                route: 'test/redirect',
                method: ['GET']
            }
        ]);
        expect(router.routes.length).toBe(3);
    });

    it('add RouteInterfaceError', function () {

        var Constructor = di.mock('core/router', core.extend(mock, {
            "core/routeRule": function () {
            }
        }));
        router = new Constructor(config);
        var message = tryCatch(function () {
            router.add({
                pattern: 'test/redirect',
                route: 'test/redirect',
                method: ['GET']
            });
        });
        expect(message.customMessage).toBe('Router.add: rule must be instance of RouteRuleInterface');
    });


    it('add dynamic', function () {

        var Constructor = di.mock('core/router', core.extend(mock, {
            "core/routeRule": function () {
            }
        }));
        router = new Constructor(config);

        router.add({
            dynamic: true,
            constructor: RouteRule
        });
        expect(router.routes.length).toBe(1);

        var message = tryCatch(function () {
            router.add({
                dynamic: true,
                constructor: 1
            });
        });
        expect(message.customMessage).toBe('Router.add: dynamic route is not function');
    });


    it('createUrl', function () {
        var RouteRule = RouteRuleInterface.inherit({}, {
            parseRequest: function () {

            },
            createUrl: function (route, params) {
                if (route === 'user/view') {
                    return 'user/' + params.id;
                }
                return false;
            }
        });
        var Constructor = di.mock('core/router', core.extend(mock, {
            "core/routeRule": RouteRule
        }));
        router = new Constructor(config);


        var message = tryCatch(function () {
            return router.createUrl(1, 1);
        });
        expect(message.customMessage).toBe('RouteRule.createUrl: route must be string type');

        message = tryCatch(function () {
            return router.createUrl('home/index', 1);
        });
        expect(message.customMessage).toBe('RouteRule.createUrl: params must be object type');

        var url = router.createUrl('home/index', {id: 1, '#': 'element-id'});
        expect(url).toBe('/home/index?id=1#element-id');

        url = router.createUrl('home/index');
        expect(url).toBe('/home/index');


        router.add({
            pattern: 'user/<id:(\\d+)>',
            route: 'user/view',
            method: ['GET']
        });

        url = router.createUrl('user/view', {id: 55});
        expect(url).toBe('/user/55');

    });


    it('parseRequest', function () {
        var RouteRule = RouteRuleInterface.inherit({}, {
            parseRequest: function (method, parsedUrl) {
                if (parsedUrl.pathname === '/user/view') {
                    return ['user/view', {id: 1}];
                }
            },
            createUrl: function (route, params) {
                if (route === 'user/view') {
                    return 'user/' + params.id;
                }
                return false;
            }
        });
        var Constructor = di.mock('core/router', core.extend(mock, {
            "core/routeRule": RouteRule
        }));
        router = new Constructor(config);


        router.add({
            pattern: 'user/<id:(\\d+)>',
            route: 'user/view',
            method: ['GET']
        });


        var route = router.parseRequest('GET', {pathname: '/user/view'});
        expect(route[0]).toBe('user/view');
        expect(route[1].id).toBe(1);
        expect(route.length).toBe(2);

        route = router.parseRequest('GET', {pathname: '/home/view'});
        expect(route.length).toBe(0);
    });


    it('trim', function () {

        router = new Constructor(config);

        expect(router.trim('/abc/abc/', '/')).toBe('abc/abc');
        expect(router.trim('/abc/abc', '/')).toBe('abc/abc');
        expect(router.trim('abc/abc/', '/')).toBe('abc/abc');
        expect(router.trim(1, '/')).toBe(1);

    });


    it('process 1', function (done) {

        var RouteRule = RouteRuleInterface.inherit({}, {
            parseRequest: function (method, parsedUrl) {
                if (parsedUrl.pathname === '/user/view') {
                    return ['user/view', {id: 1}];
                }
            },
            createUrl: function (route, params) {
                if (route === 'user/view') {
                    return 'user/' + params.id;
                }
                return false;
            }
        });
        var Constructor = di.mock('core/router', core.extend(mock, {
            "core/routeRule": RouteRule
        }));
        router = new Constructor(config);


        router.add({
            pattern: 'user/<id:(\\d+)>',
            route: 'user/view',
            method: ['GET']
        });


        var promise = router.process('GET', {pathname: '/user/view'});
        promise.then(function (data) {
            expect(data[0]).toBe('user/view');
            expect(data[1].id).toBe(1);
            done();
        });

    });


    it('process 2', function (done) {

        var RouteRule = RouteRuleInterface.inherit({}, {
            parseRequest: function (method, parsedUrl) {
                if (parsedUrl.pathname === '/user/view') {
                    return ['user/view', {id: 1}];
                }
            },
            createUrl: function (route, params) {
                if (route === 'user/view') {
                    return 'user/' + params.id;
                }
                return false;
            }
        });
        var Constructor = di.mock('core/router', core.extend(mock, {
            "core/routeRule": RouteRule
        }));
        router = new Constructor(config);


        router.add({
            pattern: 'user/<id:(\\d+)>',
            route: 'user/view',
            method: ['GET']
        });


        var promise = router.process('GET', {pathname: '/user/view1'});
        promise.then(null, function (error) {
            expect(error.name).toBe('HttpError');
            expect(error.code).toBe(404);
            expect(error.customMessage).toBe('Not found');
            done();
        });

    });


    it('process 3', function (done) {

        var RouteRule = RouteRuleInterface.inherit({}, {
            parseRequest: function (method, parsedUrl) {
                return parsedUrl.pathname.b.c;
            },
            createUrl: function (route, params) {}
        });
        var Constructor = di.mock('core/router', core.extend(mock, {
            "core/routeRule": RouteRule
        }));
        router = new Constructor(config);


        router.add({
            pattern: 'user/<id:(\\d+)>',
            route: 'user/view',
            method: ['GET']
        });


        var promise = router.process('GET', {pathname: '/user/view1'});
        promise.then(null, function (error) {
            expect(error.name).toBe('HttpError');
            expect(error.code).toBe(500);
            expect(error.customMessage).toBe('Not found');
            done();
        });

    });

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
