var di = require('../../../'), // mvcjs as node package
    Core = di.load('@{controllersPath}/core'),
    Promise = di.load('promise'),
    Posts;


Posts = Core.inherit({}, {
    before_create: function Posts_beforecreate(params) {
        // example model call
        return new Promise(function(resolve, reject) {
             setTimeout(function() {
                 params.title = 'THIS IS AN MODEL CALL EXAMPLE';
                 resolve(params);
             }, 0);
        });
    },
    create: function Core_create(params, data) {
        // currently
        var template = this.getView('posts/index');

        var url = this.createUrl("user/view", {id: 1});

        return template.replace('{{id}}', data.id).replace('{{title}}', url);
    },
    after_create: function (params, data) {

        console.log('data', data);

        return data;
    }


});


module.exports = Posts;