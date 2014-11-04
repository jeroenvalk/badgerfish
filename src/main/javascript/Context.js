define([ "./Private", "./Argv", "./Path" ], function(Private, Argv, Path, JSONPath) {
	// var xpath = require('xpath');
	// var DOMParser = require('xmldom').DOMParser;
	// var jsonpath = JSONPath.eval;

	var properties;
	return Argv.define([ "string", "Context" ], function(argv) {
		var Context =
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

		Path.extendedBy(Context);
		properties = new Private(Context);
		var context = new Context();

		argv.define([], function static_Context$getHTMLDocument() {
			return context;
		});

		argv.define([], function static_Context$requireAll(array, callback) {
			require(array.map(function(context) {
				return "text!" + context.toString();
			}), function() {
				var args = Array.prototype.slice.call(arguments);
				array.forEach(function(context, i) {
					argv.Context.initialize.call(context, args[i]);
				});
				callback();
			});
		});

		argv.define([ "string" ],
		/**
		 * Initializes a context after it has been loaded.
		 * 
		 * @param {string|Node} content
		 */
		function private_Context$initialize(content) {
			var x = properties.getPrivate(this);
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
			return this;
		});

		argv.define([], function Context$toString() {
			return properties.getPrivate(this).path;
		});

		argv.define([], function Context$toNode() {
			return properties.getPrivate(this).node;
		});

		argv.define([ "Context", "Function", "Context" ], function Context$transform(context, callback, target) {
			argv.Context.requireXIncludes.call(this, function() {
				argv.Context.resolveXIncludes.call(this);
				var x = properties.getPrivate(this);
				var y = properties.getPrivate(context);
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
		});

		argv.define([ "string|Path" ],
		/**
		 * @static
		 * @param {string|Path} path
		 * @return {Context} context at the specified path
		 */
		function static_Context$normalize(path) {
			// path = Path.normalize(path);
			return new Context(path);
		});

		argv.define([], function private_Context$requireXIncludes(callback) {
			var self = this;
			var x = properties.getPrivate(self);
			var nodes = x.node.ownerDocument.getElementsByTagNameNS("http://www.w3.org/2001/XInclude", "include");
			var modules = [];
			for ( var i = 0; i < nodes.length; ++i) {
				modules.push("text!" + nodes[i].getAttribute("href"));
			}
			x.includes = [];
			require(modules, function() {
				for ( var i = 0; i < arguments.length; ++i) {
					var context = new Context();
					argv.Context.initialize.call(context, arguments[i]);
					x.includes.push(context);
				}
				callback.call(self);
			});
		});

		argv.define([], function private_Context$resolveXIncludes() {
			var x = properties.getPrivate(this);
			var nodes = x.node.ownerDocument.getElementsByTagNameNS("http://www.w3.org/2001/XInclude", "include");
			console.assert(x.includes.length === nodes.length);
			for ( var i = 0; i < x.includes.length; ++i) {
				nodes[0].parentNode.replaceChild(x.includes[i].toNode(), nodes[0]);
			}
			console.assert(nodes.length === 0);
		});

		argv.Context.initialize.call(context, document.documentElement);

		return Context;
	}).getModule();

	// XPath

	Path.prototype.selectSingleNode = function Path$selectSingleNode(entity) {

	};

	Path.prototype.selectNodes = function Path$selectNodes(entity) {

	};

	// JSONPath

	Path.prototype.selectJSON =
	/**
	 * @param {number} amount
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
	 * @param {string} type
	 * @return {type}
	 */
	function Path$selectOne(entity, type) {

	};

	Path.prototype.selectAll =
	/**
	 * @param entity
	 * @param {string} type
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
	 * @param {String} type
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
	 * @param {String} type
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