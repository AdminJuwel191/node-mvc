var loader = require('./mvcjs');
var framework = loader.load('mvcjs');
framework.setBasePath(__dirname);
framework.init('app/');
