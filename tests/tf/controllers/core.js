"use strict";
var di = require('../../../'), // mvcjs as node package
    Controller = di.load('core/controller'),
    Core;


Core = Controller.inherit({}, {
    action_error: function (params) {
        return 'CUSTOM ERROR HANDLER; ' + params.message;
    },
    action_handler: function (params) {
        return params;
    },
    beforeEach: function (action, params) {
        return 'beforeEach,b' + action;
    },
    before_index: function (params, data) {
        return 'before_i,' + data;
    },
    action_index: function (params, data) {
        return "action_i," + data;
    },
    after_index: function (params, data) {
        return "after_i," + data;
    },
    afterEach: function (action, params, data) {
        return "afterEach,a" + action + data;
    }
});

module.exports = Core;


