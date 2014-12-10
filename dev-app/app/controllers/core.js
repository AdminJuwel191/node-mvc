"use strict";
var di = require('../../../'), // mvcjs as node package
    Controller = di.load('core/controller'),
    Core;


Core = Controller.inherit({}, {
    beforeEach: function Core_beforeEach(route) {


    },

    action_error: function (params) {

        return 'CUSTOM ERROR HANDLER; ' + params;
    }
});


module.exports = Core;


