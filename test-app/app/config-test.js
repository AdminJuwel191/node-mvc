/**
 * Created by igi on 06/11/14.
 */

module.exports = function (componet) {
    "use strict";
    var viewLoader, router;

    viewLoader = componet.get('core/view');
    viewLoader.setTheme('home');
    router = componet.get('core/router');


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
        pattern: 'test/forward',
        route: 'test/forward',
        method: ['GET']
    });


    router.add({
        pattern: 'test/redirect',
        route: 'test/redirect',
        method: ['GET']
    });
    router.add({
        pattern: 'test/nodata',
        route: 'test/nodata',
        method: ['GET']
    });

    router.add({
        pattern: 'home',
        route: 'home/index',
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