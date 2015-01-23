"use strict";
/* global loader: true, Type: true, Controller: true */
var di = require('../di'),
    Type = di.load('typejs'),
    ModuleInterface = di.load('interface/module'),
    Module;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Module
 *
 * @constructor
 * @description
 * Module is handler for module
 */
Module = ModuleInterface.inherit({
    moduleName: Type.STRING
}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#_construct
     *
     * @description
     * Sets module name
     */
    _invoke: function (name) {
        this.moduleName = name;
        di.setAlias('currentModulePath', this.getModulePath());
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#getModuleName
     *
     * @description
     * Get module name
     */
    getModuleName: function  Module_getModuleName() {
        return this.moduleName;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#getModulePath
     *
     * @description
     * Get module path
     */
    getModulePath: function Module_getModulePath() {
        return di.normalizePath('@{modulesPath}/' + this.getModuleName());
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#getControllersPath
     *
     * @description
     * Get controllers path
     * @return {string}
     */
    getControllersPath: function  Module_getControllersPath() {
        return '@{currentModulePath}/controllers/';
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#getViewsPath
     *
     * @description
     * Get views path
     * @return {string}
     */
    getViewsPath: function  Module_getViewsPath() {
        return '@{currentModulePath}/views/';
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#getThemesPath
     *
     * @description
     * Get themes path
     * @return {string}
     */
    getThemesPath: function  Module_getThemesPath() {
        return '@{currentModulePath}/themes/';
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#setControllersPath
     *
     * @description
     * Set controller path
     */
    setControllersPath: function Module_setControllersPath() {
        di.setAlias('controllersPath', this.getControllersPath());
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#setViewsPath
     *
     * @description
     * Set views path
     */
    setViewsPath: function Module_setViewsPath() {
        di.setAlias('viewsPath', this.getViewsPath());
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Module#setThemesPath
     *
     * @description
     * Set themes path
     */
    setThemesPath: function Module_setThemesPath() {
        di.setAlias('themesPath', this.getThemesPath());
    }
});


// export Controller object
module.exports = Module;
