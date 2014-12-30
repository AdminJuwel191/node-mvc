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
    },
    before_stop: function(params, data) {
        this.stopChain();
        return 'before_stop,' + data;
    },
    action_stop: function (params, data) {
        // this should not be executed
        return "action_stop," + data;
    },
    after_stop: function (params, data) {
        // this should not be executed
        return "after_stop," + data;
    },
    before_test: function(params, data) {
        return 'before_test,' + data;
    },
    action_test: function (params, data) {
        this.stopChain();
        return "action_test," + data;
    },
    after_test: function (params, data) {
        // this should not be executed
        return "after_test," + data;
    },
    before_test2: function(params, data) {
        return 'before_test2,' + data;
    },
    action_test2: function (params, data) {
        return "action_test2," + data;
    },
    after_test2: function (params, data) {
        this.stopChain();
        return "after_test2," + data;
    }
});

module.exports = Core;


