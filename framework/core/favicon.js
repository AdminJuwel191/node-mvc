/**
 * Created by igi on 03/12/14.
 */
var di = require('../di'),
    Type = di.load('typejs'),
    Favicon;


Favicon = Type.create({}, {
    _construct: function() {

    }
});


module.exports =  Favicon;