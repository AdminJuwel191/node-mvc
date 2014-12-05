"use strict";
var  di = require('../di'),
     ViewInterface = di.load('interface/view'),
     View;


View = ViewInterface.inherit({

}, {

});

module.exports = View;
