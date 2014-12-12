"use strict";
var di = require("../"),
    core = di.load('core');
describe('bootstrap', function () {

    var bootstrap, logger, server, mock, initialized, request, hasComponent = false;

    beforeEach(function () {
        initialized = [];
        logger = {
            print: function () {

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
                        return logger;
                    } else if (name === 'core/http') {
                        return server;
                    } else if (name === 'core/request') {
                        return request;
                    }
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
        var basePath = di.normalizePath(__dirname + '/'), logs = [], isListened = false, events = [], config, url;

        bootstrap.setBasePath(basePath);

        mock["@{appPath}/bootstrap-config.js"] = di.load("@{basePath}/bootstrap-config.js");


        logger = {
            print: function (log) {
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
            }
        };

        mock["core/request"] = function (a, b) {
            config = a;
            url = b;
        }

        var result = di.mock(function () {
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

        expect(isListened).toBe(8080);


    });
});