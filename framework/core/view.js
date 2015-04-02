"use strict";
var di = require('../di'),
    core = di.load('core'),
    Type = di.load('typejs'),
    ViewInterface = di.load('interface/view'),
    ModuleInterface = di.load('interface/module'),
    swig = di.load('swig'),
    error = di.load('error'),
    fs = di.load('fs'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
    View;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name View
 *
 * @constructor
 * @description
 * View is responsible for delivering correct view
 */
View = ViewInterface.inherit(
    {
        swig: Type.OBJECT,
        preloaded: Type.OBJECT,
        paths: Type.ARRAY,
        aliasRegex: Type.REGEX,
        normalizers: Type.ARRAY
    },
    {
        _construct: function View_construct(config) {
            var defaults;
            // extend
            this.aliasRegex = /@{.*}/g;
            this.preloaded = {};
            this.paths = [];
            this.normalizers = [];
            this.config = core.extend({
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
                defaultTheme: 'default',
                themes: []
            }, config);


            this.normalizers.push(this.config.views);

            di.setAlias('viewsPath', this.config.views);

            if (Type.isArray(this.config.themes)) {
                if (this.config.themes.indexOf(this.config.defaultTheme) === -1) {
                    this.config.themes.push(this.config.defaultTheme);
                }
                this.config.themes.forEach(function (name) {
                    this.paths.push(this.config.views + name + '/');
                }.bind(this));
            } else {
                throw new error.HttpError(500, this.config, 'View.construct: themes are not array type');
            }

            this.setModulesViewsPath(di.getAlias('modulesPath'));

            if (Type.assert(Type.STRING, this.config.suffix)) {
                this.suffix = new RegExp(this.config.suffix + '$');
            } else {
                throw new error.HttpError(500, this.config, 'View.construct: view suffix must be string type');
            }

            // create new swig env
            this.config.loader = {
                resolve: this.resolve.bind(this),
                load: this.load.bind(this)
            };

            defaults = core.extend({}, this.config);
            // don't use swig cache!
            if (this.config.cache) {
                defaults.cache = {
                    get: this.getPreloaded.bind(this),
                    set: this.setPreloaded.bind(this)
                };
            }

            this.swig = new swig.Swig(defaults);

            if (this.config.extensions) {
                di.load(this.config.extensions)(this, di);
            }

            if (this.config.cache) {
                this.paths.forEach(this.preloadTemplates.bind(this));
            }

            logger.info('View.construct:', this.config);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setModulesViewsPath
         *
         * @description
         * Set modules path
         */
        setModulesViewsPath: function View_setModulesViewsPath(dir) {
            var list, name, moduleToLoad, LoadedModule, moduleInstance;
            if (this.isDir(dir)) {
                list = this.readDir(dir);
                while (true) {
                    name = list.shift();

                    if (!name) {
                        break;
                    }

                    moduleToLoad = dir + '/' + name;

                    try {
                        LoadedModule = di.load(moduleToLoad);
                    } catch (e) {
                        throw new error.HttpError(500, {path: moduleToLoad}, 'Missing module', e);
                    }

                    if (!Type.assert(Type.FUNCTION, LoadedModule)) {
                        throw new error.HttpError(500, {path: moduleToLoad}, 'Module must be function type');
                    }

                    moduleInstance = new LoadedModule(name);

                    if (!(moduleInstance instanceof  ModuleInterface)) {
                        throw new error.HttpError(500, moduleInstance, 'Module must be instance of ModuleInterface "core/module"');
                    }

                    this.normalizers.push(moduleInstance.getViewsPath());

                    this.config.themes.forEach(function (name) {
                        this.paths.push(moduleInstance.getViewsPath() + name + '/');
                    }.bind(this));
                }

            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setPreloaded
         *
         * @description
         * Set preloaded template
         */
        setPreloaded: function View_setPreloaded(key, value) {
            logger.info('View.setPreloaded:', {
                key: key,
                value: value
            });
            this.preloaded[key] = value;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#getPreloaded
         *
         * @description
         * Get preloaded template
         * @return {string|boolean}
         */
        getPreloaded: function View_getPreloaded(key) {
            if (this.preloaded.hasOwnProperty(key)) {
                return this.preloaded[key];
            }
            return false;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#isFile
         *
         * @description
         * Is file
         * @return {string|boolean}
         */
        isFile: function View_isFile(path) {
            try {
                path = di.normalizePath(path);
                return fs.statSync(path).isFile();
            } catch (e) {
                logger.error('View.isFile:', {path: path, e: e});
            }
            return false;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#isDir
         *
         * @description
         * Is directory
         * @return {string|boolean}
         */
        isDir: function View_isDir(path) {
            try {
                path = di.normalizePath(path);
                return fs.statSync(path).isDirectory();
            } catch (e) {
                logger.error('View.isDir:', {path: path, e: e});
            }
            return false;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#readDir
         *
         * @description
         * Read directory
         */
        readDir: function View_readDir(path) {
            path = di.normalizePath(path);
            return fs.readdirSync(path);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#preloadTemplates
         *
         * @description
         * Preload all templates at bootstrap
         */
        preloadTemplates: function View_preloadTemplates(dir) {
            var list, name;
            if (this.isDir(dir)) {
                list = this.readDir(dir);
                while (true) {
                    name = list.shift();
                    if (!name) {
                        break;
                    }
                    this.preloadTemplates(di.normalizePath(dir + '/' + name));
                }

            } else if (this.isFile(dir) && this.suffix.test(dir)) {
                this.setPreloaded(dir, this.swig.compileFile(dir));
            }
        },


        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#resolve
         *
         * @description
         * Resolve view
         * @return {string}
         */
        resolve: function View_resolve(toPath, fromPath) {
            var file = di.normalizePath(toPath),
                themes = this.config.themes.slice(),
                theme,
                re,
                filePath,
                normalizers = this.normalizers.slice(),
                isNormalized = false,
                path,
                trace = [];

            // file name normalizers
            while (normalizers.length) {
                path = di.normalizePath(normalizers.shift());
                if (file.match(path)) {
                    file = file.replace(path, '').replace(this.suffix, '');
                    isNormalized = true;
                    break;
                }
            }
            // try normalize fromPath
            if (!isNormalized && !!fromPath) {
                normalizers = this.normalizers.slice();
                fromPath = di.normalizePath(fromPath);
                // file name normalizers
                while (normalizers.length) {
                    path = di.normalizePath(normalizers.shift());
                    if (fromPath.match(path)) {
                        isNormalized = true;
                        break;
                    }
                }
            }

            // check themes
            if (isNormalized) {
                while (themes.length) {
                    theme = themes.shift();
                    re = new RegExp('^' + theme + '/');
                    file = file.replace(re, '');

                    filePath = di.normalizePath(path + theme + '/' + file + this.config.suffix);
                    if (this.isFile(filePath)) {
                        return filePath;
                    }
                    trace.push({
                        theme: theme,
                        path: path,
                        filePath: filePath
                    });
                }
            }



            throw new error.HttpError(500, {
                from: fromPath,
                load: toPath,
                filePath: filePath,
                paths: this.paths,
                isNormalized: isNormalized,
                file: file,
                path: path,
                trace: trace,
                themes: this.config.themes
            }, "View.resolve: template don't exists");
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#load
         *
         * @description
         * Set load view
         * @return {string};
         */
        load: function View_load(path, cb) {
            var template = '';
            try {
                template = di.readFileSync(path);
            } catch (e) {
                logger.error('ViewLoader.load:', {
                    path: path,
                    cb: cb,
                    e: e
                });
            } finally {
                logger.info('ViewLoader.load:', {
                    path: path,
                    template: template,
                    cb: cb
                });
            }
            return template;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setLoader
         *
         * @description
         * Set loader
         */
        setLoader: function View_setLoader(resolve, load) {
            this.swig.setDefaults({
                loader: {
                    resolve: resolve,
                    load: load
                }
            });
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setFilter
         *
         * @description
         * Set swig filter
         */
        setFilter: function View_setFilter(name, method) {
            this.swig.setFilter(name, method);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setTag
         *
         * @description
         * Set swig tag
         */
        setTag: function View_setTag(name, parse, compile, ends, blockLevel) {
            this.swig.setTag(name, parse, compile, ends, blockLevel);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setExtension
         *
         * @description
         * Set swig extension
         */
        setExtension: function View_setExtension(name, parse, compile, ends, blockLevel) {
            this.swig.setExtension(name, parse, compile, ends, blockLevel);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#render
         *
         * @description
         * Set swig extension
         * @return {string}
         */
        render: function View_render(source, locals, escape) {
            return this.swig.render(source, {
                locals: locals,
                autoescape: !escape
            });
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#renderFile
         *
         * @description
         * Render file
         *  @return {string}
         */
        renderFile: function View_renderFile(templateName, locals, viewsPath) {
            if (!viewsPath) {
                viewsPath = di.getAlias('viewsPath');
            }
            return this.swig.renderFile(viewsPath + templateName, locals);
        }
    }
);

module.exports = View;
