"use strict";
/* global loader: true, Type: true, Controller: true */
var loader = require('../loader'),
    Type = loader.load('static-type-js'),
    ControllerInterface = loader.load('interface/controller'),
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
Controller = ControllerInterface.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ControllerInterface#hasAction
     *
     * @description
     * Check if controller have action
     */
    hasAction: function Controller_hasAction(name) {
        return (name in this);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ControllerInterface#getAction
     *
     * @description
     * Get controlelr action
     */
    getAction: function Controller_getAction(name) {
        if (Type.isFunction(this[name])) {
            return this[name];
        }
        return false;
    }
});


// export Controller class
module.exports = Controller;
