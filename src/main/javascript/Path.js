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

define([ "./Private", "./Argv", "path" ], function(Private, Argv, parser) {
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

	return Argv.define([ "string", "Context" ], function class_Path(argv) {
		var Path =
		/**
		 * @param {string} [path]
		 * @param {Context} [context]
		 * @constructor
		 */
		function private_Path(path, context) {
			argv.arrange(arguments);
			properties.setPrivate(this, {});
			parser.parse(path);
		}
		properties = new Private(Path);

		argv.define([ "number" ],
		/**
		 * 
		 */
		function Path$toString(format) {

		});

		// utils (see NodeJS path http://nodejs.org/api/path.html)
		argv.define([ "string|Path" ],
		/**
		 * @static
		 * @param {string|Path} path
		 * @return {Path} normalized path
		 */
		function static_Path$normalize(path) {
			return new Path(path).normalize();
		});

		argv.define([],
		/**
		 * Normalize this path, taking care of '..' (parent-axis) and '.'
		 * (child-axis) parts.
		 * 
		 * @return {Path} normalized path
		 */
		function Path$normalize() {
			return this;
		});

		argv.define([],
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
