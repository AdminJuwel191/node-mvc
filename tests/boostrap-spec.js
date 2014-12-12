"use strict";
var di = require("../"),
    core = di.load('core');
describe('bootstrap', function () {

    var bootstrap, isLoggerGet = false, logger, server, mock, initialized, request, hasComponent = false, isCloased = hasComponent, isComponentInitialized = isCloased;

    beforeEach(function () {
        initialized = [];
        logger = {
            print: function () {

            },
            close: function () {
                isCloased = true;
            }
        };
        server = {
            on: function (evn, callback) {

            },
            listen: function (port) {

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
        var basePath = di.normalizePath(__dirname + '/tf/'), logs = [], result, isDestroyed = false, isListened = false, events = [], config, url, isparsed = false;

        bootstrap.setBasePath(basePath);

        mock["@{appPath}/bootstrap-config.js"] = di.load("@{basePath}/bootstrap-config.js");


        logger = {
            print: function (log) {
                logs.push(log);
            },
            close: function () {
            },
            destroy: function () {
            }
        };

        spyOn(logger, 'close').and.callThrough();
        spyOn(logger, 'destroy').and.callThrough();

        server = {
            on: function (evn, callback) {
                events.push({
                    evn: evn,
                    callback: callback
                });
            },
            listen: function (port) {
                isListened = port;
            }
        };

        mock["core/request"] = function (a, b) {
            config = a;
            url = b;
            return {
                parse: function () {
                    isparsed = true;
                },
                destroy: function () {
                    isDestroyed = true;
                }
            };
        };

        result = di.mock(function () {
            return bootstrap.init('');
        }, mock, true);

        expect(logs.length).toBe(2);
        // required components
        ['core/logger',
            'cache/memory',
            'core/router',
            'hooks/request',
            'core/favicon',
            'core/view',
            'core/http'
        ].forEach(
            function (item) {
                expect(initialized.indexOf(item) > -1).toBe(true);
            }
        );


        var ev1 = events.shift(), ev2 = events.shift();

        expect(ev1.evn).toBe('request');
        expect(ev2.evn).toBe('close');

        var a1 = {
                url: 1, on: function (name, callback) {
                    expect(name).toBe('end');
                    expect(typeof callback).toBe("function");
                    callback();
                }
            },
            a2 = {b: 1};
        ev1.callback(a1, a2);
        expect(config.request).toBe(a1);
        expect(config.response).toBe(a2);
        expect(url).toBe(1);
        expect(isDestroyed).toBe(true);
        expect(isparsed).toBe(true);
        expect(isListened).toBe(8080);


        ev2.callback();

        expect(logger.close).toHaveBeenCalled();
        expect(logger.destroy).toHaveBeenCalled();


        result = di.mock(function () {
            return bootstrap.init('');
        }, mock, true);

        expect(result.customMessage).toBe('You cannot reinitialize application');


        bootstrap.initalized = false;

        result = di.mock(function () {
            return bootstrap.init('/abc', 'ccas.json');
        }, mock, true);

        expect(result.customMessage).toBe('Problem with loading file, do you have your environment file json in path: "' + di.getAlias('appPath') + '" ?');

        bootstrap.initalized = false;

        result = di.mock(function () {
            return bootstrap.init('', 'invalid.json');
        }, mock, true);

        expect(result.customMessage).toBe('Problem with parsing environment json file');


        bootstrap.initalized = false;
        hasComponent = true;
        isLoggerGet = false;
        result = di.mock(function () {
            return bootstrap.init('', 'valid.json');
        }, mock, true);


        expect(di.getAlias('my')).toBe('/this-is-an-alias-test');

        expect(di.getAlias('assetsPath')).toBe('asset/');
        expect(isListened).toBe(1000);
        expect(isComponentInitialized).toBe(true);
        expect(isLoggerGet).toBe(true);


        bootstrap.initalized = false;

        result = di.mock(function () {
            return bootstrap.init('', 'noconfig.json');
        }, mock, true);

        expect(result.customMessage).toBe('Config file is not defined');


        bootstrap.initalized = false;
        result = di.mock(function () {
            return bootstrap.init('', 'valid2.json');
        }, mock, true);

        expect(result.customMessage).toBe('Initialize config');

    });
});