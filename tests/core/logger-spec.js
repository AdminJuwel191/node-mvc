var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/logger', function () {

    var
        nPath,
        config = {
            enabled: true,
            write: true,
            publish: true,
            console: true,
            port: 10000,
            file: "server.log",
            level: 3
        },
        streamMock = {
            write: function () {
            }
        },
        core = di.load('core'),
        fsmock = {
            open: function (name, r, mode, callback) {
                callback(200, 'file')
            },
            fstat: function (fd, callback) {
                callback(false, {size: 500})
            },
            read: function (a, b, c, d, e, callback) {
                callback();
            },
            createWriteStream: function () {
                return streamMock;
            }
        },
        request = {},
        response = {
            writeHead: function () {
            },
            end: function () {
            }
        },
        regests = [],
        Logger = di.mock('core/logger', {
            typejs: di.load('typejs'),
            util: di.load('util'),
            fs: fsmock,
            core: di.load('core'),
            error: di.load('error'),
            'core/http': HttpServer
        });

    function HttpServer() {
    }

    HttpServer.prototype.on = function (name, callback) {
        regests.push({
            name: name,
            callback: callback
        });
    };
    HttpServer.prototype.listen = function () {
    };
    HttpServer.prototype.emit = function (name, a, b, c, d) {
        regests.forEach(function (item) {
            if (item.name == name) {
                item.callback.call(item.callback, request, response);
            }
        })
    };
    beforeEach(function () {
        nPath = path.normalize(__dirname + '/../tf/');
        di.setAlias('basePath', nPath);
    });

    it('instance|close|info|error|log|warn', function (done) {

        var cPath = path.normalize(__dirname + '/../../');


        var chunks = [];
        streamMock.write = function (chunk) {
            chunks.push(chunk);
        };

        var logger = new Logger(config);

        var response = {
            writeHead: function () {
            },
            write: function () {
            },
            end: function () {
            },
            hook: function () {
            }
        };
        spyOn(response, 'hook');
        logger.server.emit('request', {}, response);


        expect(logger.config.enabled).toBe(true);
        expect(logger.config.write).toBe(true);
        expect(logger.config.publish).toBe(true);
        expect(logger.config.console).toBe(true);
        expect(logger.config.port).toBe(10000);
        expect(logger.config.file).toBe('server.log');
        expect(logger.config.level).toBe(3);


        logger.addHook(response.hook);
        logger.info('info', {});
        logger.error('error', {});
        logger.warn('warn', {});
        logger.log('log', {});
        logger.print('log', {});

        setTimeout(function () {
            chunks = chunks.filter(function (item) {
                return item !== '\n' && item.indexOf('CREATED:') === -1;
            });
            chunks = chunks.map(function (item) {
                return item.replace('\t', '').replace(/(.*\.js).*/, '$1)');
            });
            expect(core.compare(chunks,[ 'TYPE: INFO',
                'MESSAGE: Publishing log write stream on port:  at Type.Logger_info [as info] (' + cPath + 'framework/core/logger.js)',
                'DATA: 10000',
                'TYPE: INFO',
                'MESSAGE: info at Type.Logger_info [as info] (' + cPath + 'framework/core/logger.js)',
                'DATA: {}',
                'TYPE: ERROR',
                'MESSAGE: error at Type.Logger_info [as error] (' + cPath + 'framework/core/logger.js)',
                'DATA: {}',
                'TYPE: WARNING',
                'MESSAGE: warn at Type.Logger_warn [as warn] (' + cPath + 'framework/core/logger.js)',
                'DATA: {}',
                'TYPE: ALL',
                'MESSAGE: log at UserContext.<anonymous> (' + cPath + 'tests/core/logger-spec.js)',
                'DATA: {}' ,
                'TYPE: INFO',
                'MESSAGE: log at Type.Logger_info [as info] (' + cPath + 'framework/core/logger.js)',
                'DATA: {}' ])).toBe(true);


            expect(logger.logs.length).toBe(0);
            expect(chunks.length).toBe(18);
            done();
        }, 500);
    });


    it('instance|print not enabled|write', function () {

        var logger = new Logger({enabled: false});
        logger.log('printing');

        expect(logger.config.enabled).toBe(false);

        var ctx = {
            config: {

            },
            logs: [{ type: 'ERROR',
                message: 'error',
                trace: 'at Type.Logger_info [as error] (/Volumes/External/Github/node-mvc/framework/core/logger.js:9:7983)',
                data: '{}',
                created: '2015-04-02T21:49:00.131Z' }
            ],
            stream: false
        };

        logger.write.call(ctx);

        logger.config.console = false;
        logger.write.call(ctx);

        var message = tryCatch(function () {
            logger.addHook(1);
        });
        expect(message.indexOf('Logger hook must be function') > -1).toBe(true);

        logger.addHook(n);

        expect(logger.hooks.length).toBe(1);
        function n() {
        };
    });



    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
