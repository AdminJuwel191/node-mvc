"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    HttpServiceInterface;
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
HttpServiceInterface = Type.create({
    server: Type.OBJECT
}, {
    _invoke: function HttpServiceInterface() {
        ["on", "listen", "close", "setTimeout"].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'HttpServiceInterface: missing method in HttpService object');
            }
        }.bind(this));
    }
});

module.exports = HttpServiceInterface;