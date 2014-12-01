"use strict";
/* global loader: true, Type: true, Controller: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    Controller;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Controller
 *
 * @constructor
 * @description
 * Controller is a collection of Controller
 */
Controller = Type.create({
    forward: Type.FUNCTION,
    redirect: Type.FUNCTION,
    createUrl: Type.FUNCTION,
    addHeader: Type.FUNCTION,
    getView: Type.FUNCTION,
    Promise: Type.OBJECT
}, {
    _construct: function (api) {
        this.forward = api.forward;
        this.redirect = api.redirect;
        this.createUrl = api.createUrl;
        this.addHeader = api.addHeader;
        this.getView = api.getView;
    }
});


// export Controller class
module.exports = Controller;
