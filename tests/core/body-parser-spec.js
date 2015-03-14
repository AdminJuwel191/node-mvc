var di = require('../../'), fs = require('fs'), path = require('path');
describe('core/body-parser', function () {
    var Parser,
        core = di.load('core'),
        Type = di.load('typejs');

    beforeEach(function () {
        Parser = di.mock('core/bodyParser', {
            typejs: Type,
            core: core,
            error: di.load('error')
        });
    });


    it('construct|getBody', function () {
        var init = new Parser('type', 'body');
        expect(init.type).toBe('type');
        expect(init.body).toBe('body');
        expect(init.getBody()).toEqual({});
    });


    it('parse', function () {
        var body = di.readFileSync(__dirname + '/../tf/body.txt');
        var init = new Parser('multipart/form-data; boundary=----WebKitFormBoundarybCuYQd38rY4mhYtL', body);
        expect(init.type).toBe('multipart/form-data; boundary=----WebKitFormBoundarybCuYQd38rY4mhYtL');
        expect(init.body).toBe(body);
        init.parse();
        var data = init.getBody();
        expect(data.hasOwnProperty('meta_title')).toBe(true);
        expect(data.hasOwnProperty('meta_description')).toBe(true);
        expect(data.hasOwnProperty('title')).toBe(true);
        expect(data.hasOwnProperty('short_description')).toBe(true);
        expect(data.hasOwnProperty('description')).toBe(true);
        expect(data.hasOwnProperty('files')).toBe(true);
        expect(Type.isArray(data.files)).toBe(true);

    });

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
