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
        expect(di.getAlias('module_menu')).toBe('@{modulesPath}/menu');
    });


    it('getModuleName', function () {
        expect(module.getModuleName()).toBe('menu');
    });

    it('getModulePath', function () {
        expect(module.getModulePath()).toBe('@{modulesPath}/menu');
    });

    it('getControllersPath', function () {
        expect(module.getControllersPath()).toBe('@{modulesPath}/menu/controllers/');
    });

    it('getViewsPath', function () {
        expect(module.getViewsPath()).toBe('@{modulesPath}/menu/themes/');
    });

});
