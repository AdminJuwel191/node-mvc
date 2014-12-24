"use strict";

var path = require("path");
var fs = require('fs');
var parent = path.normalize(__dirname + "/../");

describe("di", function () {
    var di, alias, message, file;
    beforeEach(function () {
        di = require("../");
    });

    it("instanceError", function () {

        var oFile = di.normalizePath(di.getAlias("framework") + "/files.json");
        var nFile = di.normalizePath(di.getAlias("framework") + "/files.template.json");
        fs.renameSync(oFile, nFile);

        try {
            di._construct();
        } catch (e) {
            message = e.message;
        }
        expect(message).toBe("Cannot load @{framework}/files.json path");
        fs.renameSync(nFile, oFile);
    });


    it("exists", function () {
        var fPAth = di.normalizePath(__dirname + "/tf/di-test-load"), message;
        expect(di.exists(fPAth + ".js")).toBe(true);
        expect(di.exists(fPAth + ".php")).toBe(false);

        try {
            di.exists(1, 1);
        } catch (e) {
            message = e.customMessage;
        }
        expect(message).toBe("DI.exists:  file or fileType must bi string");
    });

    it("mock", function () {
        var mockedMssage, path = di.normalizePath(__dirname + '/tf/di-test-mock');
        var load = di.mock(path, {
            'http': function (data) {
                mockedMssage = data;
            }
        });
        expect(mockedMssage).toBe('WORKS');
    });


    it("hasAlias", function () {
        expect(di.hasAlias("framework")).toBe(true);
    });

    it("getAlias", function () {
        alias = di.getAlias("framework");
        expect(alias.replace(parent, "")).toBe("framework/");
    });

    it("getAliasError", function () {
        try {
            di.getAlias("test");
        } catch (e) {
            message = e.customMessage;
        }
        expect(message).toBe("DI.getAlias: \"test\" is not valid");
    });

    it("setAlias", function () {
        di.setAlias("test", __dirname + "/newtest/");
        alias = di.getAlias("test");
        expect(alias.replace(parent, "")).toBe("tests/newtest/");
    });

    it("normalizePath", function () {
        di.setAlias("b", __dirname + "/newtest/");
        var normalized = di.normalizePath("@{b}/b").replace(parent, "");
        expect(normalized).toBe("tests/newtest/b");
    });

    it("setAliasError", function () {
        var message, val = __dirname + "/newtest/%*:<>";
        try {
            di.setAlias("test", val);
        } catch (e) {
            message = e.customMessage;
        }
        expect(message).toBe('DI.setAlias: Invalid alias value, chars \'\\?%*:|"<>.\' and spaces are not allowed. KEY: test, VAL:' + val);
    });

    it("loadError", function () {
        var message;
        di.setAlias("test", __dirname + "/");
        try {
            di.load("@{test}/one");
        } catch (e) {
            message = e.customMessage;
        }
        expect(message).toBe("DI.load");
    });

    it("load", function () {
        di.setAlias("test", __dirname + "/");
        expect(di.load("@{test}/tf/di-test-load")).toBe("CORRECT");
    });

    it("readFileSync", function () {
        di.setAlias("test", __dirname + "/");
        file = di.readFileSync("@{test}/tf/di-test-load.js");
        expect(file).toBe('module.exports = "CORRECT";');
    });

    it("readFileSyncError", function () {
        di.setAlias("test", __dirname + "/");
        try {
            di.readFileSync("@{test}/di-test-load1.js");
        } catch (e) {
            message = e.customMessage;
        }
        expect(message).toBe('DI.readFileSync');
    });
});