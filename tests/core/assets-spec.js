var di = require('../../framework/di'), path = require('path');
describe('core/assets', function () {
    var Assets,
        etag =  function() { return 'ETAG'; },
        mime = {
            lookup: function () {
            }
        },
        source,
        hook = function (key, val) {
            source = key.source;
        };
    Type = di.load('typejs');

    beforeEach(function () {
        Assets = di.mock('core/assets', {
            typejs: Type,
            error: di.load('error'),
            core: di.load('core'),
            etag: etag,
            'mime-types': mime,
            "core/component": {
                get: function (name) {
                    if (name === 'core/logger') {
                        return {
                            print: function () {
                                //console.log(arguments);
                            }
                        };

                    } else if (name === 'hooks/request') {
                        return {
                            set: hook
                        };
                    }
                }
            }
        });
    });

    it('Create instance', function () {

        hook = function (key, val) {
            source = key.source;

        };
        var obj = {
            path: '@{basePath}/assetFiles/',
            hook: '^\\/files'
        };
        var instance = new Assets(obj);
        expect(instance.config.path).toBe(obj.path);
        expect(instance.config.hook).toBe(obj.hook);
        expect(source).toBe('^\\/files');
        expect(Type.isFunction(instance.onRequest)).toBe(true);
        expect(Type.isFunction(instance.mimeType)).toBe(true);
        expect(Type.isFunction(instance.readFile)).toBe(true);

    });


    it('onRequest', function () {
        mime.lookup = function () {
            return 'application/javascript';
        };
        var headers = [], method = 'GET', headerModified = false, isSended = false;
        var api = {
            parsedUrl: {
                pathname: '/tf/di-test-load.js'
            },
            addHeader: function (key, value) {
                headers.push({
                    key: key,
                    value: value
                });
            },
            getMethod: function () {
                return method;
            },
            isHeaderCacheUnModified: function () {
                return headerModified;
            },
            sendNoChange: function () {
                isSended = true;
            }
        };
        spyOn(api, 'addHeader').and.callThrough();
        spyOn(api, 'getMethod').and.callThrough();
        spyOn(api, 'isHeaderCacheUnModified').and.callThrough();
        spyOn(api, 'sendNoChange').and.callThrough();

        var instance = new Assets({
            path: path.normalize(__dirname + '/../'),
            hook: '^\\/files'
        });

        var file = instance.onRequest(api);

        expect(file).toBe('module.exports = "CORRECT";');
        expect(api.addHeader).toHaveBeenCalled();
        expect(api.getMethod).toHaveBeenCalled();
        expect(api.isHeaderCacheUnModified).toHaveBeenCalled();

        var ob = headers.shift();
        expect(ob.key).toBe('Content-Type');
        expect(ob.value).toBe('application/javascript');

        ob = headers.shift();
        expect(ob.key).toBe('Cache-Control');
        expect(ob.value).toBe('public, max-age=31104000');

        ob = headers.shift();
        expect(ob.key).toBe('ETag');
        expect(ob.value).toBe('ETAG');

        headerModified = true;
        instance.onRequest(api);

        expect(isSended).toBe(true);
        expect(api.sendNoChange).toHaveBeenCalled();

        method = 'POST';
        var message = tryCatch(function () {
            return instance.onRequest(api);
        });

        expect(message.customMessage).toBe('Assets are accessible only via GET request');
    });


    it('mimeType', function () {
        mime.lookup = function () {
            return 'application/javascript';
        };
        var obj = {
            path: '@{basePath}/assetFiles/',
            hook: '^\\/files'
        };
        var instance = new Assets(obj);
        spyOn(mime, 'lookup').and.callThrough();
        //fake call
        expect(instance.mimeType()).toBe('application/javascript');
        expect(mime.lookup).toHaveBeenCalled();
    });


    it('readFile', function () {

        var obj = {
            path: '@{basePath}/assetFiles/',
            hook: '^\\/files'
        };
        var instance = new Assets(obj);
        var nPath = path.normalize(__dirname + '/../tf/di-test-load.js');
        expect(instance.readFile(nPath)).toBe('module.exports = "CORRECT";');
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
