var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/view', function () {
    var view,
        nPath,
        message,
        swigApi = {
            compileFile: function () {

            }
        },
        config = {
            cache: false,
            autoescape: true,
            varControls: ['{{', '}}'],
            tagControls: ['{%', '%}'],
            cmtControls: ['{#', '#}'],
            locals: {},
            cacheComponent: false,
            themes: '@{appPath}/themes/',
            views: '@{appPath}/views/',
            suffix: '.twig',
            extensions: false,
            theme: false,
            loader: {}
        },
        server = {
            on: function () {
            },
            listen: function () {
            },
            close: function () {
            },
            setTimeout: function () {
            }
        },
        ViewConstructor,
        swig = {},
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        ViewConstructor = di.mock('core/view', {
            typejs: Type,
            core: core,
            error: di.load('error'),
            fs: di.load('fs'),
            'interface/view': di.load('interface/view'),
            'core/component': {
                get: function (name) {
                    if (name === "core/logger") {
                        return {
                            print: function () {

                            },
                            log: function () {

                            }
                        };
                    }
                }
            },
            swig: swig
        });
        nPath = path.normalize(__dirname + '/../tf/');
        di.setAlias('appPath', nPath);
    });
    it('construct|nocache', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.cache = false;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();
        expect(Object.keys(view.preloaded).length).toBe(0);
    });

    it('construct|cache', function () {
        swigApi.compileFile = function (a) {
            return di.readFileSync(a);
        }
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();
        expect(Object.keys(view.preloaded).length).toBe(3);
        Object.keys(view.config).forEach(function (key) {
            expect(key + ':' + JSON.stringify(view.config[key])).toBe(key + ':' + JSON.stringify(config[key]));
        });


        message = tryCatch(function () {
            config.suffix = 1;
            new ViewConstructor(config);
        });

        expect(message.customMessage).toBe('View.construct: view suffix must be string type');


        expect(view.getPreloaded(nPath + 'templates/view/view.twig')).toBe('view');
        expect(view.getPreloaded(nPath + 'templates/theme/index/theme.twig')).toBe('theme');


        expect(view.getPreloaded(nPath + 'templates/theme/theme.twig1')).toBe(false);


        view.config.cache = false;
        expect(view.getPreloaded(nPath + 'templates/theme/theme.twig1')).toBe(false);

    });




    it('setTheme', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.setTheme('index');

        expect(view.config.theme).toBe('index');

        var message = tryCatch(function() {
            view.setTheme(1);
        });

        expect(message.customMessage).toBe('ViewLoader.setTheme: name must be string type');


        view.setTheme(null);
        expect(view.config.theme).toBe(null);
    });

    it('getPath', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.setTheme('index');

        expect(view.getPath()).toBe(nPath + 'templates/theme/index/');
        expect(view.getPath(true)).toBe(nPath + 'templates/view/');
     });

    it('normalizeResolveValue', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.setTheme('index');

        //fail
        expect(view.normalizeResolveValue(nPath + 'templates/theme/test/user/index.twig')).toBe(nPath + 'templates/theme/test/user/index.twig');
        //success
        expect(view.normalizeResolveValue(nPath + 'templates/theme/index/user/index.twig')).toBe('user/index');
        //success
        expect(view.normalizeResolveValue(nPath + 'templates/view/user/index.twig')).toBe('user/index');
    });


    it('resolve', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.setTheme('index');

        //success
        expect(view.resolve(nPath + 'templates/theme/index/user/index.twig')).toBe(nPath + 'templates/theme/index/user/index.twig');
        //success
        expect(view.resolve(nPath + 'templates/view/user/index.twig')).toBe(nPath + 'templates/theme/index/user/index.twig');

        expect(view.resolve('user/index')).toBe(nPath + 'templates/theme/index/user/index.twig');

    });


    it('load', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.setTheme('index');
        expect(view.load(view.resolve('theme'))).toBe('theme');
        view.setTheme(null);
        expect(view.load(view.resolve('theme'))).toBe('viewtheme');
        view.setTheme('index');
        expect(view.load(view.resolve('view'))).toBe('view');

    });


    it('resolve', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.setTheme('index');
        expect(di.readFileSync(view.resolve('theme'))).toBe('theme');
        view.preloaded = {};
        view.config.cache = false;
        expect(di.readFileSync(view.resolve('theme'))).toBe('theme');
    });



    it('setPaths', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.setPaths('a', 'b');

        expect(di.getAlias('themesPath')).toBe('a');
        expect(di.getAlias('viewsPath')).toBe('b');

        view.setPaths();

        expect(di.getAlias('themesPath')).toBe( nPath + 'templates/theme/');
        expect(di.getAlias('viewsPath')).toBe(nPath + 'templates/view/');
    });




    it('setLoader|setFilter|setTag|setExpression|render|renderFile', function () {
        swig.Swig = function () {
            return {
                setDefaults: function() {},
                setFilter: function() {},
                setTag: function() {},
                setExtension: function() {},
                render: function() {},
                renderFile: function() {},
                compileFile: function () {}
            };
        };

        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
        config.themes = nPath + 'templates/theme/';
        config.views = nPath + 'templates/view/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);

        spyOn(view.swig, 'setDefaults');
        spyOn(view.swig, 'setFilter');
        spyOn(view.swig, 'setTag');
        spyOn(view.swig, 'setExtension');
        spyOn(view.swig, 'render');
        spyOn(view.swig, 'renderFile');

        expect(swig.Swig).toHaveBeenCalled();


        view.setLoader();
        view.setFilter();
        view.setTag();
        view.setExtension();
        view.render();
        view.renderFile();

        expect(view.swig.setDefaults).toHaveBeenCalled();
        expect(view.swig.setFilter).toHaveBeenCalled();
        expect(view.swig.setTag).toHaveBeenCalled();
        expect(view.swig.setExtension).toHaveBeenCalled();
        expect(view.swig.render).toHaveBeenCalled();
        expect(view.swig.renderFile).toHaveBeenCalled();
    });

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
