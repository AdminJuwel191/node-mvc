var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/controller', function () {
    var Controller,
        request = {},
        view = {},
        session = {
            getCookieKey: function () {
                return 'session_id';
            }
        },
        controller,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        Controller = di.mock('core/controller', {
            typejs: Type,
            core: core,
            error: di.load('error'),
            'interface/controller': di.load('interface/controller'),
            'core/component': {
                get: function(name) {
                    if (name === "core/view") {
                        return view;
                    } else if (name === 'storage/session') {
                        return session;
                    }
                },
                has: function (name) {

                }
            }
        });
        var C = Controller.inherit({}, {
            action_create: function() {}
        });
        controller = new C(request, {
            controller: 'c',
            action: 'a',
            module: 'm'
        });
    });


    it('parsedUrl', function () {
        request.parsedUrl = 'ABC';
        expect(controller.getParsedUrl()).toBe('ABC');
    });



    it('stopChain', function () {
        request.stopPromiseChain = function() {return true;};
        spyOn(request, 'stopPromiseChain').and.callThrough();
        expect(controller.stopChain()).toBe(true);
        expect(request.stopPromiseChain).toHaveBeenCalled();
    });


    it('getRequestBody', function () {
        request.getRequestBody = function() {};
        spyOn(request, 'getRequestBody').and.callThrough();
        controller.getRequestBody();
        expect(request.getRequestBody).toHaveBeenCalled();
    });


    it('setStatusCode', function () {
        request.setStatusCode = function() {};
        spyOn(request, 'setStatusCode').and.callThrough();
        controller.setStatusCode();
        expect(request.setStatusCode).toHaveBeenCalled();
    });

    it('sendNoChange', function () {
        request.sendNoChange = function() {};
        spyOn(request, 'sendNoChange').and.callThrough();
        controller.sendNoChange();
        expect(request.sendNoChange).toHaveBeenCalled();
    });

    it('isHeaderCacheUnModified', function () {
        request.isHeaderCacheUnModified = function() {};
        spyOn(request, 'isHeaderCacheUnModified').and.callThrough();
        controller.isHeaderCacheUnModified();
        expect(request.isHeaderCacheUnModified).toHaveBeenCalled();
    });

    it('getRequestHeaders', function () {
        request.getRequestHeaders = function() {};
        spyOn(request, 'getRequestHeaders').and.callThrough();
        controller.getRequestHeaders();
        expect(request.getRequestHeaders).toHaveBeenCalled();
    });

    it('getMethod', function () {
        request.getMethod = function() {};
        spyOn(request, 'getMethod').and.callThrough();
        controller.getMethod();
        expect(request.getMethod).toHaveBeenCalled();
    });

    it('getHeaders', function () {
        request.getHeaders = function() {};
        spyOn(request, 'getHeaders').and.callThrough();
        controller.getHeaders();
        expect(request.getHeaders).toHaveBeenCalled();
    });


    it('getRequestHeader', function () {
        request.getRequestHeader = function() {};
        spyOn(request, 'getRequestHeader').and.callThrough();
        controller.getRequestHeader();
        expect(request.getRequestHeader).toHaveBeenCalled();
    });



    it('hasHeader', function () {
        request.hasHeader = function() {};
        spyOn(request, 'hasHeader').and.callThrough();
        controller.hasHeader();
        expect(request.hasHeader).toHaveBeenCalled();
    });

    it('createUrl', function () {
        request.createUrl = function() {};
        spyOn(request, 'createUrl').and.callThrough();
        controller.createUrl();
        expect(request.createUrl).toHaveBeenCalled();
    });

    it('onEnd', function () {
        request.onEnd = function() {};
        spyOn(request, 'onEnd').and.callThrough();
        controller.onEnd();
        expect(request.onEnd).toHaveBeenCalled();
    });

    it('addHeader', function () {
        request.addHeader = function() {};
        spyOn(request, 'addHeader').and.callThrough();
        controller.addHeader();
        expect(request.addHeader).toHaveBeenCalled();
    });

    it('forward', function () {
        request.forward = function() {};
        spyOn(request, 'forward').and.callThrough();
        controller.forward();
        expect(request.forward).toHaveBeenCalled();
    });

    it('forwardUrl', function () {
        request.forwardUrl = function() {};
        spyOn(request, 'forwardUrl').and.callThrough();
        controller.forwardUrl();
        expect(request.forwardUrl).toHaveBeenCalled();
    });

    it('redirect', function () {
        request.redirect = function() {};
        spyOn(request, 'redirect').and.callThrough();
        controller.redirect();
        expect(request.redirect).toHaveBeenCalled();
    });

    it('renderFile', function () {
        view.renderFile = function() {};
        spyOn(view, 'renderFile').and.callThrough();
        controller.renderFile();
        expect(view.renderFile).toHaveBeenCalled();
    });

    it('render', function () {
        view.render = function() {};
        spyOn(view, 'render').and.callThrough();
        controller.render();
        expect(view.render).toHaveBeenCalled();
    });


    it('has', function () {
        expect(controller.has('action_create')).toBe(true);
        expect(controller.has('action_create1')).toBe(false);
    });

    it('get', function () {
        expect(controller.get('action_create')).toBe(controller.action_create);
        expect(controller.get('action_create1')).toBe(false);
    });



    it('get', function () {
        expect(controller.get('action_create')).toBe(controller.action_create);
    });

    it('getActionName', function () {
        expect(controller.getActionName()).toBe('a');
    });
    it('getControllerName', function () {
        expect(controller.getControllerName()).toBe('c');
    });
    it('getModuleName', function () {
        expect(controller.getModuleName()).toBe('m');
    });

    it('setCookie', function () {
        var time = 60 * 60 * 24 * 1000;
        var date = new Date();
        date.setTime(date.getTime() + time);
        var strDate = date.toGMTString();
        var ctx = {
            addHeader: function () {}
        };
        spyOn(ctx, 'addHeader');
        controller.setCookie.call(ctx, "user", 1,  time, "/", "localhost", true);
        expect(ctx.addHeader).toHaveBeenCalledWith('Set-cookie', 'user=1; Expires='+ strDate +'; Path=/; Domain=localhost; HttpOnly');
    });

    it('setCookie 2', function () {
        var time = 60 * 60 * 24 * 1000;
        var date = new Date();
        date.setTime(date.getTime() + time);
        var strDate = date.toGMTString();
        var ctx = {
            addHeader: function () {}
        };
        spyOn(ctx, 'addHeader');

        controller.setCookie.call(ctx, "user", 1,  date, "/", "localhost", true);
        expect(ctx.addHeader).toHaveBeenCalledWith('Set-cookie', 'user=1; Expires='+ strDate +'; Path=/; Domain=localhost; HttpOnly');
    });


    it('setCookie 3', function () {
        var time = 60 * 60 * 24 * 1000;
        var date = new Date();
        date.setTime(date.getTime() + time);
        var strDate = date.toGMTString();
        var ctx = {
            addHeader: function () {}
        };
        spyOn(ctx, 'addHeader');

        controller.setCookie.call(ctx, "user", 1,  strDate, "/", "localhost", true);
        expect(ctx.addHeader).toHaveBeenCalledWith('Set-cookie', 'user=1; Expires='+ strDate +'; Path=/; Domain=localhost; HttpOnly');
    });

    it('setCookie 4', function () {
        var time = 60 * 60 * 24 * 1000;
        var date = new Date();
        date.setTime(date.getTime() + time);
        var strDate = date.toGMTString();
        var ctx = {
            addHeader: function () {}
        };
        spyOn(ctx, 'addHeader');

        controller.setCookie.call(ctx, "user", 1,  strDate, "/", "localhost");
        expect(ctx.addHeader).toHaveBeenCalledWith('Set-cookie', 'user=1; Expires='+ strDate +'; Path=/; Domain=localhost');
    });

    it('setCookie 5', function () {
        var time = 60 * 60 * 24 * 1000;
        var date = new Date();
        date.setTime(date.getTime() + time);
        var strDate = date.toGMTString();
        var ctx = {
            addHeader: function () {}
        };
        spyOn(ctx, 'addHeader');

        controller.setCookie.call(ctx, "user", 1,  strDate, "/");
        expect(ctx.addHeader).toHaveBeenCalledWith('Set-cookie', 'user=1; Expires='+ strDate +'; Path=/');
    });

    it('setCookie 6', function () {
        var time = 60 * 60 * 24 * 1000;
        var date = new Date();
        date.setTime(date.getTime() + time);
        var strDate = date.toGMTString();
        var ctx = {
            addHeader: function () {}
        };
        spyOn(ctx, 'addHeader');

        controller.setCookie.call(ctx, "user", 1,  date);
        expect(ctx.addHeader).toHaveBeenCalledWith('Set-cookie', 'user=1; Expires='+ strDate);
    });

    it('setCookie 7', function () {
        var ctx = {
            addHeader: function () {}
        };
        spyOn(ctx, 'addHeader');
        controller.setCookie.call(ctx, "user", 1);
        expect(ctx.addHeader).toHaveBeenCalledWith('Set-cookie', 'user=1');
        var message = tryCatch(function () {
            return controller.setCookie(1);
        });
        expect(message.customMessage).toBe('Controller.setCookie: Key and Value must be provided!');
        message = tryCatch(function () {
            return  controller.setCookie(undefined, 1);
        });
        expect(message.customMessage).toBe('Controller.setCookie: Key and Value must be provided!');
    });


    it('getCookies', function () {
        var ctx = {
            getRequestHeader: function () {
                return 'u_id=51/Cd; u_token=4+aYSqmNe+9223R7sJkus4xurXUO8eR/6xfCu2y6g==; u_time=5/eYO/1231jiBapXv7QwvQ==; ua_token=t6CdNfXkV6  12FVtONg6vN6vOTXe8XL+PwITvzjy0KwJWMfQs2cGVSEUQ==; u_tok 123 en_type=lKbL1 32 1fqmm; a b c=a a b c d';
            }
        };
        var cookies = controller.getCookies.call(ctx);

        expect(cookies.hasOwnProperty('u_id')).toBe(true);
        expect(cookies.hasOwnProperty('u_token')).toBe(true);
        expect(cookies.hasOwnProperty('u_time')).toBe(true);
        expect(cookies.hasOwnProperty('ua_token')).toBe(true);
        expect(cookies.hasOwnProperty('u_tok 123 en_type')).toBe(true);
        expect(cookies.hasOwnProperty('a b c')).toBe(true);

        expect(cookies.u_id).toBe('51/Cd');
        expect(cookies.u_token).toBe('4+aYSqmNe+9223R7sJkus4xurXUO8eR/6xfCu2y6g==');
        expect(cookies.u_time).toBe('5/eYO/1231jiBapXv7QwvQ==');
        expect(cookies.ua_token).toBe('t6CdNfXkV6  12FVtONg6vN6vOTXe8XL+PwITvzjy0KwJWMfQs2cGVSEUQ==');
        expect(cookies['u_tok 123 en_type']).toBe('lKbL1 32 1fqmm');
        expect(cookies['a b c']).toBe('a a b c d');

        var cookies2 = controller.getCookies.call(ctx);

        expect(cookies).toBe(cookies2); // reference
    });




    it('getCookies', function () {
        var ctx = {
            getCookies: function () {
                return {
                    u_id: '51/Cd'
                };
            }
        };
        var u_id = controller.getCookie.call(ctx, "u_id");
        expect(u_id).toBe('51/Cd');

        u_id = controller.getCookie.call(ctx, "u_id2");
        expect(u_id).toBe(null);
    });


    it('getSession', function () {
        var ctx = {
            getCookie: function () {
                return '1234123234567';
            }
        };
        session.get = function (key) {};
        spyOn(session, 'get');
        controller.getSession.call(ctx, "id");
        expect(session.get).toHaveBeenCalledWith('1234123234567id');

        var message = tryCatch(function () {
            controller.getSession.call(ctx, 1);
        });

        expect(message.customMessage).toBe('Controller.getSession: key must be string type');
    });


    it('setSession', function () {
        var ctx = {
            getCookie: function () {
                return '1234123234567';
            }
        };
        session.set = function (key) {};
        spyOn(session, 'set');
        controller.setSession.call(ctx, "id", {a: 1});

        expect(session.set).toHaveBeenCalledWith('1234123234567id', {a: 1});

        var message = tryCatch(function () {
            controller.setSession.call(ctx, 1);
        });

        expect(message.customMessage).toBe('Controller.getSession: key must be string type');
    });



    it('setSession 2' , function () {
        var ctx = {
            getCookie: function () {
                return null;
            },
            __requestApi__: {
                uuid: function () {
                    return 1111;
                }
            },
            setCookie: function () {}
        };

        session.getExpiredTime = function () {
            return 10;
        };
        session.set = function (key) {};
        spyOn(ctx, 'setCookie');

        controller.setSession.call(ctx, "id", {a: 1});

        expect(ctx.setCookie).toHaveBeenCalled();

    });
    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
