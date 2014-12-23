/**
 * Copyright © 2014 dr. ir. Jeroen M. Valk
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

define([ "./Argv", "./Path" ], function(Argv, Path, JSONPath) {
	// var xpath = require('xpath');
	// var DOMParser = require('xmldom').DOMParser;
	// var jsonpath = JSONPath.eval;
	var Promise = definition.classOf("nl.agentsatwork.globals.Promise");

	function class_Context($, argv, properties) {
		var context;
		var Context = $.Context =
		/**
		 * Extends Path where the context of the path is the parent and its own
		 * context is where its path methods will work on.
		 * 
		 * @constructor
		 */
		function private_Context(path, context) {
			// argv.Path.call(this, path, context);
			// TODO: super should handle evrything, but HACK the parsing for now
			argv.arrange(arguments);
			properties.setPrivate(this, {
				path : path,
				context : context
			});
		};
		$.Context = [ "string", "Context", Context ];

		$.getHTMLDocument = function static_Context$getHTMLDocument() {
			return context;
		};

		$.requireAll = function static_Context$requireAll(array, callback) {
			require(array.map(function(context) {
				return "text!" + context.toString();
			}), function() {
				var args = Array.prototype.slice.call(arguments);
				array.forEach(function(context, i) {
					argv.Context.initialize.call(context, args[i]);
				});
				callback();
			});
		};

		$.initialize =
		/**
		 * Initializes a context after it has been loaded.
		 * 
		 * @param {string|Node}
		 *            content
		 */
		[ "string", function private_Context$initialize(content) {
			var x = properties.getPrivate(this);
			var xhr = {};
			if (content.ownerDocument instanceof Document) {
				x.node = content;
			} else {
				var xmlDoc;
				if (window.DOMParser) {
					var parser = new DOMParser();
					xmlDoc = parser.parseFromString(content, "text/xml");
				} else {
					xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = false;
					xmlDoc.loadXML(content);
				}
				x.node = xmlDoc.documentElement;
			}
			var Badgerfish = definition.classOf("Require:Badgerfish");
			x.badgerfish = new Badgerfish(x.node);
			return this;
		} ];

		$.toString = function Context$toString() {
			return properties.getPrivate(this).path;
		};

		$.toNode = function Context$toNode() {
			return properties.getPrivate(this).node;
		};

		$.transform = [ "Context", "Function", "Context", function Context$transform(context, callback, target) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(context);
			this.requireXIncludes(function() {
				this.resolveXIncludes();
				var result;
				if (window.ActiveXObject) {
					result = x.node.ownerDocument.transformNode(y.node.ownerDocument);
				}
				// code for Chrome, Firefox, Opera, etc.
				else if (document.implementation && document.implementation.createDocument) {
					var xsltProcessor = new XSLTProcessor();
					xsltProcessor.importStylesheet(y.node.ownerDocument);
					if (target) {
						result = xsltProcessor.transformToFragment(x.node.ownerDocument, target.toNode().ownerDocument);
					} else {
						result = xsltProcessor.transformToDocument(x.node.ownerDocument);
					}
				}
				console.assert(result.childElementCount === 1);
				callback.call(this, argv.Context.initialize.call(new Context(), result.firstElementChild));
			});
		} ];

		$.normalize =
		/**
		 * @static
		 * @param {string|Path}
		 *            path
		 * @return {Context} context at the specified path
		 */
		[ "string|Path", function static_Context$normalize(path) {
			// path = Path.normalize(path);
			return new Context(path);
		} ];

		$.requireXIncludes = function Context$requireXIncludes(callback) {
			return properties.getPrivate(this).badgerfish.requireXIncludes(callback);
		};

		$.resolveXIncludes = function Context$resolveXIncludes() {
			return properties.getPrivate(this).badgerfish.resolveXIncludes();
		};

		this.bootstrap();
		context = new Context();
		$.initialize.call(context, document.documentElement);
	}
	return Argv.define(class_Context).extends(Path);

	// XPath

	Path.prototype.selectSingleNode = function Path$selectSingleNode(entity) {

	};

	Path.prototype.selectNodes = function Path$selectNodes(entity) {

	};

	// JSONPath

	Path.prototype.selectJSON =
	/**
	 * @param {number}
	 *            amount
	 * @return {Array}
	 */
	function Path$selectJSON(entity, amount) {
		var type = typeof entity;
		if (type === "object") {
			type = /\[object ([^\]]+)\]/.exec(Object.prototype.toString.call(entity))[1];
		}
		var result = null;
		switch (type) {
		case "Object":
		case "Array":
			result = jsonPath(entity, this.toJSONPath());
			break;
		default:
			throw new Error("path selector on invalid type: " + type);
		}
		return result.slice(0, amount);
	};

	Path.prototype.selectOne =
	/**
	 * @param entity
	 * @param {string}
	 *            type
	 * @return {type}
	 */
	function Path$selectOne(entity, type) {

	};

	Path.prototype.selectAll =
	/**
	 * @param entity
	 * @param {string}
	 *            type
	 * @return {type[]}
	 */
	function Path$selectAll(entity, type) {

	};

	Path.prototype.selectSingleObject =
	/**
	 * @param entity
	 * @return {object}
	 */
	function Path$selectSingleObject(entity) {
		return this.selectOne(entity, "object");
	};

	Path.prototype.selectObjects =
	/**
	 * @param entity
	 * @return {object[]}
	 */
	function Path$selectObjects(entity) {
		return this.selectAll(entity, "object");
	};

	Path.prototype.selectSingleValue =
	/**
	 * @param entity
	 * @param {String}
	 *            type
	 * @return {boolean|number|string}
	 */
	function Path$selectSingleValue(entity, type) {
		if (!(type in {
			boolean : 1,
			number : 1,
			string : 1
		})) {
			throw new Error("type must be boolean, number or string");
		}
		return this.selectOne(type);
	};

	Path.prototype.selectValues =
	/**
	 * @param entity
	 * @param {String}
	 *            type
	 * @return {boolean[]|number[]|string[]}
	 */
	function Path$selectValues(entity, type) {
		if (!(type in {
			boolean : 1,
			number : 1,
			string : 1
		})) {
			throw new Error("type must be boolean, number or string");
		}
		return this.selectAll(entity, type);
	};

	Path.prototype.selectSingleBoolean =
	/**
	 * @param entity
	 * @return {boolean}
	 */
	function Path$selectSingleBoolean(entity) {
		return this.selectOne(entity, "boolean");
	};

	Path.prototype.selectBooleans =
	/**
	 * @param entity
	 * @return {boolean[]}
	 */
	function Path$selectBooleans(entity) {
		return this.selectAll(entity, "boolean");
	};

	Path.prototype.selectSingleNumber =
	/**
	 * @param entity
	 * @return {number}
	 */
	function Path$selectSingleNumber(entity) {
		return this.selectOne(entity, "number");
	};

	Path.prototype.selectNumbers =
	/**
	 * @param entity
	 * @return {number[]}
	 */
	function Path$selectNumbers(entity) {
		return this.selectAll(entity, "number");
	};

	Path.prototype.selectSingleString =
	/**
	 * @param entity
	 * @return {string}
	 */
	function Path$selectSingleString(entity) {
		return this.selectOne(entity, "string");
	};

	Path.prototype.selectStrings =
	/**
	 * @param entity
	 * @return {string[])
	 */
	function Path$selectStrings(entity) {
		return this.selectAll(entity, "string");
	};

});