"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    HttpServiceInterface = di.load('interface/http'),
    http = di.load('http'),
    HttpService;

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name HttpService
 *
 * @constructor
 * @description
 * HttpService class
 */
HttpService = HttpServiceInterface.inherit({
    server: Type.OBJECT
}, {
    _construct: function HttpService() {
        this.server = http.createServer();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HttpService#on
     *
     * @description
     * Http on event
     */
    on: function HttpService_on() {
        this.server.on.apply(this.server, arguments);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HttpService#listen
     *
     * @description
     * listen server
     */
    listen: function HttpService_listen() {
        this.server.listen.apply(this.server, arguments);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HttpService#close
     *
     * @description
     * Close server connection
     */
    close: function HttpService_close() {
        this.server.close.apply(this.server, arguments);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method HttpService#setTimeout
     *
     * @description
     * http://nodejs.org/api/http.html#http_server_settimeout_msecs_callback
     */
    setTimeout: function HttpService_setTimeout() {
        this.server.setTimeout.apply(this.server, arguments);
    }
});


module.exports = HttpService;