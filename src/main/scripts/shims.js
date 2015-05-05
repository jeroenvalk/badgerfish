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

/* global document, is, requirejs, Modernizr */

// compatibility reference to the global scope
if (typeof global === 'object') {
	global.GLOBAL = global;
} else {
	this.GLOBAL = this;
}

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

Modernizr.addTest("requirejs", function() {
	return GLOBAL.requirejs && is.fn(requirejs.config);
});

Modernizr.addTest("karma", function() {
	return !!GLOBAL.__karma__;
});

var deps = [];
var _require = function Modernizr$require(dep) {
	if (dep instanceof Array) {
		dep.forEach(_require);
	} else {
		if (Modernizr.server) {
			require("./" + dep);
		} else {
			if (Modernizr.requirejs) {
				deps.push("./" + dep);
			} else {
				var script = document.createElement('script');
				script.setAttribute('type', 'application/javascript');
				script.setAttribute('src', [ __dirname, dep ].join("/"));
				if (document.body) {
					document.body.appendChild(script);
				} else {
					document.head.appendChild(script);
				}
			}
		}
	}
};

if (Modernizr.requirejs && !Modernizr.server && !Modernizr.karma) {
	Modernizr.done = function Modernizr$done() {
		require(deps.map(function(dep) {
			return '/scripts/' + dep;
		}), function() {

		});
	};
} else {
	if (Modernizr.karma) {
		Modernizr.done = function Modernizr$done() {
			Modernizr.required = deps;
		};
	} else {
		Modernizr.done = function Modernizr$done() {
		};
	}
}

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

Modernizr.addTest("function_name", function() {
	return function f() {
	}.name;
});

Modernizr.addTest("promise", function() {
	return !!GLOBAL.Promise;
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

Modernizr.load({
	test : true,
	yep : "../javascript/nl/agentsatwork/globals/Definition.js"
});

Modernizr.load({
	test : Modernizr.promise,
	nope : "../javascript/nl/agentsatwork/globals/Promise.js"
});

Modernizr.done();
