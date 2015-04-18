var di = require('../../');
describe('interface/component', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/component', {
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
            init: n,
            getDependency: n,
            find: n
        });
        var message = tryCatch(function () {
            return new IFace(config);
        });
        expect(message instanceof IFace).toBe(true);


        expect(Type.isObject(message.components)).toBe(true);
        expect(Type.isObject(message.dependency)).toBe(true);
    });


    createMethodTest('set', {});
    createMethodTest('get', {
        set: n
    });
    createMethodTest('has', {
        set: n,
        get: n
    });
    createMethodTest('init', {
        set: n,
        get: n,
        has: n
    });
    createMethodTest('getDependency', {
        set: n,
        get: n,
        has: n,
        init: n
    });

    createMethodTest('find', {
        set: n,
        get: n,
        has: n,
        init: n,
        getDependency: n
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
            expect(message.indexOf('ComponentInterface: missing method in Component object') > -1).toBe(true);
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
