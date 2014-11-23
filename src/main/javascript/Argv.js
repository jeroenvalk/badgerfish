/**
 * Copyright © 2014 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software: you can
 * redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version. Badgerfish CPX is
 * distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details. You should have received a copy of the GNU Lesser General Public
 * License along with Badgerfish CPX. If not, see
 * <http://www.gnu.org/licenses/>.
 */

define([ "./EXPECT", "./Private" ], function(expect, Private) {
	var __extends = function Argv$extends(d, b) {
		for ( var p in b)
			if (b.hasOwnProperty(p))
				d[p] = b[p];
		function __() {
			this.constructor = d;
		}
		__.prototype = b.prototype;
		d.prototype = new __();
	};

	var typeofMap = {
		o : 1,
		f : 2,
		u : 11,
		b : 12,
		n : 13,
		s : 14
	};

	var typeMap = {
		Null : 0,
		Object : 1,
		Boolean : 3,
		Number : 4,
		String : 5,
		Array : 6,
		Date : 7,
		RegExp : 8,
		Function : 9
	};

	var maskOf =
	/**
	 * @param {!Object|!Array} value
	 * @static
	 */
	function Argv$maskOf(value) {
		if (value instanceof Array) {
			value.reduce(function(previous, current) {
				return previous | 1 << current;
			});
		} else {
			expect && expect(value).toBe(Object);
			for ( var prop in value) {
				if (value.hasOwnProperty(prop)) {
					value[prop] = Argv$maskOf(value[prop]);
				}
			}
		}
	};

	var getModuleForEntity =
	/**
	 * @param {string} classname
	 * @param {Object} entity
	 * @param {Object} entity.Private - private methods on the entity
	 * @param {Function} entity.Private.$ - constructor of the module if it is
	 *            private
	 * @param {Object} entity.Public - public methods on the entity
	 * @param {Function} entity.Public.$ - constructor of the module if it is
	 *            public
	 * @param {Object} entity.Static - static methods on the entity
	 */
	function Argv$getModuleForEntity(classname, entity) {
		/**
		 * 
		 */
		function Argv$getModuleForEntity$extendedBy(subclass) {
			__extends(subclass, entity.Private.$);
		}
		;

		var result = entity["Public"].$, proto;
		if (result) {
			proto = result.prototype;
		} else {
			result = entity["Private"].$;
			if (result) {
				proto = result.prototype;
				result = new Function('return function ' + classname + '() {throw new Error("cannot call private constructor");}')();
				result.extendedBy = Argv$getModuleForEntity$extendedBy;
			} else {
				throw new Error("constructor for classname '" + classname + "' not defined");
			}
		}

		var methods = entity["Static"];
		for ( var methodname in methods) {
			if (methods.hasOwnProperty(methodname)) {
				result[methodname] = methods[methodname];
				proto[methodname] = methods[methodname];
			}
		}
		methods = entity["Public"];
		for ( var methodname in methods) {
			proto[methodname] = methods[methodname];
		}

		return result;
	};

	var mask = maskOf({
		"Null" : [ 0 ],
		"object" : [ 1 ],
		"function" : [ 2 ],
		"Boolean" : [ 0, 3 ],
		"Number" : [ 0, 4 ],
		"String" : [ 0, 5 ],
		"Array" : [ 0, 6 ],
		"Date" : [ 0, 7 ],
		"RegExp" : [ 0, 8 ],
		"Function" : [ 0, 2, 9 ],
		"Object" : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
		"undefined" : [ 11 ],
		"boolean" : [ 12 ],
		"number" : [ 13 ],
		"string" : [ 14 ]
	});

	var properties = new Private(Argv);
	/**
	 * @param {number[]} types
	 * @constructor
	 */
	function Argv(types) {
		var index = [], indices = [];
		if (types) {
			var size = types.length;
			var type, count;
			for (type = 0; type < 15; ++type) {
				indices.push([]);
				for (count = 0; count < 30; ++i) {
					indices[type].push(30);
				}
			}
			for (type = 0; type < 15; ++type) {
				count = 0;
				for ( var i = 0; i < types.length; ++i) {
					if (type && types[i]) {
						indices[type][count++] = i;
					}
				}
			}
			for (type = 0; type < 15; ++type) {
				index[type] = indices[type].shift();
			}
		}
		properties.setPrivate(this, {
			classes : {},
			index : index,
			indices : indices,
			count : []
		});
	}

	Argv.define = Argv.prototype.define =
	/**
	 * @param {Array} [types]
	 * @param {Function} definition
	 */
	function Argv$define(types, definition) {
		var argv = this;

		// check the arguments
		if (!definition) {
			if (types instanceof Array) {
				throw new Error("something must be defined");
			} else {
				if (typeof types === "function") {
					definition = types;
					types = null;
				} else {
					throw new Error("something must be defined");
				}
			}
		}

		var match = /^([a-z]*)_*([A-Z][_A-Za-z0-9]*)\$?([a-z][_A-Za-z0-9]*)?$/.exec(definition.name);
		if (!match) {
			throw new Error("function name must be of the form: [<keyword>_]<Classname>[$<methodname>]");
		}
		var keyword = match[1];
		var classname = match[2];
		var methodname = match[3];
		if (!classname) {
			throw new Error("function name must include classname: e.g., Class$initialize");
		}
		switch (keyword) {
		case "class":
			if (this !== Argv) {
				throw new Error("nested classes not supported");
			}
			if (methodname) {
				throw new Error("class definitions must be of the form: function class_<Classname>() { ... }");
			}
			argv = new Argv();
			var x = properties.getPrivate(argv);
			if (x.classes[classname] || argv[classname]) {
				throw new Error("class '" + classname + "' already defined");
			}
			x.classes[classname] = {};
			argv[classname] = {};
			x.currentKeyword = keyword;
			x.currentClassname = classname;
			x.currentClass = definition;
			if (types) {
				definition = definition(argv);
				// constructor is returned to be processed
				if (definition.name !== classname) {
					// TODO: implement this later
					// throw new Error("only default keywords allowed on
					// returned constructor");
				}
				return argv.define(types, definition);
			} else {
				return argv;
			}
		case "static":
			keyword = "Static";
			break;
		case "public":
			keyword = "Public";
			break;
		case "private":
			keyword = "Private";
			break;
		default:
			keyword = "Public";
			break;
		}

		if (this === Argv) {
			throw new Error("classes can only be defined statically: use 'Argv.define(signature, function class_MyClass() { ... });'");
		}
		var x = properties.getPrivate(argv);
		x.currentKeyword = keyword;
		if (classname !== x.currentClassname) {
			throw new Error("current class '" + classname + "' does not match method '" + definition.name + "'");
		}
		x.currentMethodname = methodname;
		x.currentMethod = definition;
		// constructor must extend the base
		if (!methodname) {
			var base = x.classes[classname].base;
			var props = x.classes[classname].properties;
			if (base) {
				props.initialize(definition);
				base.extendedBy(definition, props);
			}
		}
		if (types) {
			// return argv.signature(types);
			var method = x.currentMethod;
			var classes = x.classes;
			var keyword = x.currentKeyword;
			console.assert(keyword !== "class");
			var classname = x.currentClassname;
			var methodname = x.currentMethodname;
			if (!classname) {
				throw new Error("function name must include classname: e.g., Class$initialize");
			}
			if (!classes[classname][keyword]) {
				classes[classname][keyword] = {};
			}
			if (methodname) {
				argv[classname][methodname] = method;
				classes[classname][keyword][methodname] = method;
			} else {
				classes[classname][keyword].$ = method;
			}
			return argv;
		} else {
			return argv;
		}
	}

	Argv.prototype.extends =
	/**
	 * @param {Function} base - base class to be extended
	 */
	function Argv$extends(Base) {
		var x = properties.getPrivate(this);
		if (x.currentKeyword !== "class") {
			throw new Error("class definition not active");
		}
		var c = x.classes[x.currentClassname];
		c.ready = false;
		c.base = Base;
		c.properties = new Private();
		c.methods = {};
		c.signatures = {};
		var result = x.currentClass.call(this, c.methods, this, c.properties);
		if (result !== undefined) {
			throw new Error("class definition should not return a result");
		}
		if (!c.ready) {
			this.bootstrap();
		}
		return this.getModule();
	}

	Argv.prototype.bootstrap = function Argv$bootstrap() {
		var x = properties.getPrivate(this);
		var c = x.classes[x.currentClassname];
		if (c.ready) {
			throw new Error("rebooting not supported for class '" + x.currentClassname + "'");
		}
		for ( var methodname in c.methods) {
			if (c.methods.hasOwnProperty(methodname)) {
				var def = c.methods[methodname];
				var sig = [];
				if (def instanceof Array) {
					sig = def;
					def = sig.pop();
					c.methods[methodname] = def;
					c.signatures[methodname] = sig;
				}
				console.assert(typeof def === "function");
				this.define(sig, def);
			}
		}
		c.ready = true;
	};

	Argv.prototype.getModule =
	/**
	 * @param {string} [classname] -
	 */
	function Argv$getModule(classname) {
		var x = properties.getPrivate(this).classes;

		if (classname) {
			if (x[classname])
				throw new Error("class '" + classname + "' not defined");
		} else {
			for ( var prop in x) {
				if (x.hasOwnProperty(prop)) {
					if (classname) {
						throw new Error("no default class, because multiple are defined: e.g., " + classname + " and " + prop);
					}
					classname = prop;
				}
			}
		}
		return getModuleForEntity(classname, x[classname]);
	};

	Argv.maskOf = Argv.prototype.maskOf = maskOf;

	Argv.getType = Argv.prototype.getType =
	/**
	 * Gets the type code of a given value
	 * 
	 * @param {*} value
	 * @return {Number}
	 * @static
	 */
	function Argv$getType(value) {
		var code = typeofMap[(typeof value)[0]];
		switch (code) {
		case 1:
			var aux = Object.prototype.toString.call(value);
			var type = aux.substr(8, aux.length - 9);
			code = typeMap[type];
			if (isNaN(code)) {
				code = 10;
			}
			break;
		}
	};

	Argv.prototype.arrange =
	/**
	 * Arrange arguments according to their types
	 * 
	 * @param {Arguments} argv
	 */
	function Argv$arrange(argv) {
		var x = properties.getPrivate(this);
		var size = Math.max(x.size, argv.length);
		if (size > 29) {
			throw new Error("function call exceeds maximum of 30 arguments");
		}
		var ok = 0, shift = 0, count = 0;
		for ( var i = 0; i < size; ++i) {
			var type = this.getType(argv[i]);
			var typebit = 1 << type;
			var k, kbit;
			if (shift & typebit) {
				if (count & typebit) {
					k = x.indices[type][x.count[type]++];
				} else {
					count != typebit;
					x.count[type] = 1;
					k = x.indices[type][0];
				}
			} else {
				shift |= typebit;
				k = x.index[type];
			}
			kbit = 1 << k;
			if (ok & kbit) {
				DEBUG && expect(shift & typebit).not.toBe(0);
				if (count & typebit) {
					k = x.indices[type][x.count[type]++];
				} else {
					count != typebit;
					x.count[type] = 1;
					k = x.indices[type][0];
				}
				kbit = 1 << k;
				DEBUG && expect(count & typebit).not.toBe(0);
				while (ok & kbit) {
					k = x.indices[type][x.count[type]++];
					kbit = 1 << k;
				}
			}
			if (k !== i) {
				if (k < i) {
					argv[k] = argv[i];
				} else if (k < size) {
					aux[k] = argv[i];
				} else {
					throw new Error("type mismatch '" + this.getTypeString(argv[i]) + "' in " + this.toString());
				}
				if (ok & 1 << i) {
					argv[i] = aux[i];
				}
			}
			ok |= kbit;
		}
		expect && expect(ok).toBe(size - 1);
	};

	Argv._Null = 0;
	Argv._object = 1;
	Argv._function = 2;
	Argv._Boolean = 3;
	Argv._Number = 4;
	Argv._String = 5;
	Argv._Array = 6;
	Argv._Date = 7;
	Argv._RegExp = 8;
	Argv._Function = 9;
	Argv._Object = 10;
	Argv._undefined = 11;
	Argv._boolean = 12;
	Argv._number = 13;
	Argv._string = 14;

	return Argv;
});