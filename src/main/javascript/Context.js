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
			argv.arrange(arguments);
			var x = {};
			properties.setPrivate(this, x);
			if (path) {
				// TODO: HACK the parsing for now
				// Path.callBase(this, null, path, context);
				x.path = path;
			} else {
				console.assert(context.ownerDocument instanceof Document)
				x.node = context;
			}
		};
		Path.extendedBy(Context);
		properties = new Private(Context);
		var context = new Context(undefined, document.documentElement);

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
		 * @param {string} content
		 */
		function private_Context$initialize(content) {
			var x = properties.getPrivate(this);
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
		});

		argv.define([], function Context$toString() {
			return properties.getPrivate(this).path;
		});

		argv.define([], function Context$toNode() {
			return properties.getPrivate(this).node;
		});

		argv.define([ "Context" ], function Context$transform(context) {
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
				result = xsltProcessor.transformToFragment(x.node.ownerDocument, document);
			}
			console.assert(result.childElementCount === 1);
			return new Context(undefined, result.firstElementChild);
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

		argv.define([], function private_Context$requireXIncludes() {
			var x = properties.getPrivate(this);
			var nodes = x.node.ownerDocument.getElementsByTagnameNS("http://www.w3.org/2001/XInclude", "include");
			x.includes = [];
			require(nodes.map(function(node) {
				return "text!" + node.getAttribute("href");
			}), function() {
				for ( var i = 0; i < arguments.length; ++i) {
					var context = new Context();
					context.initialize(arguments[i]);
					x.includes.push(context);
				}
			});
		});
		
		argv.define([], function private_Context$resolveXIncludes() {
			var x = properties.getPrivate(this);
			var nodes = x.node.ownerDocument.getElementsByTagnameNS("http://www.w3.org/2001/XInclude", "include");
			console.assert(x.includes.length === nodes.length);
			for (var i =0; i<nodes.length; ++i) {
				nodes[i].parentNode.replaceChild(x.includes[i].toNode(), nodes[i]);
			}
		});
		
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