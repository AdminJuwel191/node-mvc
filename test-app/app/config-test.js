/**
 * Created by igi on 06/11/14.
 */

module.exports = function(app) {

    var router = app.getComponent('core/router');


    router.add({
        pattern: 'home/<action>',
        route: 'home/<action>',
        method: ['GET']
    });
    router.add({
        pattern: 'posts/<action:(create|update|delete)>',
        route: 'posts/<action>',
        method: ['GET', 'POST']
    });
    router.add({
        pattern: 'user/<id:(\\d+)>',
        route: 'user/view',
        method: ['GET']
    });

    router.add({
        pattern: 'test',
        route: 'test/index',
        method: ['GET']
    });

    router.add({
        pattern: 'home',
        route: 'home/index',
        method: ['GET']
    });

    router.add({
        pattern: '<controller>/<action>',
        route: '<controller>/<action>',
        method: ['GET']
    });
    router.add({
        pattern: '/',
        route: 'home/index',
        method: ['GET']
    });
    /*
    router.add({
        dynamic: true,
        constructor: app.load('@{appPath}/routes')
    });*/

};