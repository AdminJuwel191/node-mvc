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
            'interface/module' : di.load('interface/module'),
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
        di.setAlias('modulesPath', '@{appPath}/modules_valid');
        di.setAlias('appPath', nPath);
    });
    it('construct|nocache', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.cache = false;
       
        config.views = nPath + 'templates/theme/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();
        expect(Object.keys(view.preloaded).length).toBe(0);
    });




    it('getPath', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
       
        config.views = nPath + 'templates/theme/';
        di.setAlias('viewsPath', config.views);
        spyOn(swig, 'Swig').and.callThrough();
        view.config.themes = ['index'];
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();



        expect(view.getPath(di.normalizePath('@{viewsPath}/'))).toBe(nPath + 'templates/theme/');
        expect(view.getPath(di.normalizePath('@{modulesPath}/user/themes/'))).toBe(nPath + 'modules_valid/user/themes/');
     });


    it('resolve', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
       
        config.views = nPath + 'templates/theme/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.config.themes = ['index'];

        //success
        expect(view.resolve('@{viewsPath}/theme')).toBe(nPath + 'templates/theme/index/theme.twig');
        //success
        expect(view.resolve('@{viewsPath}/view')).toBe(nPath + 'templates/theme/default/view.twig');

        //success
        expect(view.resolve('@{modulesPath}/user/themes/theme')).toBe(nPath + 'modules_valid/user/themes/index/theme.twig');
        //success
        expect(view.resolve('@{modulesPath}/user/themes/view')).toBe(nPath + 'modules_valid/user/themes/default/view.twig');

        var message = tryCatch(function () {
            view.resolve('@{modulesPath}/user/abc/theme');
        });
        expect(message.customMessage).toBe('View.resolve: view path is not registered in system and mvc was not able to detect path, please check your path configs');
    });



    it('resolve lookup', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;

        config.views = nPath + 'templates/theme/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.config.themes = ['c', 'index'];

        //success
        expect(view.resolve('@{viewsPath}/theme1')).toBe(nPath + 'templates/theme/index/theme1.twig');
        expect(view.resolve('@{viewsPath}/theme')).toBe(nPath + 'templates/theme/c/theme.twig');
        //success
        expect(view.resolve('@{viewsPath}/view')).toBe(nPath + 'templates/theme/default/view.twig');

        //success
        expect(view.resolve('@{modulesPath}/user/themes/theme1')).toBe(nPath + 'modules_valid/user/themes/c/theme1.twig');
        expect(view.resolve('@{modulesPath}/user/themes/theme')).toBe(nPath + 'modules_valid/user/themes/index/theme.twig');
        //success
        expect(view.resolve('@{modulesPath}/user/themes/view')).toBe(nPath + 'modules_valid/user/themes/default/view.twig');


    });

    it('load', function () {
        swig.Swig = function () {
            return swigApi;
        };
        nPath = path.normalize(__dirname + '/../tf/');
        config.suffix = '.twig';
        config.cache = true;
       
        config.views = nPath + 'templates/theme/';
        spyOn(swig, 'Swig').and.callThrough();
        view = new ViewConstructor(config);
        expect(swig.Swig).toHaveBeenCalled();

        view.config.themes = ['index'];
        expect(view.load(view.resolve('@{viewsPath}/theme'))).toBe('theme');
        view.config.themes = [];
        expect(view.load(view.resolve('@{viewsPath}/theme'))).toBe('viewtheme');
        view.config.themes = ['index'];
        expect(view.load(view.resolve('@{viewsPath}/view'))).toBe('view');

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
       
        config.views = nPath + 'templates/theme/';
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
