"use strict";
var di = require('../di'),
    core = di.load('core'),
    Type = di.load('typejs'),
    ViewInterface = di.load('interface/view'),
    swig = di.load('swig'),
    error = di.load('error'),
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
        swig: Type.OBJECT
    },
    {
        _construct: function View_construct(config) {
            var cache;
            // extend
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
            // set cache component
            if (Type.isString(this.config.cacheComponent)) {
                cache = component.get(this.config.cacheComponent);
            } else {
                cache = component.get('cache/memory');
            }

            if (this.config.cache) {
                this.config.cache = {
                    set: function (key, value) {
                        cache.set('SWIG_TEMPLATE_' + key, value);
                    },
                    get: function (key) {
                        return cache.get('SWIG_TEMPLATE_' + key);
                    }
                };
            }

            di.setAlias('viewsPath', this.config.views);
            di.setAlias('themesPath', this.config.themes);

            if (Type.assert(Type.STRING, this.config.suffix)) {
                this.suffix = new RegExp(this.config.suffix + '$');
            } else {
                this.suffix = new RegExp(this.config.suffix + '$');
            }


            // create new swig env
            this.config.loader = {
                resolve: this.resolve.bind(this),
                load: this.load.bind(this)
            };

            this.swig = new swig.Swig(this.config);


            logger.print("View.construct", this.config);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ViewLoader#setThemesPath
         *
         * @description
         * Set theme path
         */
        setTheme: function ViewLoader_setTheme(name) {
            if (Type.assert(Type.STRING, name)) {
                this.config.theme = name;
            } else {
                throw new error.HttpError(500, {name: name}, "ViewLoader.setTheme: name must be string type");
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ViewLoader#getPath
         *
         * @description
         * Get path
         */
        getPath: function ViewLoader_getPath() {
            var path = '@{viewsPath}/';
            if (Type.isString(this.config.theme)) {
                path = '@{themesPath}/' + this.config.theme + '/';
            }
            return di.normalizePath(path);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ViewLoader#normalizeResolveValue
         *
         * @description
         * Normalize resolve value
         * @return {string}
         */
        normalizeResolveValue: function ViewLoader_normalizeResolveValue(value) {
            if (Type.isString(value)) {
                return value.replace(this.getPath(), "").replace(this.suffix, "");
            }
            return value;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ViewLoader#resolve
         *
         * @description
         * Resolve view
         * @return {string}
         */
        resolve: function ViewLoader_resolve(to, from) {
            return this.getPath() + this.normalizeResolveValue(to) + this.config.suffix;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method ViewLoader#load
         *
         * @description
         * Set load view
         */
        load: function ViewLoader_load(identifier, cb) {
            var template = di.readFileSync(identifier);
            logger.print('ViewLoader.load', {
                identifier: identifier,
                template: template,
                cb: cb
            });
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
        renderFile: function View_renderFile(pathName, locals) {
            return this.swig.renderFile(pathName, locals);
        }
    }
);

module.exports = View;
