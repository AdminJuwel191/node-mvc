"use strict";
/* global Type: true, error: true, Object: true */
var Type = require('static-type-js'),
    util = require('util');

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
function extend(destination, source, deepCopy) {
    if (Type.isUndefined(source)) {
        return extend({}, destination, false);
    }
    if (Type.isObject(destination) && Type.isObject(source) && !Type.isArray(source) && !Type.isArray(destination)) {
        Object.keys(source).forEach(function (key) {
            destination[key] = Type.assert(Type.BOOLEAN, deepCopy) && !!deepCopy ? copy(source[key]) : source[key];
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
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function compare
 *
 * @description
 * Compare object a with b
 */
function compare(a, b) {
    if (Type.isString(a)) {
        return a === b;
    } else if (Type.isNumber(a)) {
        if (isNaN(a) || isNaN(b)) {
            return isNaN(a) === isNaN(b);
        }
        return a === b;
    } else if (Type.isBoolean(a)) {
        return a === b;
    } else if (Type.isDate(a) && Type.isDate(b)) {
        return a.getTime() === b.getTime();
    } else if (Type.isRegExp(a) && Type.isRegExp(b)) {
        return a.source === b.source;
    } else if (Type.isArray(a) && Type.isArray(b)) {
        // check references first
        if (a === b) {
            return true;
        }
        return a.every(function (item, index) {
            try {
                return compare(item, b[index]);
            } catch (e) {
                throw e;
            }
        });
    } else if (Type.isObject(a) && Type.isObject(b)) {
        var equal = [];
        // check references first
        if (a === b) {
            return true;
        }

        try {
            for (var key in a) {
                equal.push(compare(a[key], b[key]));
            }
        } catch (e) {
            throw e;
        }
        return equal.every(function (item) {
            return item === true;
        });
        /// compare undefined and nulls and nans
    } else if (a === b) {
        return true;
    }

    return false;
}

/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function trace
 *
 * @description
 * Trace call
 */
function trace(a, b) {
    return trim((new Error()).stack.split('\n').slice(a || 3, b || 4).join('\n'));
}

/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @method Exception#inspect
 *
 * @description
 * Inspect data object
 */
function inspect(data, depth) {
    if (Type.isObject(data)) {
        return util.inspect(data, {depth: depth || 10});
    }
    return data;
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
    toObject: toObject,
    compare: compare,
    trace: trace,
    inspect: inspect
};