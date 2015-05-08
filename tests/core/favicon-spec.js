var di = require('../../framework/di'), path = require('path');
describe('core/favicon', function () {
    var Favicon,
        etag = function () {
            return 'ETAG';
        },
        source,
        hook = function (key, val) {
            source = key.source;
        },
        Type = di.load('typejs');

    beforeEach(function () {
        Favicon = di.mock('core/favicon', {
            typejs: Type,
            error: di.load('error'),
            core: di.load('core'),
            etag: etag,
            fs: di.load('fs'),
            "core/component": {
                get: function (name) {
                    if (name === 'core/logger') {
                        return {
                            info: function () {

                            },
                            error: function() {

                            },
                            log: function() {

                            },
                            warn: function() {

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

    it('Create instance| readFile', function () {

        hook = function (key, val) {
            source = key.source;

        };
        var favicon = path.normalize(__dirname + '/../tf/favicon.ico');
        var obj = {
            path: favicon,
            hook: '^\\/favicon\\.ico'
        };
        var instance = new Favicon(obj);
        expect(instance.config.path).toBe(obj.path);
        expect(instance.config.hook).toBe(obj.hook);
        expect(source).toBe('^\\/favicon\\.ico');
        expect(Type.isFunction(instance.onRequest)).toBe(true);
        expect(Type.isFunction(instance.readFile)).toBe(true);
        expect(instance.file.length).toBe(1150);
        expect(instance.file instanceof Buffer).toBe(true);
    });


    it('Create instance| readFile error', function () {
        var obj = {
            path: path.normalize(__dirname + '/../tf/notfound.ico'),
            hook: '^\\/favicon\\.ico'
        };
        var message = tryCatch(function () {
            new Favicon(obj);
        });
        expect(message.indexOf('Cannot load favicon') > -1).toBe(true);
    });

    it('onRequest', function () {

        var headers = [], method = 'GET', headerModified = false, isSended = false;
        var api = {
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

        var instance = new Favicon({
            path:  path.normalize(__dirname + '/../tf/favicon.ico'),
            hook:  '^\\/favicon\\.ico'
        });

        var file = instance.onRequest(api);

        expect(file.length).toBe(1150);
        expect(api.addHeader).toHaveBeenCalled();
        expect(api.getMethod).toHaveBeenCalled();
        expect(api.isHeaderCacheUnModified).toHaveBeenCalled();

        var ob = headers.shift();
        expect(ob.key).toBe('Content-Type');
        expect(ob.value).toBe('image/x-icon');

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
        expect(message.indexOf('Favicon is accessible only via GET request') > -1).toBe(true);
    });


    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
