var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/component', function () {
    var component,
        viewComponent = {
            "name": "core/view",
            "themes": "@{appPath}/themes/",
            "views": "@{appPath}/views/",
            "theme": "default",
            "cache": true
        },
        components = [
            {
                "name": "core/logger",
                "debug": false,
                "publish": true,
                "port": 9001,
                "file": "server.log"
            },

            {
                "name": "core/router",
                "errorRoute": "core/error"
            },
            {
                "name": "core/favicon",
                "path": "@{basePath}/favicon.ico"
            },
            viewComponent,
            {
                "name": "core/assets",
                "path": "@{basePath}/storage/",
                "hook": "^\\/assets"
            }
        ],
        deps = {
            "core/router": [
                "core/logger"
            ],
            "core/request": [
                "core/router",
                "hooks/request",
                "core/logger"
            ],
            "core/favicon": [
                "core/logger",
                "cache/memory",
                "hooks/request"
            ],
            "core/assets": [
                "core/logger",
                "cache/memory",
                "hooks/request"
            ],
            "core/view": [
                "core/logger"
            ],
            "hooks/request": [
                "core/logger"
            ],
            "custom": [
                "test"
            ]
        },
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        component = di.mock('core/component', {
            typejs: Type,
            error: di.load('error'),
            core: core,
            'interface/component': di.load('interface/component')
        });
    });

    it("instanceError", function () {
        var message;
        var oFile = di.normalizePath(di.getAlias("framework") + "/core/component.json");
        var nFile = di.normalizePath(di.getAlias("framework") + "/core/component.template.json");
        fs.renameSync(oFile, nFile);

        message = tryCatch(function() {
            return component._construct();
        });
        expect(message.customMessage).toBe("Component.construct: problem with loading dependency file");
        fs.renameSync(nFile, oFile);
    });


    it('Shuld be constructor', function () {
        component.components = {};
        expect(core.isConstructor(component)).toBe(true);
        expect(Type.isObject(component.components)).toBe(true);

    });


    it('getDependency', function () {
        expect(JSON.stringify(component.getDependency('core/request'))).toBe(JSON.stringify(deps['core/request']));

        expect(component.getDependency('core/request11231231')).toBe(false);
    });

    it('find', function () {
        var cps = component.find("core/view", components);
        expect(cps).toBe(viewComponent);
    });

    it('init|has|get', function () {
        component.components = {};
        var comps = [{
            "name": "core/router",
            "errorRoute": "error/route"
        }, {
            "name": "core/logger",
            "debug": false,
            "publish": true,
            "port": 9001,
            "file": "servers-debug.log"
        }];
        component.init(comps);
        expect(component.has("core/router")).toBe(true);
        expect(component.has("core/logger")).toBe(true);
        var logger = component.get("core/logger");
        expect(logger.config.file).toBe("servers-debug.log");
        expect(Object.keys(component.components).length).toBe(2);

        var router = component.get("core/router");
        expect(router.config.errorRoute).toBe("error/route");
        expect(router.config.name).toBe("core/router");

        var message = tryCatch(function() {
            return component.get('test/1123');
        });

        expect(message.customMessage).toBe('Component "test/1123" is not registered in system');

        message = tryCatch(function() {
            return component.init('test/1123');
        });

        expect(message.customMessage).toBe('Component.init: components argument must be array type');

        component.components = {};

        components.dependency = deps;
        message = tryCatch(function() {
            return  component.init([{
                "name": "custom"
            }]);
        });
        expect(message.customMessage).toBe('Component "custom" is not initialized');
    });


    it('set', function () {

        component.components = {};
        component.set("core/router", {
            "name": "core/router",
            "errorRoute": "error/route"
        });
        expect(component.has("core/router")).toBe(true);

        var message = tryCatch(function() {
            component.set("core/router", {
                "name": "core/router",
                "errorRoute": "error/route"
            });
        });

        expect(message.customMessage).toBe('Component "core/router" already exist in system');

        component.components = {};

        component.set("core/router", {
            "name": "core/router",
            "errorRoute": "error/route"
        });

        expect(component.has("core/router")).toBe(true);

        var pt = path.normalize(__dirname + '/../tf/component.js');

        component.set("custom", {
            "filePath": pt,
            "p1": 1
        });

        expect(component.has("custom")).toBe(true);
        var c = component.get("custom");
        expect(c.p1).toBe(1);

        component.components = {};
        component.set("custom", {
            "p1": 2
        }, function(config) {
            return config;
        });

        c = component.get("custom");
        expect(c.p1).toBe(2);

        component.components = {};
        var message = tryCatch(function() {
            component.set("custom", {
                "p1": 2
            }, function(config) {
                return config.a.b;
            });
        });
        expect(message.customMessage).toBe('Component "custom" is not initialized');

        message = tryCatch(function() {
            component.get("custom")
        });
        expect(message.customMessage).toBe('Component "custom" is not registered in system');

    });

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
