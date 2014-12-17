var di = require('../../'), fs = di.load('fs'), path = di.load('path');
describe('core/routeRule', function () {
    var router,
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

        var RouteRuleInterface = di.load('interface/routeRule');

        mock = {
            typejs: Type,
            core: core,
            error: di.load('error'),
            promise: di.load('promise'),
            "interface/routeRule": RouteRuleInterface,
            "core/component": componentMock
        };
        Constructor = di.mock('core/routeRule', mock);
    });


    xit('construct', function () {
        router = new Constructor({
            pattern: 'posts/<a:([a-z])>',
            route: 'posts/<action>',
            method: ['GET', 'POST']
        });

        console.log(router);

    });




    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
