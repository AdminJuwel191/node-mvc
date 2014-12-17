"use strict";
var di = require('../../'), fs = di.load('fs'), path = di.load('path');
describe('core/routeRule', function () {
    var routeRule,
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

        expect(routeRule.createUrl('posts/test', {id: 55})).toBe('posts/test/55');

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


    it('toRegex', function () {


        routeRule = new Constructor({
            pattern: 'posts/<action:(create|update|delete)>/<id:(\\d+)>',
            route: 'posts/<action>'
        });


        //var regex = routeRule.toRegex('^posts/(?P<action>(create|update|delete))/(?P<id>(\\d+))$');
        //console.log('regex', regex);
    });



    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
