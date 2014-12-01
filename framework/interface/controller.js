"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    core = loader.load('core'),
    error = loader.load('error'),
    ControllerInterface;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ControllerInterface
 *
 * @constructor
 * @description
 * Controller interface
 */
ControllerInterface = Type.create({
    forward: Type.FUNCTION,
    redirect: Type.FUNCTION,
    createUrl: Type.FUNCTION,
    addHeader: Type.FUNCTION,
    getView: Type.FUNCTION
}, {
    _invoke: function ControllerInterface(api) {
        core.extend(this, api);
        ["hasAction", "getAction"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'ControllerInterface: missing method in Controller class');
            }
        }.bind(this));
    }
});

module.exports = ControllerInterface;