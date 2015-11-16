/**
 * Copyright © 2015 dr. ir. Jeroen M. Valk
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

/* global document, is, requirejs, define, Modernizr, DEBUG, expect */
/* jshint -W030 */

// jshint ignore: start
if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}
// jshint ignore: end

// compatibility reference to the global scope
if (typeof global === 'object') {
	global.GLOBAL = global;
} else {
	this.GLOBAL = this;
}
GLOBAL.DEBUG = false;

function Modernizr$addTestWithShim(name, test, shim) {
	if (GLOBAL.Modernizr) {
		Modernizr.addTest(name, test);
	}
	var result = {
		test : GLOBAL.Modernizr ? Modernizr[name] : test(),
		nope : shim
	};
	if (shim instanceof Function) {
		delete result.nope;
		if (!result.test)
			shim();
	}
	return result;
}

Modernizr$addTestWithShim.call(null, "modernizr", function() {
	return GLOBAL.Modernizr;
}, function() {
	GLOBAL.Modernizr = {
		addTest : function Modernizr$addTest(name, fn) {
			Modernizr[name] = !!fn();
		}
	};
});

Modernizr$addTestWithShim.call(Modernizr, "modernizr_addTestWithShim", function() {
	return Modernizr.addTestWithShim;
}, function() {
	Modernizr.addTestWithShim = Modernizr$addTestWithShim;
});

Modernizr.addTestWithShim("is", function() {
	return GLOBAL.is;
}, function() {
	GLOBAL.is = {
		fn : function(fn) {
			// who cares about window.alert anyway?
			return typeof fn === 'function';
		}
	};
});

Modernizr.addTestWithShim("server", function() {
	return typeof global === "object";
}, function() {
	Object.defineProperty(GLOBAL, '__filename', {
		get : function() {
			var scripts = document.getElementsByTagName("script");
			var url = scripts[scripts.length - 1].src;
			return url.substr(url.indexOf("/", url.indexOf(":") + 3));
		}
	});
	Object.defineProperty(GLOBAL, '__dirname', {
		get : function() {
			return __filename.substr(0, __filename.lastIndexOf("/"));
		}
	});
});

Modernizr.addTestWithShim("requirejs", function() {
	return GLOBAL.requirejs && is.fn(requirejs.config);
}, function() {
	if (Modernizr.server) {
		GLOBAL.requirejs = function Modernizr$requirejs(deps, callback) {
			callback.apply(null, deps.map(function(dep) {
				return require(dep);
			}));
		};
	} else {
		GLOBAL.requirejs = GLOBAL.require = function Modernizr$require(dep) {
			var script = document.createElement('script');
			script.setAttribute('type', 'application/javascript');
			script.setAttribute('src', [ __dirname, dep ].join("/"));
			if (document.body) {
				document.body.appendChild(script);
			} else {
				document.head.appendChild(script);
			}
		};
	}
});

var deps = [], callbacks = [];
var _require = function Modernizr$require(dep) {
	if (dep instanceof Array) {
		dep.forEach(_require);
	} else {
		if (Modernizr.server) {
			var def = require("./" + dep);
			if (def.onModule) {
				GLOBAL.define.onModule = def.onModule;
				GLOBAL.define.dependencyMap = def.dependencyMap;
				GLOBAL.define.register = def.register;
				GLOBAL.define.classOf = def.classOf;
			}
		} else {
			deps.push("./" + dep);
		}
	}
};

Modernizr.ready = function Modernizr$ready(callback) {
	if (callbacks === null) {
		callback();
	} else {
		callbacks.push(callback);
	}
};

var _done = function Modernizr$done() {
	if (deps.length) {
		var currentDeps = deps.map(function(dep) {
			return Modernizr.baseUrl + 'src/main/scripts/' + dep;
		});
		deps.length = 0;
		require(currentDeps, _done);
	} else {
		callbacks.forEach(function(callback) {
			callback();
		});
	}
};

Modernizr.addTestWithShim("modernizr_load", function() {
	return is.fn(Modernizr.load);
}, function() {
	Modernizr.load = function Modernizr$load(entity) {
		if (entity.length) {
			Modernizr.load(entity.shift());
			Modernizr.load(entity);
		} else if (isNaN(entity.length)) {
			if (entity.test) {
				if (entity.yep)
					_require(entity.yep);
			} else {
				if (entity.nope)
					_require(entity.nope);
			}
		}
	};
});

Modernizr.addTest("karma", function() {
	return !!GLOBAL.__karma__;
});

Modernizr.addTest("testing", function() {
	return Modernizr.karma;
});

if (Modernizr.karma) {
	Modernizr.baseUrl = "/base/";
} else {
	Modernizr.baseUrl = "/";
}

if (Modernizr.testing) {
	GLOBAL.DEBUG = true;
}

Modernizr.addTest("function_name", function() {
	return function f() {
	}.name;
});

Modernizr.addTest("promise", function() {
	return !!GLOBAL.Promise;
});

var shift = Array.prototype.shift;
var _define = GLOBAL.define;
if (Modernizr.server) {
	var Module = require("module");
	var fn = Module._extensions['.js'];
	Module._extensions['.js'] = function(module) {
		_define = require("amdefine")(module);
		fn.apply(this, arguments);
	};
}

var predefined = {
	"module" : null,
	"chai.expect" : GLOBAL.chai ? GLOBAL.chai.expect : null
};

GLOBAL.define = function(deps, callback) {
	var predefs = [];
	var closure = function define$closure() {
		var module = shift.call(arguments);
		deps.shift();
		predefined.module = module;
		for (var i = 0; i < deps.length; ++i) {
			if (deps[i] === "module") {
				arguments[i] = predefined[predefs.shift()];
			}
		}
		var entity = callback.apply(null, arguments);
		if (is.fn(GLOBAL.define.onModule)) {
			define.moduleURI(module);
			GLOBAL.define.onModule(module, entity);
		}
		return entity;
	};

	if (deps instanceof Array) {
		if (is.fn(GLOBAL.define.dependencyMap)) {
			deps = deps.map(GLOBAL.define.dependencyMap);
		}
		deps = deps.map(function(dep) {
			if (predefined[dep] !== undefined) {
				predefs.push(dep);
				return "module";
			}
			return dep;
		});
		deps.forEach(function(dep) {
			if (dep.charAt(0) !== '/' && dep.indexOf(".js", dep.length - 3) > -1) {
				throw new Error("define: remove .js extension from: " + dep);
			}
		});
		deps.unshift("module");
		_define(deps, closure);
	} else if (is.fn(deps)) {
		callback = deps;
		deps = [ "module" ];
		_define(deps, closure);
	} else {
		_define.apply(null, arguments);
	}
};

define.moduleURI = function define$moduleURI(module) {
	if (!module.uri) {
		var filename = module.filename.replace(/\\/g, '/');
		if (filename.charAt(0) === '/')
			filename = filename.substr(1);
		DEBUG && expect(filename.charAt(0)).not.toBe('/');
		module.uri = [ 'file://', filename ].join('/');
	}
};

Modernizr.load({
	test : DEBUG,
	yep : "../../../node_modules/chai/chai.js"
});

Modernizr.load({
	test : Modernizr.server,
	yep : "serverOnly.js",
	nope : "clientOnly.js"
});

Modernizr.load({
	test : Modernizr.function_name,
	nope : "ieOnly.js"
});

Modernizr.classes = {};
Modernizr.load({
	test : true,
	yep : "../javascript/nl/agentsatwork/globals/Definition.js"
});

var currentDeps = deps.map(function(dep) {
	return Modernizr.baseUrl + 'src/main/scripts/' + dep;
});
deps.length = 0;
if (Modernizr.server) {
	_done();
} else {
	requirejs(currentDeps, function() {
		var definition = arguments[arguments.length - 1];
		if (Modernizr.promise || Modernizr.server) {
			GLOBAL.define.onModule = definition.onModule;
			GLOBAL.define.dependencyMap = definition.dependencyMap;
			GLOBAL.define.register = definition.register;
			GLOBAL.define.classOf = definition.classOf;
			_done();
		} else {
			requirejs([ Modernizr.baseUrl + 'src/main/javascript/nl/agentsatwork/globals/Promise.js' ], function(classPromise) {
				definition.register({
					'nl.agentsatwork.globals.Promise' : classPromise
				});
				GLOBAL.Promise = definition.classOf("Promise");
				GLOBAL.define.onModule = definition.onModule;
				GLOBAL.define.dependencyMap = definition.dependencyMap;
				GLOBAL.define.register = definition.register;
				GLOBAL.define.classOf = definition.classOf;
				_done();
			});
		}
	});
}

Modernizr.addTestWithShim("modernizr_xhr", function() {
	return is.fn(Modernizr.xhrForRef);
}, function() {
	Modernizr.xhrForRef = function Modernizr$xhrForRef(ref) {
		return new Promise(function(done) {
			var xhr, ext, i, j;
			i = ref.indexOf(".");
			if (i < 0)
				throw new Error("Definition: missing filename extension");
			while ((j = ref.indexOf(".", ++i)) >= 0)
				i = j;
			ext = ref.substr(--i);
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					switch (ext) {
					case ".xml":
						DEBUG && expect(xhr.getResponseHeader('content-type')).toBe("application/xml");
						break;
					default:
						break;
					}
					done(xhr);
				}
			};
			xhr.open("GET", ref, true);
			xhr.responseType = "msxml-document";
			xhr.send();
		});
	};
});
