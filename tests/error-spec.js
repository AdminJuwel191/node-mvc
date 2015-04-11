"use strict";
var di = require("../");
describe("error", function () {
    var error;
    beforeEach(function () {
        error = di.load("error");
    });

    it("Exception", function () {
        var message = tryCatch(function() {
            return new error.Exception('Message', new Error);
        });
        expect(message.message).toBe('Message');
        message.trace = null;
        expect(Type.isString(message.toString())).toBe(true);

        message = tryCatch(function() {
            return new error.Exception({}, new Error);
        });

        expect(message.name).toBe('Exception');
    });


    it("DataError", function () {
        var a = {a: 1}, b = {a: a, b: 1};
        a.b = b;
        var c = {a: a, b: b};
        var message = tryCatch(function() {
            return new error.DataError(c, 'DataMessage', new Error);
        });
        expect(message.name).toBe('DataError');
        expect(message.message).toBe('DataMessage');
        expect(message.data).toBe(c);
        expect(Type.isString(message.toString())).toBe(true);
    });


    it("HttpError", function () {
        var a = {a: 1}, b = {a: a, b: 1};
        a.b = b;
        var c = {a: a, b: b};
        var message = tryCatch(function() {
            return new error.HttpError(500, c, 'DataMessage', new Error);
        });
        expect(message.name).toBe('HttpError');
        expect(message.code).toBe(500);
        expect(message.message).toBe('DataMessage');
        expect(message.data).toBe(c);
        expect(Type.isString(message.toString())).toBe(true);
    });
    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});