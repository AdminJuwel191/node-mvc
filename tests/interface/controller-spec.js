var di = require('../../');
describe('interface/controller', function () {
    var Interface, loadedNames = [], Type = di.load('typejs'),
        methods = {
            has: n,
            get: n,
            redirect: n,
            forward: n,
            addHeader: n,
            onEnd: n,
            createUrl: n,
            hasHeader: n,
            getRequestHeader: n,
            getHeaders: n,
            getMethod: n,
            getRequestHeaders: n,
            isHeaderCacheUnModified: n,
            sendNoChange: n,
            getParsedUrl: n,
            stopChain: n,
            render: n,
            renderFile: n,
            setStatusCode: n,
            getRequestBody: n,
            getActionName: n,
            getControllerName: n,
            getModuleName: n,
            getRequestDomain: n,
            getRequestRemoteAddress: n,
            getRequestRemotePort: n,
            getRequestLocalAddress: n,
            getRequestLocalPort: n
        };
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
        var IFace = Interface.inherit({}, methods);
        var message = tryCatch(function () {
            return new IFace(config, {});
        });

        expect(message instanceof IFace).toBe(true);

        expect(Type.isObject(message.__requestApi__)).toBe(true);
        expect(Type.isObject(message.__config__)).toBe(true);
    });

    var keys = Object.keys(methods),
        obj,
        item;

    while (keys.length) {
        item = keys.pop();
        obj = {};
        keys.forEach(function (key) {
            obj[key] = n;
        });
        createMethodTest(item, obj);
    }




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
            expect(message.message).toBe('ControllerInterface: missing method in Controller object');
        });
    }

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }

    function n() {}
});
