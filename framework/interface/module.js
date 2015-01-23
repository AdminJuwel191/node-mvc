"use strict";
/* global loader: true,  Type: true,, error: true, ModuleInterface: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    ModuleInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ModuleInterface
 *
 * @constructor
 * @description
 * Module interface
 */
ModuleInterface = Type.create({},
    {
        _invoke: function ModuleInterface() {
            [
                "getModuleName",
                "getModulePath",
                "getControllersPath",
                "getViewsPath",
                "getThemesPath",
                "setControllersPath",
                "setViewsPath",
                "setThemesPath"
            ].forEach(function (method) {
                    if (!(method in this)) {
                        throw new error.DataError({
                            method: method
                        }, 'ModuleInterface: missing method in Module object');
                    }
                }.bind(this));
        }
    });

module.exports = ModuleInterface;