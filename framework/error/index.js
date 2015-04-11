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
            e.trace = core.trace(8, 9);
            e.toString = function () {
                var m = this.name + ' ' + this.trace;
                m += '\n';
                m += this.message;
                if (this.code) {
                    m += '\n';
                    m += 'CODE:' + this.code;
                }
                if (this.data) {
                    m += '\n';
                    m += core.inspect(this.data);
                }
                m += '\n';
                m += this.stack;
                return m;
            };
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
                e.code = code;
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