define([ "./Private", "./Argv" ], function(Private, Argv) {
	var properties;

	// conversions

	var parseXPath = function Path$parseXPath(path) {
		var result = [];
		for ( var i = 0; i < part.length; ++i) {
			switch (part[i]) {
				case "":
					result.push(Path.DESCENDANT);
					result.push("*");
					break;
				case ".":
					result.push(Path.SELF);
					result.push("*");
					break;
				case "..":
					result.push(Path.PARENT);
					result.push("*");
					break;
				default:
					var axis = Path.CHILD;
					var aux;
					if (part[i].charAt(0) === '@') {
						axis = Path.ATTRIBUTE;
						aux = [ part[i].substr(1) ];
					} else {
						aux = part[i].split("::");
					}
					switch (aux.length) {
						case 0:
							DEBUG && expect(true).toBe(false);
							break;
						case 1:
							aux = aux[0];
							break;
						case 2:
							switch (aux[0]) {
								case "ancestor":
									axis = Path.ANCESTOR;
									break;
								case "ancestor-or-self":
									axis = Path.ANCESTOR_OR_SELF;
									break;
								case "attribute":
									axis = Path.ATTRIBUTE;
									break;
								case "child":
									axis = Path.CHILD;
									break;
								case "descendant":
									axis = Path.DESCENDANT;
									break;
								case "descendant-or-self":
									axis = Path.DESCENDANT_OR_SELF;
									break;
								case "following":
									axis = Path.FOLLOWING;
									break;
								case "following-sibling":
									axis = Path.FOLLOWING_SIBLING;
									break;
								case "namespace":
									axis = Path.NAMESPACE;
									break;
								case "parent":
									axis = Path.PARENT;
									break;
								case "preceding":
									axis = Path.PRECEDING;
									break;
								case "preceding-sibling":
									axis = Path.PRECEDING_SIBLING;
									break;
								case "self":
									axis = Path.SELF;
									break;
								default:
									DEBUG && expect(true).toBe(false);
							}
							aux = aux[1];

					}
					var aux2 = parseInt(aux);
					if (!isNaN(aux2)) {
						result.push(aux2);
					} else {
						result.push(axis);
						result.push(aux);
					}
					break;
			}
		}
		return result;
	};

	var noJSONPath = function Path$noJSONPath(path) {
		if (path.indexOf("$.") === 0) {
			throw new Error("function does not support JSON Path format");
		}
	};

	return Argv.define([ "string", "Context" ], function(argv) {
		properties = new Private(Path);
		/**
		 * @param {string}
		 *            [path]
		 * @param {Context}
		 *            [context]
		 * @constructor
		 */
		function Path(path, context) {
			argv.arrange(arguments);
			properties.setPrivate(this, {});
			var x = properties.getPrivate(this);
			x.path = path.split("/");
		}

		argv.define([ "number" ],
		/**
		 * 
		 */
		function Path$toString(format) {

		});

		// utils (see NodeJS path http://nodejs.org/api/path.html)
		argv.define([ "string|Path" ],
		/**
		 * @param {string|Path}
		 *            path
		 * @return {Path} normalized path
		 */
		function static_Path$normalize(path) {
			noJSONPath(path);
			return new Path(pathNodeJS.normalize(path));
		});

		argv.define([],
		/**
		 * Normalize this path, taking care of '..' (parent-axis) and '.'
		 * (child-axis) parts.
		 * 
		 * @return {Path} normalized path
		 */
		function Path$normalize() {
			var path = this.toString();
		});

		Argv.define([],
		/**
		 * Join all arguments together and normalize the resulting path.
		 * 
		 * @param {...Path|string}
		 * 
		 * @return {Path} joined path
		 */
		function Path$join() {

		});

		function Path$resolve() {
		}
		function Path$relative() {
		}
		function Path$dirname() {
		}
		function Path$basename() {
		}
		function Path$extname() {
		}

		// axes
		Path.ANCESTOR = -10;
		Path.ANCESTOR_OR_SELF = -11;
		Path.ATTRIBUTE = -12;
		Path.CHILD = -13;
		Path.DESCENDANT = -14;
		Path.DESCENDANT_OR_SELF = -15;
		Path.FOLLOWING = -16;
		Path.FOLLOWING_SIBLING = -17;
		Path.NAMESPACE = -18;
		Path.PARENT = -19;
		Path.PRECEDING = -20;
		Path.PRECEDING_SIBLING = -21;
		Path.SELF = -22;

		// formats
		Path.XPATH = -100;
		Path.JSONPATH = -101;

		return Path;
	}).getModule();
});
