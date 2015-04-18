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
        expect(message.indexOf("Message") > -1).toBe(true);

        message = tryCatch(function() {
            return new error.Exception({}, new Error);
        });
        expect(message.indexOf("Exception") > -1).toBe(true);
    });


    it("DataError", function () {
        var a = {a: 1}, b = {a: a, b: 1};
        a.b = b;
        var c = {a: a, b: b};
        var message = tryCatch(function() {
            return new error.DataError(c, 'DataMessage', new Error);
        });
        expect(message.indexOf("DataError") > -1).toBe(true);
        expect(message.indexOf("DataMessage") > -1).toBe(true);
    });


    it("HttpError", function () {
        var a = {a: 1}, b = {a: a, b: 1};
        a.b = b;
        var c = {a: a, b: b};
        var message = tryCatch(function() {
            return new error.HttpError(500, c, 'DataMessage', new Error);
        });
        expect(message.indexOf("HttpError") > -1).toBe(true);
        expect(message.indexOf("500") > -1).toBe(true);
        expect(message.indexOf("DataMessage") > -1).toBe(true);
    });
    function tryCatch(callback) {
        try {
            return callback();
        } catch (e) {
            return e;
        }
    }
});