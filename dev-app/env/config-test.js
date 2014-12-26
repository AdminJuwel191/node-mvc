/**
 * Created by igi on 06/11/14.
 */

module.exports = function (componet, di) {
    "use strict";
    var viewLoader, router,
        logger = componet.get('core/logger'),
        loggerModel = di.load('@{modelsPath}/logger');

    viewLoader = componet.get('core/view');
    viewLoader.setTheme('home');

    // bind logger hook
    logger.addHook(loggerModel.save.bind(loggerModel));

    router = componet.get('core/router');

    router.add({
        pattern: 'home/<action>',
        route: 'home/<action>'
    });
    router.add({
        pattern: 'posts/<action:(create|update|delete)>',
        route: 'posts/<action>',
        method: ['GET', 'POST']
    });
    router.add({
        pattern: 'user/<id:(\\d+)>',
        route: 'user/view'
    });
    router.add({
        pattern: 'test/forward',
        route: 'test/forward',
        method: ['GET']
    });
    router.add({
        pattern: 'test/redirect',
        route: 'test/redirect'
    });
    router.add({
        pattern: 'test/nodata',
        route: 'test/nodata'
    });

    router.add({
        pattern: 'home',
        route: 'user/view'
    });

    router.add({
        pattern: '/',
        route: 'home/index'
    });
    /*
     router.add({
     dynamic: true,
     constructor: app.load('@{appPath}/routes')
     });

     */

};