var di = require('../../');
describe('interface/routeRule', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/routeRule', {
            typejs: Type,
            core: di.load('core'),
            error: di.load('error'),
            "core/component": {
                get: function (name) {
                    loadedNames.push(name);
                }
            }
        });
        loadedNames = [];
    });


    it('should be inherited', function () {
        var config = {};
        var IFace = Interface.inherit({}, {
            parseRequest: n,
            createUrl: n
        });
        var message = tryCatch(function () {
            return new IFace(config);
        });
        expect(message instanceof IFace).toBe(true);
    });


    createMethodTest('parseRequest', {});
    createMethodTest('createUrl', {
        parseRequest: n
    });



    function createMethodTest(method, extend, callback) {
        it('should have ' + method + ' method', function () {

            var Cache = Interface.inherit({}, extend);

            var message = tryCatch(function () {
                return new Cache();
            });
            if (typeof callback === 'function') {
                callback(message);
            }
            expect(message.data.method).toBe(method);
            expect(message.message).toBe('RouteRuleInterface: missing method in routerRule object');
        });
    }

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }

    function n() {
    }
});
