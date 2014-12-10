var di = require('../');
var framework = di.load('bootstrap');
framework.setBasePath(__dirname);
framework.init('app/');
