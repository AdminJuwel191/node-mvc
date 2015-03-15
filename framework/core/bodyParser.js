"use strict";
var di = require('../di'),
    Type = di.load('typejs'),
    error = di.load('error'),
    BodyParser;
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @constructor BodyParser
 *
 * @description
 * Parse body
 */
BodyParser = Type.create({
    type: Type.STRING,
    body: Type.STRING,
    parsedBody: Type.OBJECT
}, {
    _construct: function BodyParser_construct(type, body) {
        this.type = type;
        this.body = body;
        this.parsedBody = {};
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#getBody
     *
     * @description
     * Get parsed body
     */
    getBody: function BodyParser_getBody() {
        return this.parsedBody;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#parse
     *
     * @description
     * Parse body
     */
    parse: function BodyParser_parse() {
        if (this.type.indexOf('multipart/form-data') > -1) {
            this.parsedBody = this.parseBoundary(this.body, this.type.replace(/^.*boundary=/, ''));
        } else if (this.type.indexOf('application/x-www-form-urlencoded') > -1) {
            // raw url
            this.body.split("&").forEach(function (item) {
                var key, val;
                item = item.split("=");
                key = decodeURIComponent(item.shift().replace('+', ' '));
                val = decodeURIComponent(item.shift().replace('+', ' '));
                this.parsedBody[key] = val;
            }.bind(this));
        } else if (this.type.indexOf('text/plain') > -1) {
            // plain text
            this.body.split("\n").forEach(function (item) {
                var key, val;
                item = item.split("=");
                key = decodeURIComponent(item.shift());
                val = decodeURIComponent(item.join('='));
                this.parsedBody[key] = val;
            }.bind(this));
        } else if (this.type.indexOf('application/json') > -1) {
            try {
                this.parsedBody = JSON.parse(this.body);
            } catch (e) {
                throw new error.HttpError(500, {type: this.type, body: this.body}, "Error parsing json", e);
            }
        } else {
            throw new error.HttpError(500, {type: this.type, body: this.body}, "Unsupported form type");
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#parseBoundary
     * @param body {string} body to be parsed
     * @param boundary {string} boundary value
     * @description
     * Parse boundary
     */
    parseBoundary: function BodyParser_parseBoundary(body, boundary) {
        var data = {}, splits;
        splits = body.split("--" + boundary);

        splits.shift();
        splits.pop();

        if (splits.length > 0) {
            splits = splits.map(function (item) {
                return item.replace(/^\r\n/, '').replace(/\r\n$/, '').trim();
            });
            splits.forEach(function (item) {
                var fileName = this.parseFileName(item),
                    contentDisposition = this.parseContentDisposition(item),
                    contentType = this.parseContentType(item),
                    name = this.parseName(item),
                    value = this.parseValue(item),
                    obj = {},
                    temp;

                if (!!fileName) {
                    obj.fileName = fileName;
                }
                if (!!contentType) {
                    obj.contentType = contentType;
                }
                if (!!contentDisposition) {
                    obj.contentDisposition = contentDisposition;
                }
                obj.name = name;
                obj.value = value;
                if (data.hasOwnProperty(name)) {
                    temp = data[name];
                    if (Type.isArray(temp)) {
                        temp.push(obj);
                    } else {
                        data[name] = [];
                        data[name].push(obj);
                        data[name].push(temp);
                    }
                } else {
                    data[name] = obj;
                }
            }.bind(this));
        }

        return data;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#parseContentDisposition
     * @param str {string} string to parse
     * @description
     * Boundary content disposition
     * @return {boolean|string}
     */
    parseContentDisposition: function BodyParser_parseContentDisposition(str) {
        var matches = str.match(/Content-Disposition:([^;]+)/);
        if (matches && matches.length > 0) {
            return matches[1].trim();
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#parseFileName
     * @param str {string} string to parse
     * @description
     * Boundary file name
     * @return {boolean|string}
     */
    parseFileName: function BodyParser_parseFileName(str) {
        var matches = str.match(/filename="([^"]+)"/);
        if (matches && matches.length > 0) {
            return matches[1];
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#parseContentType
     * @param str {string} string to parse
     * @description
     * Boundary content type
     * @return {boolean|string}
     */
    parseContentType: function BodyParser_parseContentType(str) {
        var matches = str.match(/Content-Type:([^\r]+)/);
        if (matches && matches.length > 0) {
            return matches[1].trim();
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#parseName
     * @param str {string} string to parse
     * @description
     * Boundary parse name
     * @return {boolean|string}
     */
    parseName: function BodyParser_parseName(str) {
        var matches = str.match(/name="([^"]+)"/);
        if (matches && matches.length > 0) {
            return matches[1];
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method BodyParser#parseValue
     * @param str {string} string to parse
     * @description
     * Parse value
     * @return {boolean|string}
     */
    parseValue: function BodyParser_parseValue(str) {
        var value = str.split(/\r\n\r\n/);
        value.shift();
        return value.join('\\r\\n\\r\\n');
    }
});


module.exports = BodyParser;