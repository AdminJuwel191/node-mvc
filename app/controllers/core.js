var loader = require('../../mvcjs'),
    Controller = loader.load('core/controller'),
    Core;


Core = Controller.inherit({}, {
    beforeEach: function Core_beforeEach(route) {

        console.log('beforeEach', route, this);

    }
});


module.exports = Core;


