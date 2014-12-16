var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/logger', function () {
    var logger,
        nPath,
        config = {
            publish: true,
            port: 10000,
            debug: true,
            file: "server.log",
            level: 5
        },
        Logger = di.load('core/logger');

    beforeEach(function () {
        nPath = path.normalize(__dirname + '/../tf/');
        di.setAlias('basePath', nPath);
        logger = new Logger(config);

    });

    it('instance|close', function (done) {

        var filePath = nPath + config.file;
        expect(di.exists(filePath)).toBe(true);

        var isServerEnded = false, isStreamEnded = false;

        var response = {
            writeHead: function () {
            },
            end: function () {
            }
        };

        logger.server.emit('request', {}, response);


        logger.server.on('close', function () {
            isServerEnded = true;
        });
        logger.stream.on('close', function () {
            isStreamEnded = true;
        });

        logger.close();


        setTimeout(function () {
            var html =  "Publishing log write stream on port: 10000";
            var message = fs.readFileSync(filePath, {encoding: 'utf-8'});
            expect(message.indexOf(html) > -1).toBe(true);

            setTimeout(function () {
                fs.unlinkSync(filePath);
                setTimeout(function () {
                    expect(isStreamEnded).toBe(true);
                    expect(isServerEnded).toBe(true);
                    expect(di.exists(filePath)).toBe(false);
                    done();
                }, 200);
            }, 100);
        }, 100);
    });


    it('construct', function (done) {

        nPath = path.normalize(__dirname + '/../tf/ab/cd/');
        di.setAlias('basePath', nPath);
        config.port = 11111;
        tryCatch(function () {
            logger._construct(config);
        });

        process.once('uncaughtException', errorHandler);

        function errorHandler(error) {
            expect(error.errno).toBe(34);
            expect(error.path).toBe(nPath + 'server.log');
            done();
        }

        setTimeout(function() {
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
