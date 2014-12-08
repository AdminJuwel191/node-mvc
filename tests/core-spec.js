"use strict";
var di = require("../");
describe("core", function () {
    var core, message;
    beforeEach(function () {
        core = di.load("core");
    });

    it("isConstructor", function () {
        var A = function() {};

        expect(core.isConstructor(A())).toBe(false);
        expect(core.isConstructor(new A())).toBe(true);
    });



    it("copy", function () {
        var a = {a: 1}, b = {a: a}, c = {a: a};
        c.b = b;
        b.c = c;

        var d1 = new Date();

        var r1 = /ig/g;
        expect(core.copy(a) === a).toBe(false);


        var d2 = core.copy(d1);
        expect(d2 === d1).toBe(false);

        expect(d2.getTime() === d1.getTime()).toBe(true);

        var r2 = core.copy(r1);
        expect(r2 === r1).toBe(false);
        expect(r2.source === r1.source).toBe(true);

        try {
            core.copy(b);
        } catch (e) {
            message = e.message;
        }

        expect(message).toBe("Core.copy: To many recursions on copy");
    });


    it("trim", function () {
        var a = " a d  ";

        expect(core.trim(a)).toBe("a d");
        expect(core.trim(1)).toBe(1);
    });

    it("extend", function () {
        var a = {a: 1}, b = {a: 1}, c = {a: 1};
        c.b = b;
        b.c = c;

        var e1 = core.extend(a);
        var e2 = {};
        var e3 = {};
        expect(e1.a).toBe(1);
        core.extend(e2, a);
        expect(e2.a).toBe(1);


        e3 = core.extend(e2, b);

        expect(e3.a).toBe(1);
        expect(e3.c).toBe(c);

        try {
            core.extend(e2, b, true);
        } catch (e) {
            message = e.message;
        }

        expect(message).toBe("Core.copy: To many recursions on copy");

        try {
            core.extend([], []);
        } catch (e) {
            message = e.message;
        }

        expect(message).toBe("Core.extend:  invalid source or destination type:");
    });



    it("toObject", function () {
        var a = [1, 2, 3];
        var obj = core.toObject(a);
        expect(obj[0]).toBe(1);
        expect(obj[1]).toBe(2);
        expect(obj[2]).toBe(3);

        try {
            core.toObject(1);
        } catch (e) {
            message = e.message;
        }

        expect(message).toBe("Core.toObject: Value is not array");
    });



    it("toObject", function () {
        var a = "ab", b = /ab/, c = /ab/ig;

        var ob1 = core.createRegex(a);
        var ob2 = core.createRegex(a, "ig");


        expect(ob1.source).toBe(b.source);
        expect(ob2.source).toBe(c.source);

        try {
            core.createRegex(1);
        } catch (e) {
            message = e.message;
        }

        expect(message).toBe("Core.createRegex: Value is not string");
    });


    it("match", function () {
        var re = /<(\w+)>/g;

        var matches = core.match(re, "<controller>/<action>/<id>");
        expect(matches[0][0]).toBe("<controller>");
        expect(matches[0][1]).toBe("controller");
        expect(matches[0][2]).toBe(0);
        expect(matches[0][3]).toBe('<controller>/<action>/<id>');

        expect(matches[1][0]).toBe("<action>");
        expect(matches[1][1]).toBe("action");
        expect(matches[1][2]).toBe(13);
        expect(matches[1][3]).toBe('<controller>/<action>/<id>');

        expect(matches[2][0]).toBe("<id>");
        expect(matches[2][1]).toBe("id");
        expect(matches[2][2]).toBe(22);
        expect(matches[2][3]).toBe('<controller>/<action>/<id>');
        try {
            core.match(re, 1);
        } catch (e) {
            message = e.message;
        }

        expect(message).toBe("Core.match: String is not valid type");
    });
});