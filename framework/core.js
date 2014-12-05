"use strict";
/* global Type: true, error: true, Object: true */
var Type = require('static-type-js');
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isConstructor
 *
 * @description
 * Check if object is an constructor
 */
function isConstructor(obj) {
    if (Type.isObject(obj)) {
        return Object.getPrototypeOf(obj).hasOwnProperty("constructor");
    }
    return false;
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function copy
 *
 * @description
 * Copy data from source
 */
function copy(source) {
    var destination;
    if (Type.isDate(source)) {
        return new Date(source.getTime());
    } else if (Type.isRegExp(source)) {
        return new RegExp(source.source);
    } else if (isConstructor(source)) {
        try {
            destination = new source.constructor;
            Object.keys(source).forEach(function (key) {
                destination[key] = copy(source[key]);
            });
            return destination;
        } catch (e) {
            throw new Error('Core.copy: To many recursions on copy', e);
        }
    }
    return source;
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function Extend
 *
 * @description
 * Extend object
 */
function extend(destination, source, keys) {
    if (Type.isUndefined(source)) {
        return extend({}, destination, keys);
    }
    if (Type.isObject(destination) && Type.isObject(source) && !Type.isArray(source) && !Type.isArray(destination)) {
        Object.keys(source).forEach(function (key) {
            if (Type.isArray(keys)) {
                if (keys.indexOf(key) > -1) {
                    destination[key] = copy(source[key]);
                }
            } else {
                destination[key] = copy(source[key]);
            }
        });
    } else {
        throw new Error('Core.extend:  invalid source or destination type:');
    }
    return destination;
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isBoolean
 *
 * @description
 * Check if value is trimed
 */
function trim(value) {
    return Type.isString(value) ? value.trim() : value;
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function match
 *
 * @description
 * Match string
 */
function match(re, str) {
    var matches = [];
    if (Type.isString(str)) {
        str.replace(re, function () {
            matches.push([].slice.call(arguments).filter(function (item) {
                return item !== undefined;
            }));
        });
    } else {
        throw new Error('Core.match: String is not valid type');
    }
    return matches;
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function createRegex
 *
 * @description
 * Creates regular expresion
 */
function createRegex(value, modifier) {
    if (Type.isString(value)) {
        return new RegExp(value, modifier ? modifier : 'g');
    }
    throw new Error('Core.createRegex: Value is not string');
}

/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function toObject
 *
 * @description
 * Array to object conversion
 */
function toObject(arr) {
    var obj;
    if (Type.isArray(arr)) {
        obj = {};
        arr.forEach(function (item, index) {
            obj[index] = item;
        });
        return obj;
    }
    throw new Error('Core.toObject: Value is not array');
}
/**
 * Export functions
 * @type {{isBoolean: isBoolean, isUndefined: isUndefined, isDefined: isDefined, isObject: isObject, isString: isString, isNumber: isNumber, isDate: isDate, isArray: isArray, isFunction: isFunction, isRegExp: isRegExp, isConstructor: isConstructor, copy: copy, trim: trim, throwError: throwError}}
 */
module.exports = {
    isConstructor: isConstructor,
    copy: copy,
    extend: extend,
    trim: trim,
    match: match,
    createRegex: createRegex,
    toObject: toObject
};