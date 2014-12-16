var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/router', function () {
    var router,
        config = {
            errorRoute: "core/error"
        },
        componentMock = {
            get: function (name) {
                console.log('name', name);
                if (name == "core/logger") {
                    return {
                        print: function () {

                        },
                        log: function () {

                        }
                    };
                }
            }
        },
        Constructor,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        Constructor = di.mock('core/router', {
            typejs: Type,
            core: core,
            error: di.load('error'),
            'core/routeRule': di.mock('core/routeRule', {
                typejs: Type,
                core: core,
                error: di.load('error'),
                'interface/routeRule': di.load('interface/routeRule'),
                'core/component': componentMock
            }),
            'interface/routeRule': di.load('interface/routeRule'),
            promise: di.load('promise'),
            'core/component': componentMock
        });
    });


    it('construct', function () {
        router = new Constructor(config);
        expect(router.config.errorRoute).toBe('core/error');
        var message = tryCatch(function() {
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



    xit('add', function () {
        router = new Constructor(config);

        router.add({
            pattern: 'test/redirect',
            route: 'test/redirect',
            method: ['GET']
        });

        expect(router.routes.length).toBe(1);
    });



    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
