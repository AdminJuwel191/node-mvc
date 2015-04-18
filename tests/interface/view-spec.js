var di = require('../../');
describe('interface/view', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/view', {
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
            setLoader: n,
            setFilter: n,
            setTag: n,
            setExtension: n,
            render: n,
            renderFile: n,
            resolve: n,
            load: n
        });
        var message = tryCatch(function () {
            return new IFace(config);
        });

        expect(message instanceof IFace).toBe(true);

        message.config = {};
        message.suffix = new RegExp();
        expect(Type.isObject(message.config)).toBe(true);
        expect(Type.isRegExp(message.suffix)).toBe(true);
    });


    createMethodTest('setLoader', {});
    createMethodTest('setFilter', {
        setLoader: n
    });
    createMethodTest('setTag', {
        setLoader: n,
        setFilter: n
    });
    createMethodTest('setExtension', {
        setLoader: n,
        setFilter: n,
        setTag: n
    });
    createMethodTest('render', {
        setLoader: n,
        setFilter: n,
        setTag: n,
        setExtension: n
    });

    createMethodTest('renderFile', {
        setLoader: n,
        setFilter: n,
        setTag: n,
        setExtension: n,
        render: n
    });

    createMethodTest('resolve', {
        setLoader: n,
        setFilter: n,
        setTag: n,
        setExtension: n,
        render: n,
        renderFile: n,
        getPath: n
    });
    createMethodTest('load', {
        setLoader: n,
        setFilter: n,
        setTag: n,
        setExtension: n,
        render: n,
        renderFile: n,
        resolve: n
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
            expect(message.indexOf('ViewInterface: missing method in view object') > -1).toBe(true);
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
