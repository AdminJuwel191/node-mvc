var di = require('../../');
describe('interface/module', function () {
    var Interface, loadedNames = [], Type = di.load('typejs');
    beforeEach(function () {
        Interface = di.mock('interface/module', {
            typejs: Type,
            core: di.load('core'),
            error: di.load('error')
        });
        loadedNames = [];
    });


    it('should be inherited', function () {

        var Module = Interface.inherit({}, {
            getModuleName: n,
            getModulePath: n,
            getControllersPath: n,
            getViewsPath: n
        });

        new Module();
    });

    createMethodTest('getModuleName', {});
    createMethodTest('getModulePath', {
        getModuleName: n
    });
    createMethodTest('getControllersPath', {
        getModuleName: n,
        getModulePath: n
    });
    createMethodTest('getViewsPath', {
        getModuleName: n,
        getModulePath: n,
        getControllersPath: n
    });
    function createMethodTest(method, extend, callback) {
        it('should have ' + method + ' method', function () {

            var Module = Interface.inherit({}, extend);

            var message = tryCatch(function () {
                return new Module();
            });
            if (typeof callback === 'function') {
                callback(message);
            }
            expect(message.indexOf('ModuleInterface: missing method in Module object') > -1).toBe(true);
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
