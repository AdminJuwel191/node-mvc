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

}, {
    _invoke: function ViewInterface() {

    }
});

module.exports = ViewInterface;