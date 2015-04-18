var di = require('../../');
describe('interface/storage', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/storage', {
            typejs: Type,
            core: di.load('core'),
            error: di.load('error')
        });
        loadedNames = [];
    });


    it('should be inherited', function () {
        var config = {};
        var Cache = Interface.inherit({}, {
            set: n,
            get: n,
            remove: n,
            has: n
        });
        var message = tryCatch(function () {
            return new Cache(config);
        });
        expect(message instanceof Cache).toBe(true);

    });


    createMethodTest('set', {});
    createMethodTest('get', {
        set: n
    });
    createMethodTest('remove', {
        set: n,
        get: n
    });

    createMethodTest('has', {
        set: n,
        get: n,
        remove: n
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
            expect(message.indexOf('CacheInterface: missing method in cache object') > -1).toBe(true);
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
