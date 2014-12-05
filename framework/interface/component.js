"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    ComponentInterface;
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
ComponentInterface = Type.create({
    components: Type.OBJECT
}, {
    _invoke: function ComponentInterface() {
        this.components = {};
        ["set", "get", "has"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'ComponentInterface: missing method in Component class');
            }
        }.bind(this));
    }
});

module.exports = ComponentInterface;