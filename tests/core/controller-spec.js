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
