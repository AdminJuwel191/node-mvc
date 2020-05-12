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
    db: Type.OBJECT,
    dbConnCache: Type.OBJECT
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
            options: {
                replicaString: '',
                clients: []
            }
        }, config);
        this.dbConnCache = {};
        this.db = {};
        var clientKeys = Object.keys(this.config.options.clients);
        if (clientKeys.length) {
            clientKeys.forEach(function(client) {
                var clientChefConfig = this.config.options.clients[client];
                var replicaSet = this.config.options.replicaString ? this.config.options.replicaString : '';
                try {
                    var connectionString = this.config.connection.length ? this.config.connection : clientChefConfig.mongodbHost;
                    console.log(connectionString + '/' +
                        clientChefConfig.partnerSiteName + replicaSet);
                    this.dbConnCache[client] = mongoose.createConnection('mongodb://' + connectionString + '/' +
                        clientChefConfig.partnerSiteName + replicaSet, this.config.options);
                } catch(e) {
                    console.log(e);
                }

            }.bind(this));
            this.db = this.dbConnCache[clientKeys[0]];

        } else {
            this.db = mongoose.createConnection(this.config.connection, this.config.options);
        }

        logger.info('Mongo.construct:', this.config);
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
        logger.info('Mongo.schema:', {
            definition: definition,
            options: options
        });
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
        logger.info('Mongo.schema:', {
            name: name
        });
        var model;
        var keys = Object.keys(this.dbConnCache);
        if(keys.length) {
            Object.keys(this.dbConnCache).forEach(function(clientId) {
                model[clientId] = this.dbConnCache[clientId].model(name, schema);
            }.bind(this));
        } else {
           model = mongoose.model(name, schema);
        }

        return model;
    },

    useDb: function useDb(clientId) {
        if(this.dbConnCache.hasOwnProperty(clientId)) {
            this.db = this.dbConnCache[clientId];
        }
    }
});


module.exports = Mongo;