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
        config: Type.OBJECT,
        hooks: Type.ARRAY
    },
    {
        _construct: function Logger(config) {
            var file;
            this.stream = null;
            this.server = null;
            this.hooks = [];
            this.config = core.extend({
                enabled: false,
                write: false,
                publish: false,
                console: false,
                port: 9001,
                file: "server.log",
                level: 5
            }, config);

            if (this.config.write && this.config.enabled) {
                file = di.normalizePath('@{basePath}/' + this.config.file);
                this.stream = fs.createWriteStream(file, {encoding: 'utf8'});
                if (this.config.publish) {
                    this.server = http.createServer();
                    this.server.on('request', function (request, response) {
                        var read = fs.readFileSync(file);
                        response.writeHead(200, {'Content-type': 'text/plain', 'Content-Length': read.length});
                        response.end(read);
                    });
                    this.server.listen(this.config.port);
                    this.print('Publishing log write stream on port: ' + this.config.port);
                }
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#addHook
         *
         * @description
         * Hooks are used to do an extra stuff on log.
         * Eg. if we want to store in db
         */
        addHook: function (callback) {
            if (!Type.isFunction(callback)) {
                throw new error.Exception('Logger hook must be function');
            }
            this.hooks.push(callback);
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
                url = '',
                date,
                args = Array.prototype.slice.call(arguments);

            if (!this.config.enabled) {
                return args;
            }

            date = new Date().toISOString();
            logs += date + '\n';
            try {
                throw new Error();
            } catch (e) {
                url = core.trim(e.stack.split('\n').slice(3, 4).shift());
                logs += url + '\n';
            }
            args.forEach(function (item) {
                logs += core.trim(item);
            });
            logs += '\n';
            logs += '\n';
            if (this.config.console) {
                console.log(logs);
            }
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

            if (this.config.write && this.stream) {
                try {
                    this.stream.write(logs);
                } catch (e) {
                    this.print(e);
                }
            }

            this.hooks.forEach(function (hook) {
                try {
                    hook(logs);
                } catch (e) {
                    this.print(e);
                }
            }.bind(this));


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
            var log = "",
                args = Array.prototype.slice.call(arguments);
            if (!this.config.enabled) {
                return args;
            }
            util.inspect.styles.string = 'green';
            args.forEach(function (item) {
                log += " " + util.inspect(item, {colors: true, depth: this.config.level});
            }.bind(this));
            return this.log(log);
        }
    }
);


module.exports = Logger;