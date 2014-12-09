"use strict";
var di = require('../di'),
    core = di.load('core'),
    Type = di.load('typejs'),
    ViewLoaderInterface = di.load('interface/viewLoader'),
    swig = di.load('swig'),
    component = di.load('core/component'),
    cache,
    ViewLoader;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name ViewLoader
 *
 * @constructor
 * @description
 * ViewLoader is responsible for loading files
 */
ViewLoader = ViewLoaderInterface.inherit({
    config: Type.OBJECT,
    files: Type.OBJECT
}, {
    _construct: function View_construct() {
        // extend
        this.files = {};
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ViewLoader#resolve
     *
     * @description
     * Resolve view
     */
    resolve: function ViewLoader_resolve(to, from) {
        console.log(to, from);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method ViewLoader#load
     *
     * @description
     * Set load view
     */
    load: function ViewLoader_load(identifier, cb) {
        console.log(identifier, cb);
    }

});

module.exports = ViewLoader;
