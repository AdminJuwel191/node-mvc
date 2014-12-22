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
    beforeEach: function() {
        return 'beforeEach';
    },
    before_index: function(params, data) {
        return 'before_index' + data;
    },
    action_index: function (params, data) {
        return "INDEX ACTiON " + data;
    },
    after_index: function (params, data) {
        return "after_index " + data;
    },
    afterEach: function (params, data) {
        return "after_each" + data;
    }
});

module.exports = Core;


