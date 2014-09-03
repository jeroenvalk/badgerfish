define([ "./Private" ], function(Private) {
	var properties = new Private(Argv);

	function Argv(args) {
		properties.setPrivate(this, {
			classes : {}
		});
	}

	Argv.define = Argv.prototype.define =
	/**
	 * @param {Array}
	 *            types
	 * @param {Function}
	 *            definition
	 */
	function Argv$define(types, definition) {
		var argv = this;
		if (argv === Argv) {
			argv = new Argv();
		}
		var method = definition;
		if (method.name === "") {
			method = definition(argv);
		}
		if (!method) {
			throw new Error("something must be defined");
		}
		var x = properties.getPrivate(argv).classes;
		var match = /^([a-z]*)_*([A-Z][_A-Za-z0-9]*)\$?([a-z][_A-Za-z0-9]*)?$/.exec(method.name);
		if (!match) {
			throw new Error("function name must be of the form: [<keyword>_]<Classname>[$<methodname>]");
		}
		var keyword = match[1];
		var classname = match[2];
		var methodname = match[3];
		switch (keyword) {
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
		if (!classname) {
			throw new Error("function name must include classname: e.g., Class$initialize");
		}
		if (!x[classname]) {
			x[classname] = {};
		}
		if (!x[classname][keyword]) {
			x[classname][keyword] = {};
		}
		if (methodname) {
			x[classname][keyword][methodname] = method;
		} else {
			x[classname][keyword].$ = method;
		}
		return argv;
	};

	Argv.prototype.getModule =
	/**
	 * @param {string}
	 *            [classname] -
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
		if (x[classname]["Public"].$) {
			module = x[classname]["Public"].$;
		} else if (x[classname]["Private"].$) {
			module = new Function('return function ' + classname + '() {throw new Error("cannot call private constructor");}')();
		} else {
			throw new Error("constructor for classname '" + classname + "' not defined");
		}
		for ( var methodname in x[classname]["Public"]) {
			module.prototype[methodname] = x[classname]["Public"][methodname];
		}
		return module;
	};

	Argv.prototype.arrange =
	/**
	 * 
	 */
	function Argv$arrange() {

	};

	return Argv;
});