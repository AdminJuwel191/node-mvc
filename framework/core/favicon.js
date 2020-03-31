"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    core = di.load('core'),
    etag = di.load('etag'),
    fs = di.load('fs'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
    hook = component.get('hooks/request'),
    Favicon;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Favicon
 *
 * @constructor
 * @description
 * Favicon is responsible for favicon display on route /favicon.ico
 */

Favicon = Type.create({
    file: Type.OBJECT,
    config: Type.OBJECT
}, {
    _construct: function Favicon_construct(config) {
        this.config = core.extend({
            path: '@{basePath}/favicon.ico',
            hook: '\\/favicon\\.ico$',
            clients: []
        }, config);
        this.readFile();
        logger.info('Favicon.construct:', config);
        if(this.config.clients.length) {
            this.config.clients.forEach(function(client) {
                hook.set(new RegExp(client + '/' + this.config.hook), this.onRequest.bind(this));
            }.bind(this));
        } else {
            hook.set(new RegExp(this.config.hook), this.onRequest.bind(this));
        }

    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Favicon#onRequest
     *
     * @description
     * On request handle favicon
     */
    onRequest: function Favicon_onRequest(api) {
        var maxAge = 60 * 60 * 24 * 30 * 12; // one year

        api.addHeader('Content-Type', 'image/x-icon');
        api.addHeader('Cache-Control',  'public, max-age=' + ~~(maxAge));
        api.addHeader('ETag', etag(this.file));

        if (api.getMethod() !== 'GET') {
            throw new error.HttpError(500, {}, 'Favicon is accessible only via GET request');
        } else if (api.isHeaderCacheUnModified()) {
            api.sendNoChange();
        }

        return this.file;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Favicon#readFile
     *
     * @description
     * Get default error route
     */
    readFile: function Favicon_readFile() {
        var path = di.normalizePath(this.config.path);
        console.log("THIS IS FUCKING PATH", path);
        logger.info('Favicon.readFile:', {
            path: path
        });
        try {
            this.file = fs.readFileSync(path, {encoding: null});
        } catch (e) {
            throw new error.HttpError(500, {}, 'Cannot load favicon', e);
        }

    }
});


module.exports = Favicon;