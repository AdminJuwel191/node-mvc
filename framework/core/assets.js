"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    core = di.load('core'),
    etag = di.load('etag'),
    mime = di.load('mime-types'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
    hook = component.get('hooks/request'),
    Assets;
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

Assets = Type.create({
    buffer: Type.OBJECT,
    config: Type.OBJECT,
    cache: Type.OBJECT
}, {
    _construct: function Favicon_construct(config) {
        this.config = core.extend({
            path: '@{basePath}/storage/',
            cacheComponent: false,
            cache: false
        }, config);

        // set cache component
        if (Type.isString(this.config.cacheComponent)) {
            this.cache = component.get(this.config.cacheComponent);
        } else {
            this.cache = component.get('cache/memory');
        }

        logger.print('Assets.construct', config);
        hook.set(/^\/assets/, this.onRequest.bind(this));
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

        var maxAge = 60 * 60 * 24 * 30 * 12,  // one year
            filePath = this.config.path + api.parsedUrl.pathname,
            key = 'ASSETS_CACHE_KEY_' + filePath,
            mimeType,
            file;

        if (this.config.cache) {
            if (this.cache.get(key)) {
                file = this.cache.get(key);
            } else {
                file = this.readFile(filePath);
            }
        } else {
            file = this.readFile(filePath);
        }

        mimeType = this.mimeType(filePath);

        api.addHeader('Content-Type', mimeType);
        api.addHeader('Cache-Control', 'public, max-age=' + ~~(maxAge));
        api.addHeader('ETag', etag(file));



        if (api.getMethod() !== 'GET') {
            throw new error.HttpError(500, {path: filePath}, 'Assets are accessible only via GET request');
        } else if (api.isHeaderCacheUnModified()) {
            api.sendNoChange();
        }

        if (this.config.cache) {
            this.cache.set(key, file);
        }

        logger.print('MimeType', mimeType, filePath);

        return file;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Favicon#mimeType
     *
     * @description
     * Get mime type
     */
    mimeType: function Assets_mimeType(filePath) {
        return mime.lookup(filePath);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Favicon#readFile
     *
     * @description
     * Get default error route
     */
    readFile: function Assets_readFile(filePath) {
        return di.readFileSync(filePath);
    }
});


module.exports = Assets;