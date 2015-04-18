var di = require('../../');
describe('interface/requestHooks', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/requestHooks', {
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
            set: n,
            get: n,
            has: n,
            process: n
        });
        var message = tryCatch(function () {
            return new IFace(config);
        });
    
        expect(message instanceof IFace).toBe(true);

        message.server = [];
        expect(Type.isArray(message.hooks)).toBe(true);
    });


    createMethodTest('set', {});
    createMethodTest('get', {
        set: n
    });
    createMethodTest('has', {
        set: n,
        get: n
    });
    createMethodTest('process', {
        set: n,
        get: n,
        has: n
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
            expect(message.indexOf('RequestHooksInterface: missing method in Hook object') > -1).toBe(true);
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
