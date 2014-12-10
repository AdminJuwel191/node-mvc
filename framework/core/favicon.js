"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    core = di.load('core'),
    etag = di.load('etag'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
    hook = component.get('hooks/request'),
    fs = di.load('fs'),
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
    buffer: Type.OBJECT,
    config: Type.OBJECT
}, {
    _construct: function Favicon_construct(config) {
        this.config = core.extend({
            path: '@{basePath}/favicon.ico',
            hook: '\\/favicon\\.ico$'
        }, config);
        this.readFile();
        logger.print('Favicon.construct', config);
        hook.set(new RegExp(this.config.hook), this.onRequest.bind(this));
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
        api.addHeader('ETag', etag(this.buffer));

        if (api.getMethod() !== 'GET') {
            return false;
        } else if (api.isHeaderCacheUnModified()) {
            api.sendNoChange();
        }

        return this.buffer;
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
        var path = di.normalizePath(this.config.path), that = this;
        logger.print('Favicon.readFile', path);
        fs.readFile(path, function (err, buf) {
            if (err) {
                logger.error(err);
                throw new error.HttpError(500, err, 'Cannot load favicon');
            }
            that.buffer = buf;
        });
    }
});


module.exports = Favicon;