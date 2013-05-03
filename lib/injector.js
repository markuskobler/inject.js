/** @license MIT License (c) copyright Markus Kobler */

goog.provide('injector');
goog.provide('injector.inject');
goog.provide('injector.createInjector');

goog.provide('injector.Injector');
goog.provide('injector.Binder');
goog.provide('injector.Binding');
goog.provide('injector.Scope');

goog.scope(function () {

    var bind            = goog.bind,
        isArrayLike     = goog.isArrayLike,
        isFunction      = goog.isFunction,
        isDefAndNotNull = goog.isDefAndNotNull,
        forEach         = goog.iter.forEach;

//    TODO look at how would also work with node
//    function injector () {
//        return injector.inject.apply(arguments);
//    }

    /**
     * @param {Function} ctor
     * @param {Array|Function|Object} meta
     */
    injector.inject = function (ctor, meta) {
        var inject;
        if (isArrayLike(meta)) {
            inject = {args: meta};
        } else if (isFunction(meta)) {
            inject = {factory: meta};
        } else {
            inject = meta;
        }
        ctor.__inject = inject;
    };


    /**
     * @param {...Function|Array.<Function>} var_args modules used to configure binder
     * @constructor
     * @return {!injector.Injector}
     */
    injector.createInjector = function (var_args) {
        var args   = isArrayLike(var_args) ? var_args : arguments,
            binder = new injector.Binder();

        for (var i = 0, len = args.length; i < len; ++i) {
            var module = args[i];
            if (isFunction(module)) {
                module(binder);
            } else {
                throw new Error("Invalid module! Must be a function");
            }
        }
        return binder;
    };


    /* --------------------------------------------------------------------------------------------------------------- */

    /** @interface */
    injector.Injector = function () {};

    /**
     * @param {string|Function} type
     * @return {*}
     */
    injector.Injector.prototype.getInstance = function (type) {};


    /* --------------------------------------------------------------------------------------------------------------- */

    /** @interface */
    injector.Scope = function () {};

    /**
     * @param {*} type
     * @param {Function} unscoped
     * @return {Function}
     */
    injector.Scope.prototype.scope = function (type, unscoped) {};


    /* --------------------------------------------------------------------------------------------------------------- */


    /**
     * @constructor
     * @implements {injector.Scope}
     */
    injector.SingletonScope = function () {

        var instance = null;

        /** @override */
        this.scope = function (type, unscoped) {
            return function () {
                return instance || (instance = unscoped());
            };
        };
    };

    /* --------------------------------------------------------------------------------------------------------------- */

    /**
     * @param {*} key
     * @param {Function} provider
     * @constructor
     */
    injector.Binding = function (key, provider) {

        /**
         * @type {*}
         * @private
         */
        this.key_ = key;

        /**
         * @type {Function}
         * @private
         */
        this.provider_ = provider;
    };

    /**
     * @param {Function|Object|string|number|boolean} provider
     * @return {injector.Binding}
     */
    injector.Binding.prototype.to = function (provider) {
        this.provider_ = isFunction(provider) ? provider : function () {
            return provider;
        };
        return this;
    };

    /**
     * @param {injector.Scope} scoped
     * @return {injector.Binding}
     */
    injector.Binding.prototype.inScope = function (scoped) {
        this.provider_ = scoped.scope(this.key_, this.provider_);
        return this;
    };

    /**
     * @return {injector.Binding}
     */
    injector.Binding.prototype.inSingleton = function () {
        this.inScope(new injector.SingletonScope());
        return this;
    };

    /** @return {*} */
    injector.Binding.prototype.get = function () {
        return this.provider_();
    };


    /* --------------------------------------------------------------------------------------------------------------- */

    /**
     * @constructor
     * @implements {injector.Injector}
     */
    injector.Binder = function () {

        /**
         * @type {!Object}
         * @private
         */
        this.bindings_ = {};


        this.bind(injector.Injector).to(this).inSingleton();
    };

    /**
     * @param {*} type
     * @return {injector.Binding};
     */
    injector.Binder.prototype.bind = function (type) {
        var binding = new injector.Binding(type, bind(this.createInstance, this, type));
        this.bindings_[type] = binding;
        return binding;
    };

    /**
     * @param {Function} fn
     * @protected
     * @return {*}
     */
    injector.Binder.prototype.createInstance = function (fn) {
        if (fn.__inject) {
            if (isFunction(fn.__inject.factory)) {
                return fn.__inject.factory(this);
            } else {
                var args = [];
                forEach(fn.__inject.args, function (arg) {
                    try {
                        args.push(this.getInstance(arg));
                    } catch (err) {
                        console.log(err);
                    }
                }, this);

                /** @constructor */
                function Injected() {}
                Injected.prototype = fn.prototype;
                var inst = new Injected();
                var result = fn.apply(inst, args);
                return Object(result) === result ? result : inst;
            }
        } else {
            return new fn();
        }
    };

    /** @return {injector.Binding} */
    injector.Binder.prototype.getBinding = function (type) {
        return this.bindings_[type];
    };

    /** @override */
    injector.Binder.prototype.getInstance = function (type) {
        if (!isDefAndNotNull(type)) return null;

        var binding = this.getBinding(type);
        if (!!binding) {
            return binding.get();
        } else if (isFunction(type)) {
            return this.createInstance(type);
        } else {
            throw new Error("Type '" + type + "' not bound!");
        }
    };

});