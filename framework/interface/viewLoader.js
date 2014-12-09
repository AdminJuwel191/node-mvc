"use strict";
/* global loader: true, Type: true, error: true, RouteRuleInterface: true, require: true */
var di = require('../di'),
    Type = di.load('static-type-js'),
    error = di.load('error'),
    ViewLoaderInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ViewLoaderInterface
 *
 * @constructor
 * @description
 * ViewLoader interface
 */
ViewLoaderInterface = Type.create({

}, {
    _invoke: function ViewLoaderInterface() {
        ["resolve", "load"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'ViewLoaderInterface: missing method in viewLoader class');
            }
        }.bind(this));
    }
});

module.exports = ViewLoaderInterface;