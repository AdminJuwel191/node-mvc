"use strict";
var di = require('../../'), fs = di.load('fs'), path = di.load('path');
describe('core/routeRule', function () {
    var routeRule,
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
        componentMock = {
            get: function (name) {
                if (name == "core/logger") {
                    return logger;
                }
            }
        },
        Constructor,
        mock,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {

        var routeRuleInterface = di.load('interface/routeRule');

        mock = {
            typejs: Type,
            core: core,
            error: di.load('error'),
            promise: di.load('promise'),
            "interface/routeRule": routeRuleInterface,
            "core/component": componentMock
        };
        Constructor = di.mock('core/routeRule', mock);
    });


    it('construct case 3', function () {

        var params;
        routeRule = new Constructor({
            pattern: 'posts/<action>',
            route: 'posts/view',
            method: ['GET', 'POST']
        });


        expect(routeRule.routeParams.length).toBe(0);
        expect(routeRule.paramRules.length).toBe(1);

        params = routeRule.paramRules[0];


        expect(params.key).toBe('action');
        expect(params.value).toBe('');

        expect(routeRule.template).toBe('posts/<action>');
        expect(routeRule.routeRule).toBe(null);
        expect(routeRule.route).toBe('posts/view');

        expect(routeRule.pattern.regex.source).toBe('^posts/([^/]+)$');

        expect(routeRule.methods[0]).toBe('GET');
        expect(routeRule.methods[1]).toBe('POST');

        var result = routeRule.parseRequest('GET', {pathname: '/posts/test', query: {}});
        expect(result[0]).toBe('posts/view');
        expect(Object.keys(result[1]).length).toBe(1);
        /// this is valid since routeRule is null in this case
        expect(routeRule.createUrl('posts/test', {})).toBe(false);

        expect(routeRule.createUrl('posts/view', {})).toBe(false);
    });


    it('construct case 7', function () {
        routeRule = new Constructor({
            pattern: '/p-<action:([a-z]+)>-<id:(\\d+)>',
            route: 'home/index',
            method: ['GET', 'POST']
        });
        var result = routeRule.parseRequest('GET', {pathname: '/p-one-2', query: {}});

        expect(result[0]).toBe('home/index');
        expect(result.length).toBe(2);
        expect(routeRule.createUrl('home/index', {action: 'one', id: 2})).toBe('p-one-2');
    });

    it('construct case 8', function () {

        routeRule = new Constructor({
            pattern: '/p-<action:([a-z]+)>-<id:(\\d+)>/<be:(\\d+)>',
            route: 'home/index',
            method: ['GET', 'POST']
        });
        var result = routeRule.parseRequest('GET', {pathname: '/p-one-2/1', query: {}});

        expect(result[0]).toBe('home/index');
        expect(result.length).toBe(2);
        expect(routeRule.createUrl('home/index', {action: 'one', id: 2, be: 1})).toBe('p-one-2/1');
    });

    it('construct case 9', function () {
        routeRule = new Constructor({
            pattern: '/p-<action:(\\w+)>-<id:(\\d+)>/<be:(\\d+)>',
            route: 'home/index',
            method: ['GET', 'POST']
        });
        var result = routeRule.parseRequest('GET', {pathname: '/p-one-2/1', query: {}});

        expect(result[0]).toBe('home/index');
        expect(result.length).toBe(2);
        expect(routeRule.createUrl('home/index', {action: 'one', id: 2, be: 1})).toBe('p-one-2/1');
    });

    it('construct case 10', function () {
        routeRule = new Constructor({
            pattern: '/p-<action:(\\w+)>-<id:(\\d+)>/<be:(\\d+)>-<d:([a-z]+)>',
            route: 'home/index',
            method: ['GET', 'POST']
        });
        var result = routeRule.parseRequest('GET', {pathname: '/p-one-2/1-abc', query: {}});

        expect(result[0]).toBe('home/index');
        expect(result.length).toBe(2);
        expect(routeRule.createUrl('home/index', {action: 'one', id: 2, be: 1, d:'abc'})).toBe('p-one-2/1-abc');
    });

    it('construct case 11', function () {
        routeRule = new Constructor({
            pattern: '/p-<action:(\\w+)>-<id:(\\d+)>/<be:(\\d+)>-([a-z]+)',
            route: 'home/index',
            method: ['GET', 'POST']
        });

        var result = routeRule.parseRequest('GET', {pathname: '/p-one-2/1-abc', query: {}});

        expect(result[0]).toBe('home/index');
        expect(result.length).toBe(2);
        expect(routeRule.createUrl('home/index', {action: 'one', id: 2, be: 1, d:'abc'})).toBe(false);
    });

    it('construct case', function () {
        var params;
        routeRule = new Constructor({
            pattern: 'posts/<action:([a-z]+)>/(\\d+)',
            route: 'posts/<action>',
            method: ['GET', 'POST']
        });

        params = routeRule.routeParams[0];
        expect(params.key).toBe('action');
        expect(params.value).toBe('<action>');

        expect(routeRule.template).toBe('posts/<action>/(\\d+)');
        expect(routeRule.routeRule).toBe('^posts/(?P<action>([a-z]+))$');
        expect(routeRule.route).toBe('posts/<action>');

        expect(routeRule.pattern.regex.source).toBe('^posts/([a-z]+)/(\\d+)$');

        expect(routeRule.methods[0]).toBe('GET');
        expect(routeRule.methods[1]).toBe('POST');

        var result = routeRule.parseRequest('GET', {pathname: '/posts/test/55', query: {}});

        expect(result[0]).toBe('posts/test');
        expect(Object.keys(result[1]).length).toBe(0);
        expect(result.length).toBe(2);

        expect(routeRule.createUrl('posts/test', {id: 55})).toBe(false);

        expect(routeRule.createUrl('posts/test', {id: 'A'})).toBe(false);
    });

    it('construct case 6', function () {
        var params;
        routeRule = new Constructor({
            pattern: '/',
            route: 'home/index',
            method: ['GET', 'POST']
        });
        var result = routeRule.parseRequest('GET', {pathname: '/', query: {}});
        expect(result[0]).toBe('home/index');
        expect(result.length).toBe(2);
        expect(routeRule.createUrl('home/index', {})).toBe('/');
    });
    it('construct case 1', function () {
        var params;
        routeRule = new Constructor({
            pattern: 'posts/<action:([a-z]+)>/<id:(\\d+)>',
            route: 'posts/<action>',
            method: ['GET', 'POST']
        });


        params = routeRule.routeParams[0];
        expect(params.key).toBe('action');
        expect(params.value).toBe('<action>');

        expect(routeRule.template).toBe('posts/<action>/<id>');
        expect(routeRule.routeRule).toBe('^posts/(?P<action>([a-z]+))$');
        expect(routeRule.route).toBe('posts/<action>');

        expect(routeRule.pattern.regex.source).toBe('^posts/([a-z]+)/(\\d+)$');

        expect(routeRule.methods[0]).toBe('GET');
        expect(routeRule.methods[1]).toBe('POST');

        var result = routeRule.parseRequest('GET', {pathname: '/posts/test/55', query: {}});

        expect(result[0]).toBe('posts/test');
        expect(result[1].id).toBe('55');
        expect(result.length).toBe(2);


        result = routeRule.parseRequest('GET', {pathname: '/posts/test/55', query: {test: 'one'}});


        expect(result[0]).toBe('posts/test');
        expect(result[1].id).toBe('55');
        expect(result[1].test).toBe('one');
        expect(result.length).toBe(2);


        result = routeRule.parseRequest('GET', {pathname: '/posts/test/77', query: {id: '555'}});
        expect(result[0]).toBe('posts/test');
        expect(result[1].id).toBe('77');
        expect(routeRule.createUrl('posts/test', {id: 55})).toBe('posts/test/55');
        expect(routeRule.createUrl('posts/test', {id: 55, a: 1, b: 2})).toBe('posts/test/55?a=1&b=2');
        expect(routeRule.createUrl('posts/test', {id: 'A'})).toBe(false);
    });



    it('construct case 2', function () {

        var params, paramRules;
        routeRule = new Constructor({
            pattern: 'posts/<action:([a-z]+)>',
            route: 'posts/<action>',
            method: ['GET', 'POST']
        });

        expect(routeRule.routeParams.length).toBe(1);
        expect(routeRule.paramRules.length).toBe(0);
        params = routeRule.routeParams[0];

        expect(params.key).toBe('action');
        expect(params.value).toBe('<action>');



        expect(routeRule.template).toBe('posts/<action>');
        expect(routeRule.routeRule).toBe('^posts/(?P<action>([a-z]+))$');
        expect(routeRule.route).toBe('posts/<action>');

        expect(routeRule.pattern.regex.source).toBe('^posts/([a-z]+)$');

        expect(routeRule.methods[0]).toBe('GET');
        expect(routeRule.methods[1]).toBe('POST');

        var result = routeRule.parseRequest('GET', {pathname: '/posts/test', query: {}});
        expect(result[0]).toBe('posts/test');
        expect(Object.keys(result[1]).length).toBe(0);
        expect(result.length).toBe(2);

        /// this is valid since routeRule is null in this case
        expect(routeRule.createUrl('posts/test', {})).toBe('posts/test');

        expect(routeRule.createUrl('posts/view', {})).toBe('posts/view');
        expect(routeRule.createUrl('posts/view1', {})).toBe(false);
    });




    it('construct case 4', function () {

        routeRule = new Constructor({
            pattern: 'posts',
            route: 'posts/index',
            method: ['GET', 'POST']
        });

        expect(routeRule.routeParams.length).toBe(0);
        expect(routeRule.paramRules.length).toBe(0);

        expect(routeRule.template).toBe('posts');
        expect(routeRule.routeRule).toBe(null);
        expect(routeRule.route).toBe('posts/index');

        expect(routeRule.pattern.group).toBe(false);
        expect(routeRule.pattern.regex.source).toBe('^posts$');

        expect(routeRule.methods[0]).toBe('GET');
        expect(routeRule.methods[1]).toBe('POST');

        var result = routeRule.parseRequest('GET', {pathname: '/posts', query: {}});
        expect(result[0]).toBe('posts/index');
        expect(Object.keys(result[1]).length).toBe(0);
        /// this is valid since routeRule is null in this case
        expect(routeRule.createUrl('posts', {})).toBe(false);

        expect(routeRule.createUrl('posts/index', {})).toBe('posts');
    });



    it('construct case 5', function () {

        var params;
        routeRule = new Constructor({
            pattern: 'posts/<action:([a-z]+)>',
            route: 'posts/index'
        });


        expect(routeRule.routeParams.length).toBe(0);
        expect(routeRule.paramRules.length).toBe(1);


        params =  routeRule.paramRules[0];

        expect(params.key).toBe('action');
        expect(params.value.source).toBe('^([a-z]+)$');

        expect(routeRule.template).toBe('posts/<action>');
        expect(routeRule.routeRule).toBe(null);
        expect(routeRule.route).toBe('posts/index');

        expect(routeRule.pattern.regex.source).toBe('^posts/([a-z]+)$');

        expect(routeRule.methods[0]).toBe('GET');


        var result = routeRule.parseRequest('GET', {pathname: '/posts/test', query: {}});
        expect(result[0]).toBe('posts/index');
        expect(result[1].action).toBe('test');


        result = routeRule.parseRequest('POST', {pathname: '/posts/test', query: {}});
        expect(result).toBe(false);

        /// this is valid since routeRule is null in this case
        expect(routeRule.createUrl('posts/test', {})).toBe(false);
        expect(routeRule.createUrl('posts/index', {})).toBe(false);
    });


    it('construct errors', function () {

        var message;
        message = tryCatch(function() {
            new Constructor({

                route: 'posts/index'
            });
        });
        expect(message.customMessage).toBe('RouteRule: rule object must have an pattern property');

        message = tryCatch(function() {
            new Constructor({
                pattern: 1,
                route: 'posts/index'
            });
        });
        expect(message.customMessage).toBe('RouteRule: rule.pattern must be string type');

        message = tryCatch(function() {
            new Constructor({
                pattern: 'posts/index',
                route: 1
            });
        });

        expect(message.message).toBe('key: route, value: "number"  (1), is expected to be: "string" type.');


        message = tryCatch(function() {
            new Constructor({
                pattern: 'posts/index'
            });
        });

        expect(message.customMessage).toBe('RouteRule: rule object must have an route property');
    });



    it('construct case 6', function () {

        var routeParams, paramRules;
        routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>'
        });



        expect(routeRule.routeParams.length).toBe(1);
        expect(routeRule.paramRules.length).toBe(1);


        routeParams =  routeRule.routeParams[0];
        expect(routeParams.key).toBe('action');
        expect(routeParams.value).toBe('<action>');

        paramRules =  routeRule.paramRules[0];
        expect(paramRules.key).toBe('id');
        expect(paramRules.value.source).toBe('^(\\d+)$');

        expect(routeRule.template).toBe('posts/<action>/<id>');
        expect(routeRule.routeRule).toBe('^posts/(?P<action>(create|update|delete))$');
        expect(routeRule.route).toBe('posts/<action>');

        expect(routeRule.pattern.regex.source).toBe('^posts/(create|update|delete)/(\\d+)$');

        expect(routeRule.methods[0]).toBe('GET');


        expect(routeRule.createUrl('posts/create', {id: 1})).toBe('posts/create/1');
        expect(routeRule.createUrl('posts/delete', {id: 55})).toBe('posts/delete/55');
        expect(routeRule.createUrl('posts/update', {id: 1000})).toBe('posts/update/1000');
        expect(routeRule.createUrl('posts/create', {id: 'test'})).toBe(false);
        expect(routeRule.createUrl('posts/index', {id: 1})).toBe(false);
    });


    it('construct case 7', function () {
        var message = tryCatch(function() {
            new Constructor({
                pattern: 'posts/<view:(create|update|delete)>/<id:(\\d+)>',
                route: 'posts/<action>'
            });
        });
        expect(message.customMessage).toBe('RouteRule: invalid route rule');
    });



    it('buildQuery', function () {
        var routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>'
        });

        expect(routeRule.buildQuery({id: 1, a: 'test', b: '"', c: '&'})).toBe('id=1&a=test&b=%22&c=%26');
    });


    it('checkMethod', function () {
        var routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>',
            method: ['GET', 'POST', 'PUT']
        });
        expect(routeRule.checkMethod('PUT')).toBe(true);
        expect(routeRule.checkMethod('GET')).toBe(true);
        expect(routeRule.checkMethod('POST')).toBe(true);
        expect(routeRule.checkMethod('OPTION')).toBe(false);
    });

    it('find', function () {
        var routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>',
            method: ['GET', 'POST', 'PUT']
        });
        var item = {key: 'test', item: 'test'};
        var data = [item];
        expect(routeRule.find(data, 'test')).toBe(item);

        expect(routeRule.find(data, function(a) {return a.item === 'test'; })).toBe(item);
    });


    it('toObject', function () {
        var routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>',
            method: ['GET', 'POST', 'PUT']
        });
        var arr = [1, 2, 3];
        var obj = routeRule.toObject(arr);
        expect(obj[0]).toBe(1);
        expect(obj[1]).toBe(2);
        expect(obj[2]).toBe(3);
    });


    it('trim', function () {
        var routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>',
            method: ['GET', 'POST', 'PUT']
        });

        expect(routeRule.trim('/aaa/bcc', '/')).toBe('aaa/bcc');

        var message = tryCatch(function() {
            routeRule.escape(1, [{key: 'bcc', value: 'ac'}]);
        });
        expect(message.customMessage).toBe('RouteRule.escape: str must be a string type');

        message = tryCatch(function() {
            routeRule.escape('abc', 1);
        });
        expect(message.customMessage).toBe('RouteRule.escape: escape must be a array type');
    });



    it('escape', function () {
        var routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>',
            method: ['GET', 'POST', 'PUT']
        });

        expect(routeRule.escape('aaa/bcc', [{key: 'bcc', value: 'ac'}])).toBe('aaa/ac');
    });


    it('toRegex', function () {
        var routeRule = new Constructor({
            pattern: 'posts/index',
            route: 'posts/index',
            method: ['GET', 'POST', 'PUT']
        });

        var obj = routeRule.toRegex('([0-9]+)/<action:(create|update|delete)>/<id:(\\d+)>');

        expect(obj.group.length).toBe(3);

        var g = obj.group;

        expect(g[0].isNamed).toBe(false);
        expect(g[0].pattern).toBe('([0-9]+)');
        expect(g[0].key).toBe(null);
        expect(g[0].index).toBe(0);

        expect(g[1].isNamed).toBe(false);
        expect(g[1].pattern).toBe('(create|update|delete)');
        expect(g[1].key).toBe(null);
        expect(g[1].index).toBe(1);

        expect(g[1].isNamed).toBe(false);
        expect(g[1].pattern).toBe('(create|update|delete)');
        expect(g[1].key).toBe(null);
        expect(g[1].index).toBe(1);

        obj = routeRule.toRegex('abc/cd');
        expect(obj.group).toBe(false);
        expect(obj.regex.source).toBe('abc/cd');
    });



    it('match', function () {
        var routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/index',
            method: ['GET', 'POST', 'PUT']
        });

        var rgx = routeRule.toRegex('(?P<action>(create|update|delete))/(?P<id>(\\d+))');
        var matches = routeRule.match(rgx, 'create/1');

        expect(matches[0].key).toBe('action');
        expect(matches[0].value).toBe('create');

        expect(matches[1].key).toBe('id');
        expect(matches[1].value).toBe('1');

        expect(matches.length).toBe(2);

    });


    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
