"use strict";
var Type = require('static-type-js'),
    util = require('util'),
    core = require('../core/index'),
    DataError,
    SilentError,
    Exception,
    HttpError;
// Take care, you cannot load framework loader here!!
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
Exception = Type.create({
    customMessage: Type.STIRNG,
    stack: Type.STIRNG,
    message: Type.STIRNG,
    combine: Type.STIRNG,
    trace: Type.STIRNG
}, {
    _construct: function Exception(msg, error) {
        var message = '', errorTrace, nError;

        try {
            message = this.inspect(msg, error);
        } catch (e) {
            message += e.message + '\n';
            message += e.stack + '\n';
        }
        try {
            throw new Error('Trace error call');
        } catch (e) {
            errorTrace = e.stack.split('\n');
            errorTrace.splice(1, 1);
            message += errorTrace.join('\n');
        }
        this.trace = message;

        nError = new Error();
        nError.name = 'Exception';
        error = core.extend(nError, this.__dynamic__);

        throw error;
    },
    /**
     * Inspect error message
     * @param msg
     * @param e
     * @returns {string}
     */
    inspect: function Exception_inspect(msg, e) {
        var handler, args = [], message = '';
        this.customMessage = msg;

        if (e instanceof Error) {
            this.message = e.message;
            this.stack = e.stack;
        }

        Object.keys(this.__dynamic__).forEach(function (key) {
            if (key === "_super") { return; }
            args.push({
                key: key,
                value: util.inspect(this.__dynamic__[key])
            })
        }.bind(this));

        args.sort(function (a, b) {
            if (a.key > b.key) {
                return 1;
            } else if (a.key < b.key) {
                return -1;
            }
            return 0;
        });

        args.forEach(function (item) {
            message += item.value + '\n';
        });

        args = null;
        handler = null;

        return message;
    }
});

/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name SilentError
 *
 * @constructor
 * @description
 * Exception is used to throw http error
 */
SilentError = Exception.inherit({}, {
    _construct: function SilentError(msg, error) {
        try {
            this._super(msg, error);
        } catch (e) {
            e.name = 'SilentError';
            console.log(e);
        }
    }
});
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
DataError = Exception.inherit({
    data: Type.OBJECT
}, {
    _construct: function DataError(data, message, e) {
        this.data = data;
        try {
            this._super(message, e);
        } catch (e) {
            e.name = 'DataError';
            throw e;
        }
    }
});
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
HttpError = DataError.inherit({
    code: Type.NUMBER
}, {
    _construct: function HttpError(code, data, message, e) {
        this.code = code;
        try {
            this._super(data, message, e);
        } catch (e) {
            e.name = 'HttpError';
            throw e;
        }

    }
});


module.exports = {
    Exception: Exception,
    HttpError: HttpError,
    DataError: DataError,
    SilentError: SilentError
};