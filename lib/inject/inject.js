/** @license MIT License (c) copyright Markus Kobler - https://github.com/markuskobler/injector */
goog.provide('inject');
goog.provide('inject.createInjector');
goog.provide('inject.Injector');
goog.provide('inject.Binder');
goog.provide('inject.Binding');
goog.provide('inject.Scope');

goog.require('goog.iter');

goog.scope(function () {
  "use strict";

  var bind          = goog.bind,
    isArrayLike     = goog.isArrayLike,
    isFunction      = goog.isFunction,
    forEach         = goog.iter.forEach;

  /**
   * @param {Function} ctor
   * @param {Array|Function|Object} meta
   */
  inject = function (ctor, meta) {
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
   * @return {!inject.Injector}
   */
  inject.createInjector = function (var_args) {
    var args   = isArrayLike(var_args) ? var_args : arguments,
      binder = new inject.Binder();

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
  inject.Injector = function () {};

  /**
   * @param {string|Function} type
   * @return {*}
   */
  inject.Injector.prototype.getInstance = function (type) {};


  /* --------------------------------------------------------------------------------------------------------------- */

  /** @interface */
  inject.Scope = function () {};

  /**
   * @param {*} type
   * @param {Function} unscoped
   * @return {Function}
   */
  inject.Scope.prototype.scope = function (type, unscoped) {};


  /* --------------------------------------------------------------------------------------------------------------- */


  /**
   * @constructor
   * @implements {inject.Scope}
   */
  inject.SingletonScope = function () {

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
  inject.Binding = function (key, provider) {

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
   * @return {inject.Binding}
   */
  inject.Binding.prototype.to = function (provider) {
    this.provider_ = isFunction(provider) ? provider : function () {
      return provider;
    };
    return this;
  };

  /**
   * @param {inject.Scope} scoped
   * @return {inject.Binding}
   */
  inject.Binding.prototype.inScope = function (scoped) {
    this.provider_ = scoped.scope(this.key_, this.provider_);
    return this;
  };

  /**
   * @return {inject.Binding}
   */
  inject.Binding.prototype.inSingleton = function () {
    this.inScope(new inject.SingletonScope());
    return this;
  };

  /** @return {*} */
  inject.Binding.prototype.get = function () {
    return this.provider_();
  };


  /* --------------------------------------------------------------------------------------------------------------- */

  /**
   * @constructor
   * @implements {inject.Injector}
   */
  inject.Binder = function () {

    /**
     * @type {!Object}
     * @private
     */
    this.bindings_ = {};


    this.bind(inject.Injector).to(this).inSingleton();
  };

  /**
   * @param {*} type
   * @return {inject.Binding};
   */
  inject.Binder.prototype.bind = function (type) {
    var binding = new inject.Binding(type, bind(this.createInstance, this, type));
    this.bindings_[type] = binding;
    return binding;
  };

  /**
   * @param {Function} Ctor
   * @protected
   * @return {*}
   */
  inject.Binder.prototype.createInstance = function (Ctor) {
    if (!!Ctor.__inject) {
      if (isFunction(Ctor.__inject.factory)) {
        return Ctor.__inject.factory(this);
      } else {
        var args = [],
            errors = [];
        forEach(Ctor.__inject.args, function (arg) {
          try {
            args.push(this.getInstance(arg));
          } catch (err) {
            errors.push(err);
          }
        }, this);
        if( errors.length > 0 ) {
            throw new Error(errors);
        }
        var inst = inject.Binder.extendInjector_(Ctor);
        var result = Ctor.apply(inst, args);
        return Object(result) === result ? result : inst;
      }
    } else {
      return new Ctor();
    }
  };

  /**
   * @param {Function} Ctor
   * @private
   * @return {*}
   */
  inject.Binder.extendInjector_ = function(Ctor) {
    /** @constructor */
    function Injected() {}
    Injected.prototype = Ctor.prototype;
    return new Injected();
  };

  /** @return {inject.Binding} */
  inject.Binder.prototype.getBinding = function (type) {
    return this.bindings_[type];
  };

  /** @override */
  inject.Binder.prototype.getInstance = function (type) {
    if (!type) return null;

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
