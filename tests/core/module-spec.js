var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/module', function () {
    var Module,
        module,
        Type = di.load('typejs');

    beforeEach(function () {
        Module = di.mock('core/module', {
            typejs: Type,
            'interface/module': di.load('interface/module')
        });
        var Menu = Module.inherit({}, {});
        module = new Menu('menu');
    });


    it('_construct', function () {

        expect(module.moduleName).toBe('menu');
        expect(di.getAlias('currentModulePath')).toBe('@{modulesPath}/menu');
    });


    it('getModuleName', function () {
        expect(module.getModuleName()).toBe('menu');
    });

    it('getModulePath', function () {
        expect(module.getModulePath()).toBe('@{modulesPath}/menu');
    });

    it('getControllersPath', function () {
        expect(module.getControllersPath()).toBe('@{currentModulePath}/controllers/');
    });

    it('getViewsPath', function () {
        expect(module.getViewsPath()).toBe('@{currentModulePath}/views/');
    });

    it('getThemesPath', function () {
        expect(module.getThemesPath()).toBe('@{currentModulePath}/themes/');
    });


    it('setControllersPath', function () {
        var ctx = {
            getControllersPath: function () {return '';}
        };
        spyOn(ctx, 'getControllersPath').and.callThrough();
        module.setControllersPath.call(ctx);
        expect(ctx.getControllersPath).toHaveBeenCalled();
    });

    it('setViewsPath', function () {
        var ctx = {
            getViewsPath: function () {return '';}
        };
        spyOn(ctx, 'getViewsPath').and.callThrough();
        module.setViewsPath.call(ctx);
        expect(ctx.getViewsPath).toHaveBeenCalled();
    });

    it('setThemesPath', function () {
        var ctx = {
            getThemesPath: function () {return '';}
        };
        spyOn(ctx, 'getThemesPath').and.callThrough();
        module.setThemesPath.call(ctx);
        expect(ctx.getThemesPath).toHaveBeenCalled();
    });

});
