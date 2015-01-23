"use strict";
var di = require('../di'),
    core = di.load('core'),
    Type = di.load('typejs'),
    ViewInterface = di.load('interface/view'),
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
        preloaded: Type.OBJECT
    },
    {
        _construct: function View_construct(config) {
            var defaults;
            // extend
            this.preloaded = {};
            this.config = core.extend({
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
                theme: false
            }, config);


            di.setAlias('viewsPath', this.config.views);
            di.setAlias('themesPath', this.config.themes);

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

            if (this.config.cache) {
                this.preloadTemplates(di.getAlias('appPath'));
            }

            defaults = core.extend({}, this.config);
            // don't use swig cache!
            defaults.cache = false;
            this.swig = new swig.Swig(defaults);

            logger.print("View.construct", this.config);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setPreloaded
         *
         * @description
         * Set preloaded template
         */
        setPreloaded: function (key, value) {
            logger.log('View.setPreloaded: ', key + '\n' + value);
            this.preloaded[key] = value;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#getPreloaded
         *
         * @description
         * Get preloaded template
         */
        getPreloaded: function (key) {
            if (this.hasPreloaded(key)) {
                return this.preloaded[key];
            }
            return false;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#hasPreloaded
         *
         * @description
         * Check if have preloaded
         */
        hasPreloaded: function (key) {
            var isPreloaded = this.preloaded.hasOwnProperty(key);
            if (!!this.config.cache && !isPreloaded) {
                throw new error.DataError({key: key}, "ENOENT, no such file or directory");
            }
            return isPreloaded;
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
            if (isDir(dir)) {
                list = readDir(dir);
                while (true) {
                    name = list.shift();
                    if (!name) {
                        break;
                    }
                    this.preloadTemplates(di.normalizePath(dir + '/' + name));
                }

            } else if (isFile(dir) && this.suffix.test(dir)) {
                this.setPreloaded(dir, di.readFileSync(dir));
            }

            function readDir(path) {
                return fs.readdirSync(path);
            }

            function isDir(path) {
                return fs.statSync(path).isDirectory();
            }

            function isFile(path) {
                return fs.statSync(path).isFile();
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#setThemesPath
         *
         * @description
         * Set theme path
         */
        setTheme: function View_setTheme(name) {
            if (Type.assert(Type.STRING, name)) {
                this.config.theme = name;
            } else if(Type.isNull(name)) {
                this.config.theme = null;
            } else {
                throw new error.HttpError(500, {name: name}, "ViewLoader.setTheme: name must be string type");
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#getPath
         *
         * @description
         * Get path
         */
        getPath: function View_getPath(skipTheme) {
            var path = '@{viewsPath}/';
            if (Type.isString(this.config.theme) && !skipTheme) {
                path = '@{themesPath}/' + this.config.theme + '/';
            }
            return di.normalizePath(path);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#normalizeResolveValue
         *
         * @description
         * Normalize resolve value
         * @return {string}
         */
        normalizeResolveValue: function View_normalizeResolveValue(value) {
            var theme = this.getPath(), view = this.getPath(true);
            if (Type.isString(value) && value.match(theme)) {
                return value.replace(theme, "").replace(this.suffix, "");
            } else if (Type.isString(value) && value.match(view)) {
                return value.replace(view, "").replace(this.suffix, "");
            }
            return value;
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
        resolve: function View_resolve(to, from) {
            return this.getPath() + this.normalizeResolveValue(to) + this.config.suffix;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method View#readTemplate
         *
         * @description
         * Read template
         * @return {string};
         */
        readTemplate: function View_readTemplate(path) {
            if (this.hasPreloaded(path)) {
                return this.getPreloaded(path);
            } else {
                return di.readFileSync(path);
            }
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
        load: function View_load(identifier, cb) {
            var template = '';
            try {
                template = this.readTemplate(identifier);
            } catch (e) {
                identifier = this.normalizeResolveValue(identifier);
                identifier = this.getPath(true) + identifier + this.config.suffix;
                template = this.readTemplate(identifier);
            } finally {
                logger.print('ViewLoader.load', {
                    identifier: identifier,
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
         * @method View#setPaths
         *
         * @description
         * Set default paths
         *  @return {string}
         */
        setPaths: function View_setPaths(themesPath, viewsPath) {
            if (Type.isString(themesPath) && !!themesPath) {
                di.setAlias('themesPath', themesPath);
            } else {
                di.setAlias('themesPath', this.config.themes);
            }

            if (Type.isString(viewsPath) && !!viewsPath) {
                di.setAlias('viewsPath', viewsPath);
            } else {
                di.setAlias('viewsPath', this.config.views);
            }
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
        renderFile: function View_renderFile(pathName, locals) {
            return this.swig.renderFile(pathName, locals);
        }
    }
);

module.exports = View;
