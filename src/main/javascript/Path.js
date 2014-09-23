define([ "./Private", "./Argv", "dist/path" ], function(Private, Argv, parser) {
	var properties;

	var type = {
		GLOB_ABSOLUTE : 0,
		GLOB_RELATIVE : 1,
		XPATH_ABSOLUTE : 2,
		XPATH_RELATIVE : 3,
		JPATH_ABSOLUTE : 4,
		JPATH_RELATIVE : 5
	};

	var axis = {
		ANCESTOR : -10,
		ANCESTOR_OR_SELF : -11,
		ATTRIBUTE : -12,
		CHILD : -13,
		DESCENDANT : -14,
		DESCENDANT_OR_SELF : -15,
		FOLLOWING : -16,
		FOLLOWING_SIBLING : -17,
		NAMESPACE : -18,
		PARENT : -19,
		PRECEDING : -20,
		PRECEDING_SIBLING : -21,
		SELF : -22
	};

	parser.yy = {
		parseError : function Path$parseError(str) {
			throw new Error(str);
		},
		Type : type,
		Axis : axis
	};

	return Argv.define([ "string", "Context" ], function(argv) {
		properties = new Private(Path);
		/**
		 * @param {string} [path]
		 * @param {Context} [context]
		 * @constructor
		 */
		function Path(path, context) {
			argv.arrange(arguments);
			properties.setPrivate(this, {});
			parser.parse(path);
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
		 * @param {string|Path} path
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
		Path.Axis = axis;

		// formats
		Path.XPATH = -100;
		Path.JSONPATH = -101;

		return Path;
	}).getModule();
});
