"use strict";
/* global loader: true, Type: true, core: true, error: true, fs: true, Request: true, DEFAULT_SERVER_PORT: true, Bootstrap: true */
var di = require('./di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    error = di.load('error'),
    fs = di.load('fs'),
    component = di.load('core/component'),
    ENV_END_PATTERN = new RegExp('.*\\.json$'),
    DEFAULT_SERVER_PORT = 8080,
    Bootstrap;


Bootstrap = Type.create({
    initalized: Type.BOOLEAN
}, {
    /**
     * @license Mit Licence 2014
     * @since 0.0.1
     * @author Igor Ivanovic
     * @name Bootstrap
     *
     * @constructor
     * @description
     * Bootstrap is base object for setup Framework behavior
     */
    _construct: function Bootstrap() {
        this.initalized = false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Bootstrap#init
     *
     * @description
     * Bootstrap application
     */
    init: function Bootstrap_init(appPath, envFileName) {

        var file,
            env,
            logger,
            server,
            envPath,
            Request,
            filePath;

        if (this.initalized) {
            throw new error.Exception('You cannot reinitialize application');
        }
        // initialize app
        this.initalized = true;

        di.setAlias('appPath', di.getAlias('basePath') + '/' + appPath + '/');
        // set paths
        envPath = di.getAlias('appPath');

        if (Type.isString(envFileName) && ENV_END_PATTERN.test(envFileName)) {
            filePath = envPath + envFileName;
        } else {
            filePath = envPath + "env.json";
        }

        envPath = di.dirname(filePath);
        // set env path
        di.setAlias('envPath', envPath);

        // load config
        try {
            file = fs.readFileSync(filePath, {encoding: 'utf8'});
        } catch (e) {
            throw new error.DataError({filePath: filePath}, 'Problem with loading file, do you have your environment file json in path: "' + envPath + '" ?', e);
        }
        try {
            env = JSON.parse(file);
        } catch (e) {
            throw new error.DataError({file: file}, 'Problem with parsing environment json file', e);
        }
        // set aliases
        if (Type.isArray(env.aliases)) {
            env.aliases.forEach(function setAlias(item) {
                if (Type.isString(item.key) && Type.isString(item.value)) {
                    di.setAlias(item.key, item.value);
                }
            });
        }
        // if there is no controllers path
        if (!di.hasAlias('controllersPath')) {
            di.setAlias('controllersPath', '@{appPath}/controllers/');
        }
        // if there is no models path
        if (!di.hasAlias('modelsPath')) {
            di.setAlias('modelsPath', '@{appPath}/models/');
        }
        // assets path
        if (Type.isString(env.assetsPath)) {
            this.setAssetsPath(env.assetsPath);
        }
        // initialize list of components over env
        if (Type.isArray(env.components)) {
            component.init(env.components);
        }
        // if there is no logger init logger
        if (!component.has('core/logger')) {
            logger = component.set('core/logger', {});
        } else {
            logger = component.get('core/logger');
        }

        // add memory cache
        if (!component.has('cache/memory')) {
            component.set('cache/memory', {});
        }
        // register router
        if (!component.has('core/router')) {
            component.set('core/router', {});
        }
        // register hooks
        if (!component.has('hooks/request')) {
            component.set('hooks/request', {});
        }
        // set favicon path
        if (!component.has('core/favicon')) {
            component.set('core/favicon', {});
        }
        // set view component
        if (!component.has('core/view')) {
            component.set('core/view', {});
        }
        // load config
        if (Type.isString(env.config)) {
            try {
                di.load(envPath + '/' + env.config)(component, di);
            } catch (e) {
                throw new error.Exception('Initialize config: ' + envPath + '/' + env.config, e);
            }
        } else {
            throw new error.DataError(env.config, 'Config file is not defined');
        }
        // http
        if (!component.has('core/http')) {
            component.set('core/http', {});
        }
        // get core http service
        server = component.get('core/http');
        // server listen:
        // add response to api
        // create server
        Request = di.load('core/request');
        server.on('request', function (request, response) {
            logger.print('Create new request', request.url);
            // new request
            var nRequest = new Request({
                request: request,
                response: response
            }, request.url);
            /// parse request
            nRequest.parse();
            // on end destory
            request.on('end', function () {
                nRequest.destroy();
            });
        });
        // server close event
        server.on('close', function () {
            logger.close();
            logger.destroy();
        });
        // this must be last !! in config order
        if (Type.isNumber(env.port)) {
            server.listen(env.port);
        } else {
            server.listen(DEFAULT_SERVER_PORT);
        }

        // logger
        logger.print(env);
        logger.print(this.__dynamic__);

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Bootstrap#setBasePath
     *
     * @description
     *  Set base application path
     */
    setBasePath: function Bootstrap_setBasePath(value) {
        di.setAlias("basePath", value + '/');
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Bootstrap#setAssetsPath
     *
     * @description
     * Set assets path
     */
    setAssetsPath: function Bootstrap_setAssetsPath(value) {
        di.setAlias("assetsPath", value + '/');
    }
});

module.exports = new Bootstrap();