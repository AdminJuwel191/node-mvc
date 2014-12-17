"use strict";
var di = require('../../../'), // mvcjs as node package
    Type = di.load('typejs'),
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


