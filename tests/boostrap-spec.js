"use strict";
var di = require("../"),
    core = di.load('core');
describe('bootstrap', function () {

    var bootstrap, isLoggerGet = false, logger, server, mock, initialized, request, hasComponent = false, isComponentInitialized = hasComponent;

    beforeEach(function () {
        initialized = [];
        logger = {
            info: function () {

            },
            error: function() {

            },
            log: function() {

            },
            warn: function() {

            }
        };
        server = {
            on: function (evn, callback) {

            },
            listen: function (port) {

            },
            getEncoding: function () {

            }
        };
        mock = {
            typejs: di.load('typejs'),
            core: di.load('core'),
            error: di.load('error'),
            fs: di.load('fs'),
            'core/component': {
                set: function (name, config) {
                    initialized.push(name);
                    if (name === 'core/logger') {
                        return logger;
                    } else if (name === 'core/http') {
                        return server;
                    } else if (name === 'core/request') {
                        return request;
                    }
                },
                has: function (name) {
                    return hasComponent;
                },
                get: function (name) {
                    if (name === 'core/logger') {
                        isLoggerGet = true;
                        return logger;
                    } else if (name === 'core/http') {
                        return server;
                    } else if (name === 'core/request') {
                        return request;
                    }
                },
                init: function () {
                    isComponentInitialized = true;
                }
            }
        };
        bootstrap = di.mock('bootstrap', mock);
    });

    it('shuld be instanciated', function () {
        var basePath = di.normalizePath(__dirname + '/'),
            assetsPath = di.normalizePath(__dirname + '/assets/');

        bootstrap.setBasePath(basePath);
        bootstrap.setAssetsPath(assetsPath);

        expect(di.getAlias("basePath")).toBe(basePath);
        expect(di.getAlias("assetsPath")).toBe(assetsPath);

        expect(core.isConstructor(bootstrap)).toBe(true);

    });

    it('should init', function () {
        var basePath = di.normalizePath(__dirname + '/tf/'), logs = [], result,  isListened = false, events = [], config = {}, url, isparsed = false;

        bootstrap.setBasePath(basePath);

        var envPath = di.getAlias('basePath');
        mock[envPath + "bootstrap-config.js"] = di.load(envPath + "bootstrap-config.js");


        logger = {
            info: function (log) {
                logs.push(log);
            }
        };


        server = {
            on: function (evn, callback) {
                events.push({
                    evn: evn,
                    callback: callback
                });
            },
            listen: function (port) {
                isListened = port;
            },
            getEncoding: function() {
                return 'utf8';
            }
        };

        mock["core/request"] = function (a, b) {
            config = a;
            url = b;
            return {
                destroy: function () {

                },
                parse: function () {
                    isparsed = true;
                },
                onEnd: function(callback) {
                    expect(typeof callback).toBe("function");
                    callback();
                }
            };
        };

        result = di.mock(function () {
            return bootstrap.init('');
        }, mock);


        expect(logs.length).toBe(2);
        // required components
        ['core/logger',
            'storage/memory',
            'core/router',
            'hooks/request',
            //'core/favicon',
            'core/view',
            'core/http'
        ].forEach(
            function (item) {
                expect(initialized.indexOf(item) > -1).toBe(true);
            }
        );


        var ev1 = events.shift();

        expect(ev1.evn).toBe('request');

        var a1 = {
                url: 1
            },
            a2 = {b: 1};
        ev1.callback(a1, a2);


        expect(config.request).toBe(a1);
        expect(config.response).toBe(a2);
        expect(isparsed).toBe(true);
        expect(isListened).toBe(8080);



        result = di.mock(function () {
            return bootstrap.init('');
        }, mock);

        expect(result.customMessage).toBe('You cannot reinitialize application');


        bootstrap.initalized = false;

        result = di.mock(function () {
            return bootstrap.init('/abc', 'ccas.json');
        }, mock);

        expect(result.customMessage).toBe('Problem with loading file, do you have your environment file json in path: "' + di.getAlias('envPath') + '" ?');

        bootstrap.initalized = false;

        result = di.mock(function () {
            return bootstrap.init('', 'invalid.json');
        }, mock);

        expect(result.customMessage).toBe('Problem with parsing environment json file');


        bootstrap.initalized = false;
        hasComponent = true;
        isLoggerGet = false;
        result = di.mock(function () {
            return bootstrap.init('', 'valid.json');
        }, mock);


        expect(di.getAlias('my')).toBe('/this-is-an-alias-test');

        expect(di.getAlias('assetsPath')).toBe('asset/');
        expect(isListened).toBe(1000);
        expect(isComponentInitialized).toBe(true);
        expect(isLoggerGet).toBe(true);


        bootstrap.initalized = false;

        result = di.mock(function () {
            return bootstrap.init('', 'noconfig.json');
        }, mock);

        expect(result.customMessage).toBe('Config file is not defined');


        bootstrap.initalized = false;
        result = di.mock(function () {
            return bootstrap.init('', 'valid2.json');
        }, mock);

        expect(result.customMessage).toBe('Initialize config: '+ envPath + 'bootstrap-config2.js');

    });
});