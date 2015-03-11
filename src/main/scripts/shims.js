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

/* global document, is, Modernizr */

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
			Modernizr[name] = fn();
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

Modernizr.addTestWithShim("modernizr_load", function() {
	return is.fn(Modernizr.load);
}, function() {
	Modernizr.load = function Modernizr$load(entity) {
		if (entity.length) {
			Modernizr.load(entity.shift());
			Modernizr.load(entity);
		} else if (isNaN(entity.length)) {
			var script = document.createElement('script');
			script.setAttribute('type', 'application/javascript');
			if (entity.test) {
				script.setAttribute('src', entity.yep);
			} else {
				script.setAttribute('src', entity.nope);
			}
			document.body.appendChild(script);
		}
	};
});

Modernizr.addTestWithShim("function_name", function() {
	return function f() {
	}.name;
}, function() {
	// Fix Function#name on browsers that do not support it (IE) (Jürg Lehni):
	Object.defineProperty(Function.prototype, 'name', {
		get : function() {
			var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
			// For better performance only parse once, and then cache the
			// result through a new accessor for repeated access.
			Object.defineProperty(this, 'name', {
				value : name
			});
			return name;
		}
	});
});