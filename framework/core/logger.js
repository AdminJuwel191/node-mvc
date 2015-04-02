"use strict";
/* global loader: true, Type: true, util: true, fs: true, http: true, core: true, error: true, replace: true, Logger: true */
var di = require('../di'),
    Type = di.load('typejs'),
    util = di.load('util'),
    fs = di.load('fs'),
    core = di.load('core'),
    error = di.load('error'),
    HttpServer = di.load('core/http'),
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
 *

 ALL indicates that all messages should be logged.
 INFO is a message level for informational messages.
 ERROR is a message level indicating a serious failure.
 WARNING is a message level indicating a potential problem.

 */
Logger = Type.create({
        stream: Type.OBJECT,
        server: Type.OBJECT,
        config: Type.OBJECT,
        length: Type.NUMBER,
        file: Type.STRING,
        hooks: Type.ARRAY,
        logs: Type.ARRAY
    },
    {
        _construct: function Logger(config) {
            this.stream = this.server = null;
            this.hooks = [];
            this.logs = [];
            this.config = core.extend({
                enabled: false,
                write: false,
                publish: false,
                console: false,
                readLength: 50000,
                port: 9001,
                type: 'ALL',
                types: ['ALL', 'ERROR', 'INFO', 'WARNING'],
                file: "server.log",
                level: 5
            }, config);
            this.file = di.normalizePath('@{basePath}/' + this.config.file);
            if (this.config.write && this.config.enabled) {
                this.createStream();
                if (this.config.publish) {
                    this.createReadLogServer();
                }
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#createStreams
         *
         * @description
         * Create read log server
         */
        createReadLogServer: function Logger_createReadLogServer() {
            var that = this;
            this.server = new HttpServer();
            this.server.on('request', function (request, response) {
                var startMessage = 'LAST '+ that.config.readLength + ' BYTES:\n\n';

                fs.open(that.file, 'r', 755, function(status, fd) {
                    fs.fstat(fd, function (err, stats) {
                        var size = stats.size,
                            start = size > that.config.readLength ? size - that.config.readLength : 0,
                            end = size > that.config.readLength ? that.config.readLength : size,
                            buffer =  new Buffer(end + startMessage.length);
                        buffer.fill(startMessage);
                        fs.read(fd, buffer, startMessage.length, end, start, function() {
                            response.writeHead(200, {'Content-type': 'text/plain', 'Content-Length': buffer.length});
                            response.end(buffer);
                        });
                    });
                });

            });

            this.server.listen(this.config.port);

            this.info('Publishing log write stream on port: ', this.config.port);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#createStreams
         *
         * @description
         * Create streams
         */
        createStream: function Logger_createStream() {
            this.stream = fs.createWriteStream(this.file);
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
        addHook: function Logger_addHook(callback) {
            if (!Type.isFunction(callback)) {
                throw new error.Exception('Logger hook must be function');
            }
            this.hooks.push(callback);
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#trace
         *
         * @description
         * Trace log call
         */
        trace: function Logger_trace() {
            try {
                throw new Error();
            } catch (e) {
                return core.trim(e.stack.split('\n').slice(3, 4).shift());
            }
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#inspect
         *
         * @description
         * Inspect log data output
         */
        inspect: function Logger_inspect(data) {
            if (Type.isObject(data)) {
                return util.inspect(data, {colors: true, depth: this.config.level});
            }
            return data;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#write
         *
         * @description
         * Write to file and exec hooks
         */
        write: function Logger_write() {
            var log = this.logs.shift();

            if (log && (this.config.type === log.type || this.config.type === 'ALL')) {
                if (this.config.console) {
                    if (log.type === 'ERROR') {
                        console.error(log);
                    } else if (log.type === 'INFO') {
                        console.info(log);
                    } else if (log.type === 'WARNING') {
                        console.warn(log);
                    } else {
                        console.log(log);
                    }
                }

                if (this.stream) {
                    this.stream.write('TYPE: ' + log.type);
                    this.stream.write('\n');
                    this.stream.write('CREATED: ' + log.created + '\t ');
                    this.stream.write('\n');
                    this.stream.write('MESSAGE: ' + log.message + '\t ' + log.trace);
                    this.stream.write('\n');
                    this.stream.write('DATA: ' + this.clean(log.data));
                    this.stream.write('\n');
                    this.stream.write('\n');
                }
                // call log
                this.hooks.forEach(function (callback) {
                    callback(log);
                });
            }

        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#clean
         *
         * @description
         * Clean message for write
         * @return string
         */
        clean: function Logger_clean(message) {
            if (Type.isString(message)) {
                replace.forEach(function (value) {
                    message = message.replace(value, '');
                });
                message = message.replace(/\\'/g, "'");
                message = message.replace(/\\n/g, "\n");
                return message.replace(/\\u001b/g, '\u001b');
            }
            return message;
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#warn
         *
         * @description
         * Log warn case
         */
        warn: function Logger_warn(message, data) {
            return this.log(message, data, 'WARNING');
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#info
         *
         * @description
         * Log info case
         */
        info: function Logger_info(message, data) {
            return this.log(message, data, 'INFO');
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#error
         *
         * @description
         * Log error case
         */
        error: function Logger_info(message, data) {
            return this.log(message, data, 'ERROR');
        },
        /**
         * @since 0.0.1
         * @author Igor Ivanovic
         * @method Logger#log
         *
         * @description
         * Log something in console
         */
        log: function Logger_log(message, data, type) {

            if (!this.config.enabled) {
                return;
            }

            if (this.config.types.indexOf(type) === -1) {
                type = 'ALL';
            }

            this.logs.push({
                type: type,
                message: message,
                trace: this.trace(),
                data: this.inspect(data),
                created: new Date().toISOString()
            });

            process.nextTick(this.write.bind(this));
        }
    }
);


module.exports = Logger;