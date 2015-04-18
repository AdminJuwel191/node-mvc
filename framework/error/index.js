"use strict";
/* global Type: true, core: true, util: true, DataError: true, SilentError: true, Exception: true, HttpError: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    DataError,
    Exception,
    HttpError,
    SlientHttpError;
/**
 * Stringify error message
 * @param name
 * @param trace
 * @param message
 * @param stack
 * @param data
 * @param code
 * @returns {string}
 */
function toString(name, trace, message, stack, data, code) {
    var m = name + ' ' + trace;
    m += '\n';
    m += message;
    if (code) {
        m += '\n';
        m += 'CODE:' + code;
    }
    if (data) {
        m += '\n';
        m += data;
    }
    m += '\n';
    m += stack;
    return m;
}
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Exception
 *
 * @constructor
 * @description
 * Exception is used to throw exception
 */
Exception = Type.create({},
    {
        _construct: function Exception(message, e) {

            if (e && e.message) {
                message = message + ', ' + e.message;
            }

            if (!(e instanceof Error)) {
                e = new Error();
            }

            throw toString('Exception', core.trace(8, 9), message, e.stack);
        }
    }
);

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name DataError
 *
 * @constructor
 * @description
 * Exception is used to throw http error
 */
DataError = Exception.inherit({},
    {
        _construct: function DataError(data, message, e) {

            if (e && e.message) {
                message = message + ', ' + e.message;
            }

            if (!(e instanceof Error)) {
                e = new Error();
            }

            throw toString('DataError', core.trace(8, 9), message, e.stack, core.inspect(data));
        }
    }
);
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name HttpError
 *
 * @constructor
 * @description
 * Exception is used to throw http error
 */
HttpError = DataError.inherit({},
    {
        _construct: function HttpError(code, data, message, e) {

            if (e && e.message) {
                message = message + ', ' + e.message;
            }

            if (!(e instanceof Error)) {
                e = new Error();
            }

            throw toString('HttpError', core.trace(8, 9), message, e.stack, core.inspect(data), code);
        }
    }
);

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name silentHttpError
 *
 * @constructor
 * @description
 * SlientHttpError is an error without throw
 * @return string
 */
function silentHttpError(code, data, message, e) {
    if (e && e.message) {
        message = message + ', ' + e.message;
    }

    if (!(e instanceof Error)) {
        e = new Error();
    }

    return toString('SlientHttpError', core.trace(8, 9), message, e.stack, core.inspect(data), code);
}


module.exports = {
    Exception: Exception,
    HttpError: HttpError,
    DataError: DataError,
    silentHttpError: silentHttpError
};