/**
 * Copyright © 2014, 2015 dr. ir. Jeroen M. Valk
 * 
 * This file is part of ComPosiX. ComPosiX is free software: you can
 * redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 * 
 * ComPosiX is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with ComPosiX. If not, see <http://www.gnu.org/licenses/>.
 */

// jshint ignore: start
if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}
// jshint ignore: end
/* global define, DEBUG, expect */
/* jshint -W030 */
define([ "module" ], function(module) {
	"use strict";
	GLOBAL.DEBUG = false;

	var shift = Array.prototype.shift;

	function isFunction(value) {
		return typeof value === 'function';
	}

	function isClass(value) {
		return (isFunction(value) && !value.name.lastIndexOf("class", 0));
	}

	function moduleURI(module) {
		if (!module.uri) {
			var filename = module.filename.replace(/\\/g, '/');
			if (filename.charAt(0) === '/')
				filename = filename.substr(1);
			DEBUG && expect(filename.charAt(0)).not.toBe('/');
			module.uri = [ 'file://', filename ].join('/');
		}
	}

	var getPrivate, defaultPackage = "nl.agentsatwork.globals", plugin, state = {
		classdef : {},
		classes : {}
	};
	moduleURI(module);
	var searchpath, prefix = module.uri.substr(0, module.uri.indexOf("nl/agentsatwork/globals/Definition"));
	if (prefix === "/javascript/") {
		searchpath = [ prefix ];
	} else {
		searchpath = [ prefix.replace("/main/", "/test/"), prefix ];
		if (!prefix.lastIndexOf("file://", 0) && prefix.indexOf("/node_modules/ComPosiX/") > 0) {
			// NodeJS module
			prefix = prefix.replace("/node_modules/ComPosiX/", "/");
			searchpath.push(prefix.replace("/main/", "/test/"));
			searchpath.push(prefix);
		}
	}

	// API

	var definition =
	/**
	 * @param {Object}
	 *            classdef
	 */
	function definition(classdef) {
		if (this instanceof definition) {
			throw new Error("definition: calling as constructor prohibited");
		}
		if (!(classdef instanceof Object)) {
			throw new Error("definition: required object mapping qualified names into class definition functions");
		}
		for ( var qname in classdef) {
			if (classdef.hasOwnProperty(qname)) {
				if (state.classdef[qname]) {
					console.warn("definition: " + qname + ": to be defined only once");
				} else {
					state.classdef[qname] = classdef[qname];
				}
			}
		}
		if (definition.define) {
			definition.define.apply(null, Array.prototype.slice.call(arguments));
		}
	};

	var definitionOf =
	/**
	 * @param {string}
	 *            chain - inheritance chain
	 * @returns {Definition} definition instance of class specified by chain
	 * 
	 * @private
	 */
	function define$definitionOf(chain) {
		if (!chain) {
			throw new Error("definition.classOf: empty inheritance chain");
		}
		var pkgname = defaultPackage;
		var classes, current = state.classes;
		var isPlugin = false, base = state.classes.Object['@'];
		if (!(chain instanceof Array)) {
			chain = chain.split(":");
		}
		chain.forEach(function(qname, index) {
			if (isClass(qname)) {
				qname = qname.qname;
			}
			classes = current;
			var dot = qname.lastIndexOf(".");
			if (dot < 0) {
				dot = 0;
			} else {
				if (qname.indexOf(pkgname) === 0) {
					qname = qname.substr(++dot);
					dot = 0;
				} else {
					pkgname = qname.substr(0, dot++);
				}
			}
			if (qname.length - dot === 10 && qname.indexOf("Definition", dot) === dot && pkgname === "nl.agentsatwork.globals") {
				if (index === 0) {
					isPlugin = true;
					current = classes[qname];
					base = current['@'];
					return;
				}
				throw new Error("definition.classOf: Definition cannot extend anything");
			}
			current = classes[qname];
			if (!current) {
				var classname = qname.substr(dot);
				var fullname = [ pkgname, classname ].join(".");
				var classdef = state.classdef[fullname];
				if (!classdef) {
					throw new Error("definition.classOf: " + fullname + ": not found");
				}
				var result;
				if (isPlugin) {
					result = base.createDefinition(fullname);
					plugin.unshift(result);
				} else {
					for (var i = 0; i < plugin.length; ++i) {
						result = plugin[i].createDefinition(fullname);
						if (result)
							break;
					}
				}
				if (index === 0) {
					var x = getPrivate.call(result);
					if (x.state >= Definition.prototype.State.BASED) {
						base = x.base;
					}
				}
				current = {
					'@' : result.extends(base)
				};
				classes[qname] = current;
			}
			base = current['@'];
		});
		return base;
	};

	function bootstrap(callback) {
		return function closure() {
			var module = shift.call(arguments);
			var fn = callback.apply(null, arguments);
			if (isClass(fn)) {
				moduleURI(module);
				var offset = 0, uri = module.uri;
				for (var i = 0; i < searchpath.length; ++i) {
					if (!uri.lastIndexOf(searchpath[i], 0)) {
						offset = searchpath[i].length;
					}
				}
				var qname = uri.substring(offset, uri.lastIndexOf(".")).replace(/\//g, ".");
				if (!offset) {
					qname = '@' + qname;
				}
				var classdef = {};
				classdef[qname] = fn;
				fn.qname = qname;
				definition(classdef);
				definitionOf(qname);
			}
			return fn;
		};
	}

	var _define = GLOBAL.define;
	var current = null;
	if (!_define) {
		var Module = require("module");
		var fn = Module._extensions['.js'];
		Module._extensions['.js'] = function(module) {
			current = module;
			fn.apply(this, arguments);
		};
	}
	GLOBAL.define = function(deps, callback) {
		if (current) {
			if (deps instanceof Array) {
				deps = deps.map(function(dep) {
					if (!dep.lastIndexOf('javascript/')) {
						dep = process.cwd() + '/src/main/' + dep + ".js";
					}
					return dep;
				});
			}
			_define = require("amdefine")(current);
			current = null;
		}
		if (deps instanceof Array) {
			deps.forEach(function(dep) {
				if (dep.charAt(0) !== '/' && dep.indexOf(".js", dep.length - 3) > -1) {
					throw new Error("define: remove .js extension from: " + dep);
				}
			});
			deps.unshift("module");
			_define(deps, bootstrap(callback));
		} else if (isFunction(deps)) {
			_define([ "module" ], bootstrap(deps));
		} else {
			_define.apply(null, arguments);
		}
	};

	GLOBAL.define.classOf = definition.classOf =
	/**
	 * @param {string}
	 *            chain - inheritance chain
	 * @returns {Function} constructor of class specified by chain
	 */
	function define$classOf(chain) {
		if (plugin instanceof Array) {
			return definitionOf(chain).getConstructor();
		}
		throw new Error("definition.classOf: not yet configured");
	};

	definition.configure =
	/**
	 * 
	 */
	function definition$configure() {
		if (plugin) {
			throw new Error("definition: configure to be called only once");
		}
		var root = new Definition('nl.agentsatwork.globals.Definition');
		state.classes.Definition = {
			'@' : root
		};
		state.classes.Object = {
			'@' : new Definition('nl.agentsatwork.globals.Object')
		};
		plugin = [ root ];
	};

	// class Definition

	var properties = [], promise, initialize, define;

	/**
	 * nl.agentsatwork.globals.Definition
	 * 
	 * @param {string}
	 *            qname - fully qualified classname
	 * 
	 * @private
	 * @constructor
	 */
	function Definition(qname) {
		DEBUG && expect(this instanceof Definition).toBe(true);
		var at = properties.length;

		function Definition$at() {
			return at;
		}

		this['@'] = Definition$at;
		var x = {
			'@' : Definition$at,
			qname : qname,
			proto : {}
		};
		properties.push(x);

		if (qname.lastIndexOf('nl.agentsatwork.globals.', 0)) {
			this.onStateChange(this.State.CREATED);
		} else {
			var index = qname.lastIndexOf('.');
			var classname = qname.substr(++index);
			if (classname === 'Definition') {
				x.proto = Definition.prototype;
				this.onStateChange(this.State.DEFINED);
			} else {
				if (state.classdef[qname]) {
					this.onStateChange(this.State.CREATED);
				} else {
					x.proto = GLOBAL[classname].prototype;
					this.onStateChange(this.State.DEFINED);
				}
			}
		}
	}

	Definition.prototype.import = function Definition$import(chain) {
		return GLOBAL.define.classOf(chain);
	};

	Definition.prototype.createDefinition =
	/**
	 * @param {Object}
	 *            config
	 * @returns {Definition}
	 */
	function Definition$createDefinition(qname) {
		var Constructor = this.getPrototype(0).constructor;
		return new Constructor(qname);
	};

	Definition.prototype.onStateChange =
	/**
	 * Called on any state change.
	 */
	function Definition$onStateChange(state) {
		var x = getPrivate.call(this);
		x.state = state;
		switch (state) {
		case this.State.CREATED:
			initialize.call(this, x);
			if (x.base) {
				this.onStateChange(this.State.BASED);
			} else {
				this.onStateChange(this.State.INITIALIZED);
			}
			break;
		case this.State.INITIALIZED:
			DEBUG && expect(x.base).toBeUndefined();
			break;
		case this.State.BASED:
			define.call(this, x);
			this.onStateChange(this.State.DEFINED);
			break;
		}
	};

	Definition.prototype.extends =
	/**
	 * @param {Array}
	 *            chain - to be extended by this definition
	 * @returns {Definition} this definition for method chaining
	 */
	function Definition$extends(chain) {
		var x = getPrivate.call(this);
		if (chain instanceof Array) {
			chain = definitionOf(chain);
		}
		if (chain === Object || chain instanceof Definition) {
			DEBUG && expect(chain === Object || chain instanceof Definition).toBe(true);
			switch (x.state) {
			case this.State.CREATED:
				break;
			case this.State.INITIALIZED:
				x.base = chain;
				this.onStateChange(this.State.BASED);
				return this;
			default:
				if (x.base !== chain)
					throw new Error("Definition.extend: " + x.qname + ": only one base can be extended");
			}
			x.base = chain;
			return this;
		} else {
			throw new Error("Definition.extend: " + x.qname + ": specify inheritance chain as an array");
		}
	};

	Definition.prototype.getPrototype = function Definition$getPrototype(depth) {
		if (!depth) {
			return getPrivate.call(this).proto;
		} else {
			return getPrivate.call(this).base.getPrototype(--depth);
		}
	};

	Definition.prototype._getBase =
	/**
	 * @returns {Function}
	 */
	function Definition$getBase(forced) {
		var base = getPrivate.call(this).base;
		if (base instanceof Definition) {
			return base.getConstructor(forced);
		}
		return base;
	};

	Definition.prototype.getConstructor =
	/**
	 * @returns {Function}
	 */
	function Definition$getConstructor(forced) {
		var x = getPrivate.call(this);
		switch (x.state) {
		case this.State.CREATED:
		case this.State.INITIALIZED:
			throw new Error("Definition.getConstructor: class must at least be based");
		case this.State.BASED:
			if (!forced)
				throw new Error("Definition.getConstructor: class not yet defined");
			/* falls through */
		default:
			if (x.proto) {
				if (x.proto.hasOwnProperty("constructor")) {
					return x.proto.constructor;
				} else {
					throw new Error("Definition$getConstructor: " + x.qname + ": missing constructor");
				}
			} else {
				DEBUG && expect(x.qname).toBe('nl.agentsatwork.globals.Definition');
				return Definition;
			}
		}
	};

	Definition.prototype.setPrivate =
	/**
	 * Method for setting the private properties on an instance; typically a
	 * plugin that provides more advanced encapsulation overrides this method.
	 * 
	 * @param {Object}
	 *            self - instance for which to get private properties
	 * @param {Object}
	 *            object - object of private properties
	 */
	function Definition$setPrivate(self, object) {
		var x = getPrivate.call(this);
		if (!self.properties) {
			self.properties = {};
		}
		if (self.properties[x.classname]) {
			throw new Error("Definition: " + x.classname + ": private properties to be set only once");
		}
		self.properties[x.classname] = object;
	};

	Definition.prototype.getPrivate =
	/**
	 * Method for getting the private properties on an instance; typically a
	 * plugin that provides more advanced encapsulation overrides this method.
	 * 
	 * @param {Object}
	 *            self - instance for which to get private properties
	 * @returns {Object} private properties
	 */
	function Definition$getPrivate(self) {
		var x = getPrivate.call(this);
		return self.properties[x.classname];
	};

	getPrivate =
	/**
	 * @private
	 */
	function Definition$getPrivate() {
		var x = properties[this['@']()];
		if (x['@'] !== this['@']) {
			throw new Error("Definition: original @-function overwritten");
		}
		return x;
	};

	promise =
	/**
	 * @private
	 */
	function Definition$promise(value) {
		function definition$promise$done(callback) {
			callback.call(null, value);
			return value;
		}
		return {
			done : definition$promise$done
		};
	};

	initialize =
	/**
	 * @param {Function}
	 *            definition
	 * @private
	 */
	function Definition$initialize(x) {
		DEBUG && expect(x.state).toBe(this.State.CREATED);
		var classdef = state.classdef[x.qname];
		x.result = classdef.call(x.proto, this);
	};

	define =
	/**
	 * Called when definition function has been called. Results have been
	 * collected in the private properties.
	 * 
	 * @private
	 */
	function Definition$define(x) {
		var prototype = x.proto;
		if (!prototype.hasOwnProperty("constructor")) {
			var index = x.qname.lastIndexOf(".");
			prototype.constructor = {
				name : x.qname.substr(++index)
			};
		}
		var Constructor = prototype.constructor;
		Constructor.prototype = prototype;
		// jshint ignore: start
		var y = getPrivate.call(x.base);
		if (Object.setPrototypeOf) {
			Object.setPrototypeOf(prototype, y.proto);
			Object.setPrototypeOf(Constructor, y.proto.constructor);
		} else {
			prototype.__proto__ = y.proto;
			Constructor.__proto__ = y.proto.constructor;
		}
		// jshint ignore: end
		var methods = state.classdef[x.qname];
		var prop;
		for (prop in methods) {
			if (Constructor[prop] === undefined && methods.hasOwnProperty(prop)) {
				Constructor[prop] = methods[prop];
			}
		}
		if (Constructor.initialize) {
			Constructor.initialize();
		}
	};

	Definition.prototype.State = {
		CREATED : 0,
		INITIALIZED : 1,
		BASED : 2,
		DEFINED : 3
	};

	definition.configure(module.config ? module.config() : {});

	return definition;
});
