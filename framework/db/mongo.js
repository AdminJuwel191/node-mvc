"use strict";
/* global Type: true, core: true, util: true, DataError: true, SilentError: true, Exception: true, HttpError: true */
var di = require('../di'),
    Type = di.load('typejs'),
    util = di.load('util'),
    core = di.load('core'),
    mongoose = di.load('mongoose'),
    Mongo;


/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Mongo
 *
 * @constructor
 * @description
 * Is adapter to connect to mongodb
 * It uses mongoose
 */
Mongo = Type.create({
    config: Type.OBJECT,
    db: Type.OBJECT
}, {
    /**
     * Constructor
     * @param config
     * @private
     * @description
     * All options are listed on
     * http://docs.mongodb.org/manual/reference/connection-string/
     */
    _construct: function (config) {
        this.config = core.extend({
            url: 'mongodb://localhost/mvcjs',
            options: {}
        }, config);
        this.db = mongoose.connect(this.config.url, this.config.options);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Mongo#createSchema
     *
     * @description
     * Create an schema
     * @return {object}
     */
    create: function Mongo_create(name, schema) {
        return mongoose.model(name, new mongoose.Schema(schema));
    }
});


module.exports = Mongo;