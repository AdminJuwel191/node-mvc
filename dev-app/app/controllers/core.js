var di = require('../../../'), // mvcjs as node package
    Controller = di.load('core/controller'),
    Core;


Core = Controller.inherit({}, {
    beforeEach: function Core_beforeEach(route) {


    }
});


module.exports = Core;


