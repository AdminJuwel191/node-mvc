var di = require('../../../'), // mvcjs as node package
    Controller = di.load('core/controller'),
    Test;


Test = Controller.inherit({}, {

    index: function () {
        
    }
});


module.exports = Test;