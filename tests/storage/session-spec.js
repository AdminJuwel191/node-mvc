var di = require('../../framework/di');

describe('storage/session', function () {

    var Session,
        MemoryCache,
        logger = {},
        data = {},
        memory = {
            set: function(a, b) {
                data[a] = b;
            },
            get: function(a) {
                return data[a];
            },
            has: function(a) {
                return data.hasOwnProperty(a);
            },
            remove: function(a) {
                data[a] = null;
            }
        },

        Type = di.load('typejs');

    beforeEach(function () {
        var iface = di.load('interface/storage');
        var sIface = iface.inherit({}, {
            set: memory.set,
            get: memory.get,
            remove: memory.remove,
            has: memory.has
        });
        var componentMock = {
                get: function (name) {
                    if (name == "core/logger") {
                        return logger;
                    } else if (name == "storage/memory") {
                        return new sIface();
                    }
                }
            };
        Session = di.mock('storage/session', {
            typejs: Type,
            "interface/storage": iface,
            "core/component": componentMock,
            error: di.load('error'),
            core: di.load('core')
        });


    });

    it('should be function', function () {
        expect(Type.isFunction(Session)).toBe(true);
        var init = new Session;
        expect(init.config.storage.set).toBe(memory.set);
        expect(init.config.storage.get).toBe(memory.get);
        expect(init.config.storage.has).toBe(memory.has);
        expect(init.config.storage.remove).toBe(memory.remove);
        expect(init.getExpiredTime()).toBe(1200000);
        expect(init.getCookieKey()).toBe('session_id');

        var message = tryCatch(function () {
            new Session({
                storage: {

                }
            });
        });
        expect(message.indexOf('Session storage must be instance of interface/storage') > -1).toBe(true);
    });


    it('set|get|has', function (done) {
        var init = new Session({
            time: 100
        });
        init.set('KEY', 'CACHED');
        expect(init.get('KEY')).toBe('CACHED');
        init.set('KEY', 'CACHED1');
        expect(init.get('KEY')).toBe('CACHED1');


        setTimeout(function () {
            expect(init.get('KEY')).toBe(null);
            done();
        }, 200);
    });


    it('remove', function () {
        var init = new Session({
            time: 100
        });
        init.set('KEY', 'CACHED');
        expect(init.get('KEY')).toBe('CACHED');
        init.set('KEY', 'CACHED1');
        expect(init.get('KEY')).toBe('CACHED1');
        init.remove('KEY');

        expect(init.get('KEY')).toBe(null);

    });


    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }

    function n() {
    }
});
