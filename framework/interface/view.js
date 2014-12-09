"use strict";
/* global loader: true, Type: true, error: true, RouteRuleInterface: true, require: true */
var di = require('../di'),
    Type = di.load('static-type-js'),
    error = di.load('error'),
    ViewInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ViewInterface
 *
 * @constructor
 * @description
 * View interface
 */
ViewInterface = Type.create({
        config: Type.OBJECT,
        suffix: Type.REGEX
    },
    {
        _invoke: function ViewInterface() {
            [
                "setLoader", "setFilter", "setTag", "setExtension",
                "render", "renderFile", "setTheme", "getPath",
                "normalizeResolveValue", "resolve", "load"
            ].forEach(
                function (method) {
                    if (!(method in this)) {
                        throw new error.DataError({method: method}, 'ViewInterface: missing method in view class');
                    }
                }.bind(this)
            );
        }
    }
);

module.exports = ViewInterface;