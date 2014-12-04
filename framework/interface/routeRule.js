"use strict";
/* global loader: true, Type: true, error: true, RouteRuleInterface: true, require: true */
var di = require('../di'),
    Type = di.load('static-type-js'),
    error = di.load('error'),
    RouteRuleInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name RouteRuleInterface
 *
 * @constructor
 * @description
 * Route rule interface
 */
RouteRuleInterface = Type.create({}, {
    _invoke: function RouteRuleInterface() {
        ["parseRequest", "createUrl"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'RouteRuleInterface: missing method in routerRule class');
            }
        }.bind(this));
    }
});

module.exports = RouteRuleInterface;