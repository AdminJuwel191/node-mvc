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

    it('parseContentDisposition|parseName', function () {
        var init = new Parser('multipart/form-data; boundary=----WebKitFormBoundarybCuYQd38rY4mhYtL', '');
        var cd = init.parseContentDisposition('Content-Disposition: form-data;');
        expect(cd).toBe('form-data');
        expect(init.parseName('')).toBe(false);
        expect(init.parseContentDisposition('')).toBe(false);

    });


    it('parseBoundary', function () {
        var body = di.readFileSync(__dirname + '/../tf/body4.txt');
        var init = new Parser('', '');
        var cd = init.parseBoundary(body, '----WebKitFormBoundarybCuYQd38rY4mhYtL');
        expect(cd.files.contentDisposition).toBe('form-data');

        cd = init.parseBoundary('', '');
        expect(cd).toEqual({});
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

        init = new Parser('multipart/form-data; boundary=----WebKitFormBoundarybCuYQd38rY4mhYtL', '');
        init.parse();
        expect(init.getBody()).toEqual({});
    });


    it('parse 2', function () {
        var body = 'meta_title=meta+title%2B%2Bshort+a+%2Baaa&meta_description=meta+description&title=title+a+%2Baaaa&short_description=short+a+short+%2B%2B%2Ba&description=description';
        var init = new Parser('application/x-www-form-urlencoded', body);
        expect(init.type).toBe('application/x-www-form-urlencoded');
        expect(init.body).toBe(body);
        init.parse();
        var data = init.getBody();
        expect(data.hasOwnProperty('meta_title')).toBe(true);
        expect(data.hasOwnProperty('meta_description')).toBe(true);
        expect(data.hasOwnProperty('title')).toBe(true);
        expect(data.hasOwnProperty('short_description')).toBe(true);
        expect(data.hasOwnProperty('description')).toBe(true);


        expect(data.meta_title).toBe('meta title++short a +aaa');
        expect(data.meta_description).toBe('meta description');
        expect(data.title).toBe('title a +aaaa');
        expect(data.short_description).toBe('short a short +++a');
        expect(data.description).toBe('description');


    });


    it('parse 3', function () {
        var body = di.readFileSync(__dirname + '/../tf/body2.txt');
        var init = new Parser('text/plain', body);
        expect(init.type).toBe('text/plain');
        expect(init.body).toBe(body);
        init.parse();
        var data = init.getBody();
        expect(data.hasOwnProperty('meta_title')).toBe(true);
        expect(data.hasOwnProperty('meta_description')).toBe(true);
        expect(data.hasOwnProperty('title')).toBe(true);
        expect(data.hasOwnProperty('short_description')).toBe(true);
        expect(data.hasOwnProperty('description')).toBe(true);


        expect(data.meta_title).toBe('meta title++short a +aaa');
        expect(data.meta_description).toBe('meta == =description');
        expect(data.title).toBe('title a+==+aaaa');
        expect(data.short_description).toBe('short a+short==++++a');
        expect(data.description).toBe('description');
    });


    it('parse 4', function () {
        var body = di.readFileSync(__dirname + '/../tf/body3.txt');
        var init = new Parser('application/json', body);
        expect(init.type).toBe('application/json');
        expect(init.body).toBe(body);
        init.parse();
        var data = init.getBody();
        expect(data.hasOwnProperty('meta_title')).toBe(true);
        expect(data.hasOwnProperty('meta_description')).toBe(true);
        expect(data.hasOwnProperty('title')).toBe(true);
        expect(data.hasOwnProperty('short_description')).toBe(true);
        expect(data.hasOwnProperty('description')).toBe(true);


        expect(data.meta_title).toBe('meta title++short a +aaa');
        expect(data.meta_description).toBe('meta == =description');
        expect(data.title).toBe('title a+==+aaaa');
        expect(data.short_description).toBe('short a+short==++++a');
        expect(data.description).toBe('description');

    });

    it('parse error', function () {
        var body = di.readFileSync(__dirname + '/../tf/body3.txt');
        var init = new Parser('application/json', body + 'aabc');


        var message = tryCatch(function () {
            init.parse();
        });

        expect(message.message).toBe('Error parsing json, Unexpected token a');

        init = new Parser('application/jsobcn', body + 'aabc');

        message = tryCatch(function () {
            init.parse();
        });

        expect(message.message).toBe('Unsupported form type');
    });

    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});
