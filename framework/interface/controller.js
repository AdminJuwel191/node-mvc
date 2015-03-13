"use strict";
/* global loader: true,  Type: true,, error: true, CacheInterface: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
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
    __requestApi__: Type.OBJECT,
    __config__: Type.OBJECT
}, {
    _invoke: function ControllerInterface(requestApi, config) {
        this.__requestApi__ = requestApi;
        this.__config__ = config;
        [
            "has", "get", "redirect",
            "forward", "addHeader", "onEnd",
            "createUrl", "hasHeader", "getRequestHeader",
            "getHeaders", "getMethod", "getRequestHeaders",
            "isHeaderCacheUnModified", "sendNoChange", "getParsedUrl",
            "stopChain", "render", "renderFile", "setStatusCode",
            "getRequestBody",
            "getActionName",
            "getControllerName",
            "getModuleName"
        ].forEach(function (method) {
            if (!(method in this)) {
                throw new error.DataError({method: method}, 'ControllerInterface: missing method in Controller object');
            }
        }.bind(this));
    }
});

module.exports = ControllerInterface;