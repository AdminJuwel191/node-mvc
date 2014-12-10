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
            hook: '^\\/assets'
        }, config);

        logger.print('Assets.construct', config);
        hook.set(new RegExp(this.config.hook), this.onRequest.bind(this));
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Favicon#onRequest
     *
     * @description
     * On request handle favicon
     * @return {object}
     */
    onRequest: function Favicon_onRequest(api) {

        var maxAge = 60 * 60 * 24 * 30 * 12,  // one year
            filePath = this.config.path + api.parsedUrl.pathname,
            mimeType,
            file;


        mimeType = this.mimeType(filePath);

        if (!mimeType) {
            logger.print('MimeType', mimeType, filePath);
            return false;
        }

        file = this.readFile(filePath);


        api.addHeader('Content-Type', mimeType);
        api.addHeader('Cache-Control', 'public, max-age=' + ~~(maxAge));
        api.addHeader('ETag', etag(file));


        if (api.getMethod() !== 'GET') {
            throw new error.HttpError(500, {path: filePath}, 'Assets are accessible only via GET request');
        } else if (api.isHeaderCacheUnModified()) {
            api.sendNoChange();
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