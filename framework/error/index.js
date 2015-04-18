"use strict";
/* global Type: true, core: true, util: true, DataError: true, SilentError: true, Exception: true, HttpError: true */
var di = require('../di'),
    Type = di.load('typejs'),
    core = di.load('core'),
    DataError,
    Exception,
    HttpError;
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
            if (!(e instanceof Error)) {
                e = new Error();
            }
            if (e.message) {
                e.message = message + ', ' + e.message;
            } else {
                e.message = message;
            }

            e.name = 'Exception';

            e.toString = (function (name, trace, message, code, data, stack) {
                return function error_toString() {
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
            }(e.name, core.trace(8, 9), e.message, e.code, core.inspect(e.data), e.stack));

            if (e.code) {
                delete e.code;
            }

            if (e.data) {
                delete e.data;
            }

            throw e;
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
            try {
                this._super(message, e);
            } catch (e) {
                e.data = data;
                e.name = 'DataError';
                throw e;
            }
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
            try {
                this._super(data, message, e);
            } catch (e) {
                if (Type.isNumber(code) && !isNaN(code)) {
                    e.code = code;
                }
                e.name = 'HttpError';
                throw e;
            }
        }
    }
);


module.exports = {
    Exception: Exception,
    HttpError: HttpError,
    DataError: DataError
};