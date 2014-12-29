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
        Logger = di.load('core/logger');

    beforeEach(function () {
        nPath = path.normalize(__dirname + '/../tf/');
        di.setAlias('basePath', nPath);
    });

    it('instance|close|print', function (done) {
        var logger = new Logger(config);
        var filePath = nPath + config.file;
        expect(di.exists(filePath)).toBe(true);

        var isServerEnded = false, isStreamEnded = false;

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


        logger.server.on('close', function () {
            isServerEnded = true;
        });
        logger.stream.on('close', function () {
            isStreamEnded = true;
        });

        logger.close();


        expect(logger.config.enabled).toBe(true);
        expect(logger.config.write).toBe(true);
        expect(logger.config.publish).toBe(true);
        expect(logger.config.console).toBe(true);
        expect(logger.config.port).toBe(10000);
        expect(logger.config.file).toBe('server.log');
        expect(logger.config.level).toBe(3);

        logger.addHook(response.hook);
        logger.print('printing');


        setTimeout(function () {
            var html = "Publishing log write stream on port: 10000";
            var message = fs.readFileSync(filePath, {encoding: 'utf-8'});
            expect(message.indexOf(html) > -1).toBe(true);

            setTimeout(function () {
                fs.unlinkSync(filePath);
                setTimeout(function () {
                    expect(isStreamEnded).toBe(true);
                    expect(isServerEnded).toBe(true);
                    expect(di.exists(filePath)).toBe(false);
                    expect(response.hook).toHaveBeenCalled();
                    done();
                }, 200);
            }, 100);
        }, 100);
    });


    it('instance|print not enabled|log|addHook', function () {

        var logger = new Logger({enabled: false});
        var print = logger.print('printing');
        expect(logger.config.enabled).toBe(false);
        expect(print.shift()).toBe('printing');

        print = logger.log('printing2');
        expect(logger.config.enabled).toBe(false);
        expect(print.shift()).toBe('printing2');

        var message = tryCatch(function() {
            logger.addHook(1);
        });

        expect(message.customMessage).toBe('Logger hook must be function');

        logger.addHook(n);

        expect(logger.hooks.length).toBe(1);
        function n(){};
    });


    it('construct', function (done) {
        var logger = new Logger(config);
        var _e;
        nPath = path.normalize(__dirname + '/../tf/ab/cd/');
        di.setAlias('basePath', nPath);
        config.port = 11111;
        tryCatch(function () {
            logger._construct(config);
        });

        process.once('uncaughtException', function (e) {
            _e = e;
        });

        setTimeout(function () {
            expect(_e.errno).toBe(34);
            expect(_e.path).toBe(nPath + 'server.log');
            done();
        }, 100);
    });


    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
