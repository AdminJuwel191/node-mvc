"use strict";
/* global Type: true, error: true, path: true, util: true, fs: true, INVALID_ALIAS_VALUE: true */
var Type = require('static-type-js');
var core = require('./core');
var path = require('path');
var util = require('util');
var fs = require('fs');
var INVALID_ALIAS_VALUE = /[\\?%*:|"<>.\s]/ig;
var error;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name DI
 *
 * @constructor
 * @description
 * DI is main object for handling dependency injection
 */
var DI = Type.create({
    filePaths: Type.OBJECT,
    aliases: Type.OBJECT
}, {
    _construct: function DI_construct() {
        this.aliases = {};
        this.setAlias('framework', __dirname + '/');
        try {
            this.filePaths = JSON.parse(fs.readFileSync(this.normalizePath('@{framework}/files.json'), {encoding: 'utf8'}));
        } catch (e) {
            throw new Error("Cannot load @{framework}/files.json path");
        }

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#hasAlias
     *
     * @description
     * Has an alias
     */
    hasAlias: function DI_hasAlias(key) {
        return this.aliases.hasOwnProperty(key);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#getAlias
     *
     * @description
     * Get an alias
     */
    getAlias: function DI_getAlias(key) {
        if (this.aliases.hasOwnProperty(key)) {
            return this.normalizePath(this.aliases[key]);
        } else {
            error = this.load('error');
            throw new error.Exception('DI.getAlias: "' + key + '" is not valid');
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#setAlias
     *
     * @description
     * Set an path alias
     */
    setAlias: function DI_setAlias(key, value) {
        /* @todo check if this will be required */
        if (INVALID_ALIAS_VALUE.test(value)) {
            error = this.load('error');
            throw new error.Exception('DI.setAlias: Invalid alias value, chars \'\\?%*:|"<>.\' and spaces are not allowed. KEY: ' + key);
        } else {
            this.aliases[key] = this.normalizePath(value);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#normalizePath
     *
     * @description
     * Normalize path
     */
    normalizePath: function DI_normalizePath(value) {
        Object.keys(this.aliases).forEach(function (key) {
            value = value.replace('@{' + key + '}', this.aliases[key]);
        }.bind(this));
        return path.normalize(value);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#readFileSync
     *
     * @description
     * Read file sync
     */
    readFileSync: function DI_readFileSync(name) {
        try {
            return fs.readFileSync(this.normalizePath(name), {encoding: 'utf8'});
        } catch (e) {
            error = this.load('error');
            throw new error.Exception('DI.readFileSync', e);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#exists
     *
     * @description
     * Check if file exists
     */
    exists: function DI_exists(file) {
        if (!Type.isString(file)) {
            error = this.load('error');
            throw new error.DataError({file: file}, 'DI.exists:  file or fileType must bi string');
        }
        return fs.existsSync(file);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#mockLoad
     *
     * @description
     * Mock load for testing purposes
     */
    mock: function DI_mock(file, mocks) {
        // save original
        var load =  DI.prototype.load, path;
        // mock load

        DI.prototype.load = function (name) {
            return mocks[name];
        };
        try {
            // load module or exec if its function
            if (Type.isString(file)) {
                // get file
                path = this.getFilePath(file);
                // because all modules in node are cached while executing tests we want to delete cached version
                delete require.cache[require.resolve(path + '.js')];
                // do require
                return require(path);

            } else if (Type.isFunction(file)) {
                return file();
            }
        } catch (e) {
            return e;
        } finally {
            // restore load
            DI.prototype.load = load;
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#getPath
     *
     * @description
     * Get module path so we can load it
     */
    getFilePath: function DI_getFilePath(moduleName) {
        if (moduleName in this.filePaths) {
            moduleName = this.filePaths[moduleName];
        }
        return this.normalizePath(moduleName);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method DI#load
     *
     * @description
     * Load an package
     */
    load: function DI_load(name) {
        try {
            return require(this.getFilePath(name));
        } catch (e) {
            error = this.load('error');
            throw new error.Exception('DI.load', e);
        }
    }
});


module.exports = new DI;