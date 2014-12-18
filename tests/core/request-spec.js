var di = require('../../'), fs = di.load('fs'), path = di.load('path');
describe('core/request', function () {
    var request,
        config = {
            request: {
                on: function() {

                }
            },
            response: {

            }
        },
        logger = {
            print: function () {

            },
            log: function () {

            }
        },
        router = {

        },
        hooks = {

        },
        componentMock = {
            get: function (name) {
                if (name == "core/logger") {
                    return logger;
                } else if (name == "core/router") {
                    return router;
                }  else if (name == "hooks/request") {
                    return hooks;
                }
            }
        },
        Constructor,
        mock,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {


        mock = {
            typejs: Type,
            core: core,
            error: di.load('error'),
            promise: di.load('promise'),
            util: di.load('util'),
            url: di.load('url'),
            "interface/controller": di.load('interface/controller'),
            "core/component": componentMock
        };
        Constructor = di.mock('core/request', mock);
    });


    it('construct', function () {
        request = new Constructor(config, '/home/index');
        expect(request.request).toBe(config.request);
        expect(request.response).toBe(config.response);
        expect(request.url).toBe('/home/index');
        expect(request.statusCode).toBe(200);
        expect(request.parsedUrl.pathname).toBe('/home/index');
    });



    it('onEnd', function () {
        request = new Constructor(config, '/home/index');
        spyOn(config.request, "on").and.callThrough();
        request.onEnd(function() {

        });
        expect(config.request.on).toHaveBeenCalled();
    });


    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
