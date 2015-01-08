var di = require('../../');
describe('interface/http', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/http', {
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
            on: n,
            close: n,
            listen: n,
            setTimeout: n,
            getEncoding: n
        });
        var message = tryCatch(function () {
            return new IFace(config);
        });
    
        expect(message instanceof IFace).toBe(true);

        message.server = {};
        expect(Type.isObject(message.server)).toBe(true);
    });


    createMethodTest('on', {});
    createMethodTest('listen', {
        on: n
    });
    createMethodTest('close', {
        on: n,
        listen: n
    });
    createMethodTest('setTimeout', {
        on: n,
        close: n,
        listen: n
    });
    createMethodTest('getEncoding', {
        on: n,
        close: n,
        listen: n,
        setTimeout: n
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
            expect(message.customMessage).toBe('HttpServiceInterface: missing method in HttpService object');
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
