"use strict";
/* global loader: true, Type: true, Controller: true */
var di = require('../di'),
    Type = di.load('typejs'),
    component = di.load('core/component'),
    view = di.load('core/view'),
    ControllerInterface = di.load('interface/controller'),
    Controller;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Controller
 *
 * @constructor
 * @description
 * Controller is a collection of Controller
 */
Controller = ControllerInterface.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#onEnd
     *
     * @description
     * On end
     */
    createUrl: function Controller_createUrl(route, params) {
        return this._request.createUrl(route, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#onEnd
     *
     * @description
     * On end
     */
    onEnd: function Controller_onEnd(callback) {
        return this._request.onEnd(callback);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#addHeader
     *
     * @description
     * Add header to request
     */
    addHeader: function Controller_addHeader(key, value) {
        return this._request.addHeader(key, value);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#forward
     *
     * @description
     * Redirect to some url
     */
    forward: function Controller_forward(route, params) {
        return this._request.forward(route, params);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#redirect
     *
     * @description
     * Redirect to some url
     */
    redirect: function Controller_redirect(url, isTemp) {
        return this._request.redirect(url, isTemp);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#hasAction
     *
     * @description
     * Check if controller have action
     */
    hasAction: function Controller_hasAction(name) {
        return (name in this);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#renderFile
     *
     * @description
     * Render file
     */
    renderFile: function Controller_renderFile(pathName, locals) {
        return view.renderFile(pathName, locals);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#render
     *
     * @description
     * Render view
     */
    render: function Controller_render(source, locals, escape) {
        return view.render(source, locals, escape);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Controller#getAction
     *
     * @description
     * Get controller action
     */
    getAction: function Controller_getAction(name) {
        if (Type.isFunction(this[name])) {
            return this[name];
        }
        return false;
    }
});


// export Controller class
module.exports = Controller;
