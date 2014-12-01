"use strict";
/* global loader: true, Type: true, error: true, RouteRuleInterface: true, require: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    error = loader.load('error'),
    RouteRuleInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Cache
 *
 * @constructor
 * @description
 * Cache class
 */
RouteRuleInterface = Type.create({}, {
    _construct: function RouteRuleInterface() {
        ["parseRequest", "createUrl"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'RouteRuleInterface: missing method in routerRule class');
            }
        }.bind(this));
    }
});

module.exports = RouteRuleInterface;