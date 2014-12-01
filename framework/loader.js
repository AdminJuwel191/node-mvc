"use strict";
/* global Type: true, error: true, path: true, util: true, fs: true, INVALID_ALIAS_VALUE: true */
var Type = require('static-type-js');
var error = require('./error/index');
var path = require('path');
var util = require('util');
var fs = require('fs');
var INVALID_ALIAS_VALUE = /[\\?%*:|"<>.\s]/ig;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Loader
 *
 * @constructor
 * @description
 * Loader is main class which provide all paths to load part of application
 */
var Loader = Type.create({
    filePaths: Type.OBJECT,
    aliases: Type.OBJECT
}, {
    _construct: function Loader_construct() {
        this.aliases = {};
        this.setAlias('framework', __dirname + '/');
        try {
            this.filePaths = JSON.parse(fs.readFileSync(this.normalizePath('@{framework}/files.json'), {encoding: 'utf8'}));
        } catch (e) {
            throw new error.Exception('Problem with loading files.json', e);
        }

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Loader#getAlias
     *
     * @description
     * Get an alias
     */
    getAlias: function Loader_getAlias(key) {
        if (this.aliases.hasOwnProperty(key)) {
            return this.normalizePath(this.aliases[key]);
        } else {
            throw new error.DataError(key, 'Alias is not valid');
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Loader#setAlias
     *
     * @description
     * Set an path alias
     */
    setAlias: function Loader_setAlias(key, value) {
        /* @todo check if this will be required */
        if (INVALID_ALIAS_VALUE.test(value)) {
            throw new error.DataError(key, 'Invalid alias value, chars \'\\?%*:|"<>.\' and spaces are not allowed.');
        } else {
            this.aliases[key] = this.normalizePath(value);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Loader#normalizePath
     *
     * @description
     * Normalize path
     */
    normalizePath: function Loader_normalizePath(value) {
        Object.keys(this.aliases).forEach(function (key) {
            value = value.replace('@{' + key + '}', this.aliases[key]);
        }.bind(this));
        return path.normalize(value);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Loader#readFileSync
     *
     * @description
     * Read file sync
     */
    readFileSync: function (name) {
        try {
            return fs.readFileSync(this.normalizePath(name), {encoding: 'utf8'});
        } catch (e) {
            throw new error.Exception('Problem with loading sync file', e);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Loader#load
     *
     * @description
     * Load an package
     */
    load: function Loader_load(file) {
        try {
            if (file in this.filePaths) {
                file = this.filePaths[file];
            }
            return require(this.normalizePath(file));
        } catch (e) {
            throw new error.Exception('Problem with loading file', e);
        }
    }
});


module.exports = new Loader;