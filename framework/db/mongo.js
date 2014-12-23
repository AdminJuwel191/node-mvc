"use strict";
/* global Type: true, core: true, util: true, DataError: true, SilentError: true, Exception: true, HttpError: true */
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    core = di.load('core'),
    mongoose = di.load('mongoose'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
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
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Mongo#types
     *
     * @description
     * Mongoose schema types
     */
    types: mongoose.Schema.Types,
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
            connection: 'mongodb://localhost/mvcjs',
            options: {}
        }, config);
        this.db = mongoose.connect(this.config.connection, this.config.options);
        logger.print('Initialize mongoose', this.db, this.config);
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Mongo#schema
     *
     * @description
     * Create an schema
     * @return {object}
     */
    schema: function Mongo_schema(definition, options) {

        if (!options) {
            options = {};
        }
        if (!Type.assert(Type.OBJECT, options)) {
            throw new error.HttpError(500, {options: options}, 'Schema options must be object');
        } else if (!Type.assert(Type.OBJECT, definition)) {
            throw new error.HttpError(500, {definition: definition}, 'Schema definition must be object');
        }

        logger.print('Mongo.schema:', definition, options);
        return new mongoose.Schema(definition, options);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Mongo#model
     *
     * @description
     * Create an schema
     * @return {object}
     */
    model: function Mongo_model(name, schema) {
        if (!(schema instanceof mongoose.Schema)) {
            schema = this.schema(schema);
        }
        logger.print('Mongo.model: ', name);
        return mongoose.model(name, schema);
    }
});


module.exports = Mongo;