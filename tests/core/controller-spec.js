var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/controller', function () {
    var Controller,
        request = {},
        view = {},
        controller,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        Controller = di.mock('core/controller', {
            typejs: Type,
            core: core,
            'interface/controller': di.load('interface/controller'),
            'core/component': {
                get: function(name) {
                    if (name === "core/view") {
                        return view;
                    }
                }
            }
        });
        var C = Controller.inherit({}, {
            action_create: function() {}
        });
        controller = new C(request);
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

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
