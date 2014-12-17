var di = require('../../framework/di');
describe('hooks/request', function () {
    var reqInstance,
        RequestHooks,
        loadedNames = [],
        Type = di.load('typejs'),
        _data,
        logger = {
            print: function () {
                //console.log('logger', arguments);
            }
        };

    beforeEach(function () {
        RequestHooks = di.mock('hooks/request', {
            typejs: Type,
            core: di.load('core'),
            error: di.load('error'),
            "interface/requestHooks": di.load('interface/requestHooks'),
            "core/component": {
                get: function (name) {
                    if (name === 'core/logger') {
                        return logger;
                    }
                    loadedNames.push(name);
                }
            },
            "promise": function (callback) {
                callback(function resolve(data) {
                    _data = data;
                }, function reject(data) {
                    //console.log('reject', data);
                    _data = data;
                });
            }
        });

        _data = null;
        loadedNames = [];


    });

    it('should be function', function () {
        expect(Type.isFunction(RequestHooks)).toBe(true);
    });


    it('set', function () {
        reqInstance = new RequestHooks;
        var regex = /^\/home/;
        var callback = function () {
        };
        reqInstance.set(regex, callback);
        expect(reqInstance.hooks.length).toBe(1);

        var message = tryCatch(function () {
            reqInstance.set(1, 2);
        });

        expect(message.customMessage).toBe('RequestHooks.has regex must be regex type');


        message = tryCatch(function () {
            reqInstance.set(regex, 2);
        });
        expect(message.customMessage).toBe('RequestHooks.add hook already exists');


        message = tryCatch(function () {
            reqInstance.set(/abc/, 2);
        });
        expect(message.customMessage).toBe('RequestHooks.add hook value must be function type');
    });


    it('has', function () {
        reqInstance = new RequestHooks;
        var regex = /^\/home/;
        var callback = function () {
        };
        reqInstance.set(regex, callback);
        expect(reqInstance.hooks.length).toBe(1);
        expect(reqInstance.has(regex)).toBe(true);
        expect(reqInstance.has(/abc/)).toBe(false);

        var message = tryCatch(function () {
            reqInstance.has(1);
        });
        expect(message.customMessage).toBe('RequestHooks.has regex must be regex type');

    });


    it('get', function () {
        reqInstance = new RequestHooks;
        var regex = /^\/home/;
        var callback = function () {
        };
        reqInstance.set(regex, callback);
        var hook = reqInstance.get('/home');
        expect(hook.key).toBe(regex);
        expect(hook.func).toBe(callback);


        var message = tryCatch(function () {
            reqInstance.get(regex);
        });
        expect(message.customMessage).toBe('RequestHooks.get value must be string type');
    });


    it('process', function () {
        reqInstance = new RequestHooks;
        var api = {
            parsedUrl: {
                pathname: '/home'
            }
        };
        var regex = /^\/home/;

        var callback = function () {
            return 'HOOK';
        };
        reqInstance.set(regex, callback);
        reqInstance.process(api);
        expect(_data).toBe('HOOK');


        api.parsedUrl.pathname = '/test';
        reqInstance.process(api);
        expect(_data).toBe(false);


        api.parsedUrl.pathname = 1;

        var message = tryCatch(function () {
            return reqInstance.process(api);
        });
        expect(message.customMessage).toBe('Hook error');
    });


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
