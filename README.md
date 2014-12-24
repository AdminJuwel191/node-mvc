MVC JS  [![Build Status](https://api.travis-ci.org/igorzg/node-mvc.svg?branch=master)](https://travis-ci.org/igorzg/node-mvc) beta 
=====

Powerful lightweight mvc framework for nodejs inspired by [Yii](http://www.yiiframework.com/)

Features
====
1. Fully extensible
2. TDD driven
3. Type checking at runtime
4. Custom DI
5. Component based
6. Twig (swigjs) templating engine 
7. Dynamic routing
8. Logger

[Demo application](https://github.com/igorzg/mvcjs-testapp)

Getting started
====
npm install mvcjs

index.js
```javascript
var di = require('mvcjs');
var framework = di.load('bootstrap');
framework.setBasePath(__dirname);
framework.init('app/', 'env.json');
```

app/env.json
```json
{
  "aliases": [
    {
      "key": "assetsPath",
      "value": "@{basePath}/assets"
    }
  ],
  "components": [
    {
      "name": "core/logger",
      "enabled": true,
      "write": true,
      "publish": true,
      "console": true,
      "port": 9001,
      "file": "server.log"
    },
    {
      "name": "core/router",
      "errorRoute": "core/error"
    },
    {
      "name": "core/favicon",
      "path": "@{basePath}/favicon.ico"
    },
    {
      "name": "core/view",
      "themes": "@{appPath}/themes/",
      "views": "@{appPath}/views/",
      "theme": "default",
      "cache": true
    },
    {
      "name": "core/assets",
      "path": "@{basePath}/storage/",
      "hook": "^\\/assets"
    },
    {
      "name": "db/mongo",
      "connection": "mongodb://localhost/testdb"
    }
  ],
  "config": "config-test.js",
  "assetsPath": "@{assetsPath}",
  "port": 9000
}
```

app/config-test.js
```javascript

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

    router.add([
      {
        pattern: 'home/<action>',
        route: 'home/<action>'
      },
      {
        pattern: 'posts/<action:(create|update|delete)>',
        route: 'posts/<action>',
        method: ['GET', 'POST']
      },
      {
        pattern: 'user/<id:(\\d+)>',
        route: 'user/view'
      }
    ]);
    router.add({
        pattern: '/',
        route: 'home/index'
    });
};
```

