"use strict";
var di = require("../"),
    core = di.load('core');
describe('bootstrap', function () {
    var bootstrap, logger =  {
        print: function () {

        }
    };
    beforeEach(function () {
        bootstrap = di.mockLoad('bootstrap', {
            typejs: di.load('typejs'),
            core: di.load('core'),
            error: di.load('error'),
            fs: di.load('fs'),
            'core/component': {
                set: function(name, config) {
                    if (name === 'core/logger') {
                        return logger;
                    }
                    console.log('setComponent', name, config);
                },
                has: function (name) {
                    console.log('hasComponent', name);
                },
                get: function (name) {
                    if (name === 'core/logger') {
                        return logger;
                    }
                    console.log('getComponent', name);
                }
            }
        });
    });
    
    xit('shuld be instanciated', function () {
            bootstrap.setBasePath(di.normalizePath(__dirname + '/'));
            bootstrap.init('');
    });
});