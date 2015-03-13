var di = require('../../framework/di');

describe('cache/memory', function () {

    var Instance,
        MemoryCache,
        Type = di.load('typejs');

    beforeEach(function () {
        MemoryCache = di.mock('cache/memory', {
            typejs: Type,
            "interface/cache": di.load('interface/cache'),
            error: di.load('error'),
            core: di.load('core')
        });


    });

    it('should be function', function () {
        expect(Type.isFunction(MemoryCache)).toBe(true);
    });


    it('set', function (done) {
        Instance = new MemoryCache;
        expect(Instance.set('KEY', 'CACHED')).toBe(true);
        expect(Instance.set('KEY', 'CACHED')).toBe(false);
        expect(Instance.set('KEY2', 'CACHED', 100)).toBe(true);
        setTimeout(function() {
            expect(Instance.get('KEY2')).toBe(null);
            done();
        }, 200);
    });


    it('remove', function () {
        Instance = new MemoryCache;
        expect(Instance.set('KEY', 'CACHED')).toBe(true);
        Instance.remove('KEY');
        expect(Instance.get('KEY')).toBe(null);
    });

    it('get', function (done) {
        Instance = new MemoryCache;
        expect(Instance.set('KEY', 'CACHED')).toBe(true);
        expect(Instance.get('KEY')).toBe('CACHED');
        expect(Instance.get('KEY1')).toBe(null);
        expect(Instance.get('KEY1', 'DEFAULT')).toBe('DEFAULT');

        expect(Instance.set('KEY6', 'CACHED2', 50)).toBe(true);
        expect(Instance.get('KEY6')).toBe('CACHED2');

        setTimeout(function() {
            expect(Instance.get('KEY6')).toBe(null);
            done();
        }, 50);
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
