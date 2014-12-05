"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    component = di.load('core/component'),
    logger = component.get('core/logger'),
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
    config: Type.OBJECT,
    isShown: Type.BOOLEAN
}, {
    _construct: function Favicon_construct(config) {
        this.config = config;
        this.isShown = false;
        this.readFile();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Favicon#onRequest
     *
     * @description
     * On request handle favicon
     */
    onRequest: function Favicon_onRequest(response) {
        if (this.isShown) {
            response.writeHead(304);
            response.end();
        } else {
            this.isShown = true;
            response.writeHead(200, {
                'Content-Length': this.buffer.length,
                'Content-Type': 'image/x-icon'
            });
            response.end(this.buffer);
        }
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

        fs.readFile(di.normalizePath(this.config.path), function (err, buf) {
            if (err) {
                logger.error(err);
                throw new error.HttpError(500, err, 'Cannot load favicon');
            }
            this.buffer = buf;
        }.bind(this));
    }
});


module.exports = Favicon;