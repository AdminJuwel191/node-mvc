"use strict";
var di = require('../../../'), // mvcjs as node package
    Controller = di.load('core/controller'),
    Test;


Test = Controller.inherit({}, {

    action_index: function () {
        this.redirect(this.createUrl('posts/create', {id: 1, test: 'two'}));
    }
});


module.exports = Test;