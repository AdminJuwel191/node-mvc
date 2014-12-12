"use strict";
var di = require("../"),
    core = di.load('core');
describe('bootstrap', function () {

    var bootstrap, logger =  {
        print: function () {

        }
    }, server = {

    }, mock = {
        typejs: di.load('typejs'),
        core: di.load('core'),
        error: di.load('error'),
        fs: di.load('fs'),
        'core/component': {
            set: function(name, config) {
                if (name === 'core/logger') {
                    return logger;
                } else if (name === 'core/http') {
                    return  server;
                }
                console.log('setComponent', name, config);
            },
            has: function (name) {
                console.log('hasComponent', name);
            },
            get: function (name) {
                if (name === 'core/logger') {
                    return logger;
                } else if (name === 'core/http') {
                    return  server;
                }
                console.log('getComponent', name);
            }
        },
        "core/request": function (config, url) {

        }
    };

    beforeEach(function () {
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

        console.log('ONLY ONCE');
    });

    it('should init', function() {
        var result = di.mock(function() {
            return bootstrap.init('');
        }, mock, true);

        console.log('result', result);

    });
});