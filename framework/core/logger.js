"use strict";
/* global loader: true, Type: true, util: true, fs: true, http: true, core: true, error: true, replace: true, Logger: true */
var di = require('../di'),
    Type = di.load('typejs'),
    util = di.load('util'),
    fs = di.load('fs'),
    http = di.load('http'),
    core = di.load('core'),
    error = di.load('error'),
    replace = [],
    Logger;
// remove colors from inspect
for (var i = 0; i < 100; ++i) {
    replace.push(new RegExp('\\[' + i + 'm', 'ig'));
}
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Logger
 *
 * @constructor
 * @description
 * Logger is used to log stuff in application
 */
Logger = Type.create({
        stream: Type.OBJECT,
        server: Type.OBJECT,
        logs: Type.ARRAY,
        config: Type.OBJECT
    },
    {
        _construct: function Logger(config) {
            var file;
            this.stream = null;
            this.server = null;
            this.logs = [];
            this.config = {
                publish: false,
                port: 9001,
                debug: false,
                file: "server.log",
                level: 5
            };
            core.extend(this.config, config);
            if (this.config.debug) {
                try {
                    file = di.normalizePath('@{basePath}/' + this.config.file);
                    this.stream = fs.createWriteStream(file, {encoding: 'utf8'});
                } catch (e) {
                    throw new error.Exception('Invalid write stream', e);
                }
                if (this.config.publish) {
                    this.server = http.createServer();
                    this.server.on('request', function (request, response) {
                        var read;
                        try {
                            read = fs.readFileSync(file);
                            response.writeHead(200, {'Content-type': 'text/plain', 'Content-Length': read.length});
                            response.end(read);
                        } catch (e) {
                            response.writeHead(200, {'Content-type': 'text/plain'});
                            response.end(e.stack);
                        }
                    });
                    this.server.listen(this.config.port);
                    this.print('Publishing log write stream on port: ' + this.config.port);
                }
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#close
         *
         * @description
         * Logger close
         */
        close: function Logger_close() {
            if (this.stream) {
                this.stream.close();
            }
            if (this.server) {
                this.server.close();
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#log
         *
         * @description
         * Log something in console
         */
        log: function Logger_log() {
            var logs = "",
                date = new Date().toISOString(),
                args = Array.prototype.slice.call(arguments),
                url = '';

            if (this.config.debug) {

                logs += date + '\n';
                try {
                    throw new Error();
                } catch (e) {
                    url = core.trim(e.stack.split('\n').slice(3, 4).shift());
                    logs += url + '\n';
                }
                console.log(date + ':');
                args.forEach(function (item) {
                    console.log(item);
                    logs += core.trim(item);
                }.bind(this));
                logs += '\n';
                logs += '\n';
                this.logs.push(logs);
                try {
                    replace.forEach(function (value) {
                        logs = logs.replace(value, '');
                    });
                    logs = logs.replace(/\\'/g, "'");
                    logs = logs.replace(/\\n/g, '\n');
                    logs = logs.replace(/\\u001b/g, '\u001b');

                } catch (e) {
                    this.print(e);
                }
                if (this.stream) {
                    try {
                        this.stream.write(logs);
                    } catch (e) {
                        this.print(e);
                    }
                }
            }
            return logs;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#inspect
         *
         * @description
         * Inspect
         */
        error: function Logger_error() {
            var log = "", args = Array.prototype.slice.call(arguments);
            util.inspect.styles.string = 'red';
            args.forEach(function (item) {
                log += " " + util.inspect(item, {colors: true, depth: this.config.level});
            }.bind(this));
            return this.log(log);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#inspect
         *
         * @description
         * Inspect
         */
        print: function Logger_print() {
            var log = "", args = Array.prototype.slice.call(arguments);
            util.inspect.styles.string = 'green';
            args.forEach(function (item) {
                log += " " + util.inspect(item, {colors: true, depth: this.config.level});
            }.bind(this));
            return this.log(log);
        }
    }
);


module.exports = Logger;