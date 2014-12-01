"use strict";
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
    request: Type.OBJECT,
    events: Type.ARRAY
}, {
    _construct: function (request) {
       this.request = request;
    }
});


// export Controller class
module.exports = Controller;
