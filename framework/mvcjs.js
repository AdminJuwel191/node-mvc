"use strict";
/* global loader: true, Type: true, core: true, error: true, fs: true, Request: true, DEFAULT_SERVER_PORT: true, Framework: true */
var loader = require('./loader'),
    Type = loader.load('static-type-js'),
    core = loader.load('core'),
    error = loader.load('error'),
    fs = loader.load('fs'),
    Request = loader.load('core/request'),
    DEFAULT_SERVER_PORT = 8080,
    Framework;


Framework = Type.create({
    components: Type.OBJECT,
    initalized: Type.BOOLEAN,
    server: Type.OBJECT,
    favicon: Type.STIRNG
}, {
    /**
     * @license Mit Licence 2014
     * @since 0.0.1
     * @author Igor Ivanovic
     * @name Framework
     *
     * @constructor
     * @description
     * Framework is base class for setup Framework behavior
     */
    _construct: function Framework() {
        this.components = {};
        this.initalized = false;
        this.server = null;
        this.favicon = null;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#_checkInit
     *
     * @description
     * Check if application is initialized
     */
    _checkInit: function Framework__checkInit(method) {
        if (!this.initalized) {
            throw new error.Exception('Application must be initalized to use "' + method + '" method');
        }
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#init
     *
     * @description
     * Initalize application
     */
    init: function Framework_init(appPath) {

        var http = loader.load('http'),
            that = this,
            file,
            env,
            logger,
            envPath,
            filePath;

        if (this.initalized) {
            throw new error.Exception('You cannot reinitialize application');
        }
        // initialize app
        this.initalized = true;

        this.server = http.createServer();

        loader.setAlias('appPath', loader.getAlias('basePath') + '/' + appPath + '/');


        // set paths
        envPath = loader.getAlias('appPath');

        filePath = envPath + "env.json";

        // load config
        try {
            file = fs.readFileSync(filePath, {encoding: 'utf8'});
        } catch (e) {
            throw new error.Exception(filePath, 'Problem with loading file, do you have "env.json" in path: "' + envPath + '" ?', e);
        }
        try {
            env = JSON.parse(file);
        } catch (e) {
            throw new error.Exception(file, 'Problem with parsing file', e);
        }

        // set aliases
        if (Type.isArray(env.aliases)) {
            env.aliases.forEach(function setAlias(item) {
                if (Type.isString(item.key) && Type.isString(item.value)) {
                    loader.setAlias(item.key, item.value);
                }
            }.bind(this));
        }
        loader.setAlias('controllersPath', '@{appPath}/controllers/');
        loader.setAlias('modelsPath', '@{appPath}/models/');
        loader.setAlias('viewsPath', '@{appPath}/views/');
        // assets path
        if (Type.isString(env.assetsPath)) {
            this.setAssetsPath(env.assetsPath);
        }
        // logger
        if (Type.isObject(env.logger)) {
            logger = this.setComponent('core/logger', env.logger);
            logger.print(env);
            logger.print(this.__dynamic__);
            this.server.on('close', function () {
                logger.close();
            }.bind(this));
        } else {
            logger = this.setComponent('core/logger', {});
        }
        // add memory cache
        this.setComponent('cache/memory', {});
        // register router
        this.setComponent('core/router', Type.isObject(env.router) ? env.router : {});
        // load config
        if (Type.isString(env.config)) {
            try {
                loader.load('@{appPath}/' + env.config)(this);
            } catch (e) {
                throw new error.Exception('Initialize application', e);
            }
        } else {
            throw new error.DataError(env.config, 'Config file is not defined');
        }
        // set favicon path
        this.favicon = env.favicon ? loader.normalizePath(env.favicon) : loader.normalizePath("@{basePath}/favicon.ico");
        // server listen:
        // add response to api
        // create server
        this.server.on('request', function (request, response) {
            new Request(request, response, that);
        }.bind(this));
        // this must be last !! in config order
        if (Type.isNumber(env.port)) {
            this.server.listen(env.port);
        } else {
            this.server.listen(DEFAULT_SERVER_PORT);
        }

    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#createUrl
     *
     * @description
     * Create an url
     */
    createUrl: function Framework_createUrl() {
        var router = this.getComponent('core/router');
        return router.createUrl.apply(router, arguments);
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#setBasePath
     *
     * @description
     *  Set base application path
     */
    setBasePath: function Framework_setBasePath(value) {
        loader.setAlias("basePath", value + '/');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#setAssetsPath
     *
     * @description
     * Set assets path
     */
    setAssetsPath: function Framework_setAssetsPath(value) {
        loader.setAlias("assetsPath", value + '/');
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#setComponent
     *
     * @description
     * Register component
     */
    setComponent: function Framework_setComponent(name, config, func) {
        var api = this;
        this._checkInit('add'); // application must be intialized before adding
        if (!this.components.hasOwnProperty(name)) {
            try {
                if (!Type.isFunction(func)) {
                    if (config.filePath) {
                        func = loader.load(config.filePath);
                    } else {
                        func = loader.load(name);
                    }
                }
                this.components[name] = new func(api, config);
            } catch (e) {
                throw new error.Exception('Component "' + name + '" is not initialized', e);
            }
        } else {
            throw new error.Exception('Component "' + name + '" already exist in system', config);
        }
        return this.getComponent(name);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#use
     *
     * @description
     * Get commponent
     */
    getComponent: function Framework_getComponent(name) {
        if (this.components.hasOwnProperty(name)) {
            return this.components[name];
        }
        throw new error.Exception('Component "' + name + '" is not registered in system');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Framework#getFavicon
     *
     * @description
     * Get favicon
     */
    getFavicon: function Framework_getFavicon() {
        return this.favicon;
    }
});

module.exports = new Framework();