"use strict";
var di = require('../di'),
    core = di.load('core'),
    Type = di.load('typejs'),
    ViewInterface = di.load('interface/view'),
    swig = di.load('swig'),
    component = di.load('core/component'),
    viewLoader = component.get('core/viewLoader'),
    logger = component.get('core/logger'),
    cache,
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
View = ViewInterface.inherit({
    config: Type.OBJECT,
    defaults: Type.OBJECT,
    swig: Type.OBJECT
}, {
    _construct: function View_construct(config) {
        // extend
        this.defaults = {
            cache: false,
            autoescape: true,
            varControls: ['{{', '}}'],
            tagControls: ['{%', '%}'],
            cmtControls: ['{#', '#}'],
            locals: {},
            loader: viewLoader
        };
        this.config = {};

        core.extend(this.config, config);
        // set cache component
        if (Type.isString(this.config.cacheComponent)) {
            cache = component.get(this.config.cacheComponent);
        } else {
            cache = component.get('cache/memory');
        }
        // configure
        if (Type.isBoolean(this.config.cache) && this.config.cache === false) {
            this.defaults.cache = false;
        } else {
            this.defaults.cache = {
                set: function (key, value) {
                    cache.set('SWIG_TEMPLATE_' + key, value);
                },
                get: function (key) {
                    return cache.get('SWIG_TEMPLATE_' + key);
                }
            };
        }

        if (Type.isArray(this.config.varControls)) {
            this.defaults.varControls = core.copy(this.config.varControls);
        }
        if (Type.isArray(this.config.tagControls)) {
            this.defaults.tagControls = core.copy(this.config.tagControls);
        }
        if (Type.isArray(this.config.cmtControls)) {
            this.defaults.cmtControls = core.copy(this.config.cmtControls);
        }
        if (Type.isObject(this.config.locals)) {
            this.defaults.locals = core.copy(this.config.locals);
        }

        logger.print("View.construct", this.defaults);
        // create new swig env
        this.swig = new swig.Swig(this.defaults);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method View#setLoader
     *
     * @description
     * Set loader
     */
    setLoader: function View_setLoader(Loader) {
        this.swig.setDefaults({ loader: new Loader() });
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
     */
    renderFile: function View_renderFile(pathName, locals) {
        return this.swig.renderFile(pathName, locals);
    }
});

module.exports = View;
