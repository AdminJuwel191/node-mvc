"use strict";
var di = require('../../../'), // mvcjs as node package
    Controller = di.load('typejs'),
    Core;


Core = Controller.create({}, {
    action_handler: function (params) {
        return params;
    }
});


//module.exports = Core;



