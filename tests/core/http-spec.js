var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/http', function () {
    var http,
        server = {
            on: function() {},
            listen: function() {},
            close: function() {},
            setTimeout: function() {},
            getEncoding: function() {}
        },
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        var Http = di.mock('core/http', {
            typejs: Type,
            core: core,
            'interface/http': di.load('interface/http'),
            http: {
                createServer: function() {
                    return server;
                }
            }
        });
        http = new Http();
    });




    it('on', function () {
        spyOn(server, 'on').and.callThrough();
        http.on();
        expect(server.on).toHaveBeenCalled();
    });

    it('listen', function () {
        spyOn(server, 'listen').and.callThrough();
        http.listen();
        expect(server.listen).toHaveBeenCalled();
    });

    it('close', function () {
        spyOn(server, 'close').and.callThrough();
        http.close();
        expect(server.close).toHaveBeenCalled();
    });

    it('setTimeout', function () {
        spyOn(server, 'setTimeout').and.callThrough();
        http.setTimeout();
        expect(server.setTimeout).toHaveBeenCalled();
    });


    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
