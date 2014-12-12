var di = require('../../');
describe('interface/controller', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/controller', {
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
            hasAction: n,
            getAction: n,
            redirect: n,
            forward: n,
            addHeader: n,
            onEnd: n,
            createUrl: n
        });
        var message = tryCatch(function () {
            return new IFace(config);
        });

        expect(message instanceof IFace).toBe(true);

        expect(Type.isObject(message._request)).toBe(true);
    });


    createMethodTest('hasAction', {});
    createMethodTest('getAction', {
        hasAction: n
    });
    createMethodTest('redirect', {
        hasAction: n,
        getAction: n
    });
    createMethodTest('forward', {
        hasAction: n,
        getAction: n,
        redirect: n
    });
    createMethodTest('addHeader', {
        hasAction: n,
        getAction: n,
        redirect: n,
        forward: n
    });

    createMethodTest('onEnd', {
        hasAction: n,
        getAction: n,
        redirect: n,
        forward: n,
        addHeader: n
    });

    createMethodTest('createUrl', {
        hasAction: n,
        getAction: n,
        redirect: n,
        forward: n,
        addHeader: n,
        onEnd: n
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
            expect(message.customMessage).toBe('ControllerInterface: missing method in Controller object');
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
