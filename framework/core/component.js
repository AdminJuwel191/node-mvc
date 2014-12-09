"use strict";
/* global loader: true, Type: true, CacheInterface: true, MemoryCache: true */
var di = require('../di'),
    error = di.load('error'),
    core = di.load('core'),
    Type = di.load('typejs'),
    ComponentInterface = di.load('interface/component'),
    Component;
/**
 * @license Mit Licence 2014
 * @since 0.0.1
 * @author Igor Ivanovic
 * @name Component
 *
 * @constructor
 * @description
 * Component
 */
Component = ComponentInterface.inherit({}, {
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method _construct
     *
     * @description
     * Construct
     */
    _construct: function Component_construct() {
        try {
            this.dependency = JSON.parse(di.readFileSync(__dirname + '/component.json'));
        } catch (e) {
            throw new error.Exception('Component.construct: problem with loading dependency file', e);
        }
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Initialize#getDependency
     *
     * @description
     * Initialize
     * @return {object}
     */
    getDependency: function Component_getDependency(key) {
        if (this.dependency.hasOwnProperty(key)) {
            return core.copy(this.dependency[key]);
        }
        return false;
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Initialize#findComponent
     *
     * @description
     * Find component
     */
    find: function Component_find(name, components) {
        return components.filter(function (item) {
            return item.name === name;
        }).shift();
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Initialize#components
     *
     * @description
     * Initialize
     */
    init: function Component_init(components) {
        var component, data, deps, depsName, depsConfig;
        if (!Type.isArray(components)) {
            throw new error.Exception('Component.init: components argument must be array type');
        }
        data = core.copy(components); // copy

        while (true) {
            component = data.shift();
            if (!component) {
                break;
            }
            if (Type.assert(Type.STRING, component.name)) {
                deps = this.getDependency(component.name);
                if (Type.isArray(deps)) {
                    while (true) {
                        depsName = deps.shift();
                        if (!depsName) {
                            break;
                        }
                        if (!this.has(depsName)) {
                            depsConfig = this.find(depsName, components);
                            if (depsConfig) {
                                this.set(depsName, depsConfig);
                            } else {
                                this.set(depsName, {});
                            }
                        }
                    }
                }
                this.set(component.name, component);
            }
        }
    },

    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Component#set
     *
     * @description
     * Set component to system
     */
    set: function Component_set(name, config, Func) {
        if (!this.has(name)) {
            try {
                if (!Type.isFunction(Func)) {
                    if (config.filePath) {
                        Func = di.load(config.filePath);
                    } else {
                        Func = di.load(name);
                    }
                }
                this.components[name] = new Func(config);
            } catch (e) {
                throw new error.Exception('Component "' + name + '" is not initialized', e);
            }
        } else {
            throw new error.DataError(config, 'Component "' + name + '" already exist in system');
        }
        return this.get(name);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Component#has
     *
     * @description
     * Has component
     */
    has: function (name) {
        return this.components.hasOwnProperty(name);
    },
    /**
     * @since 0.0.1
     * @author Igor Ivanovic
     * @method Component#get
     *
     * @description
     * Get component from system
     */
    get: function Component_get(name) {
        if (this.has(name)) {
            return this.components[name];
        }
        throw new error.DataError({name: name}, 'Component "' + name + '" is not registered in system');
    }
});

module.exports = new Component;