define([ "./Private", "JSONPath" ], function(Private, JSONPath) {
	var properties = new Private(Path);
	var jsonpath = JSONPath.eval;

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

	/**
	 * @param {string} [path]
	 * @param {Context} [context] 
	 * @constructor
	 */
	function Path(path) {
		var argv = Argv.getInstance(arguments);
		var path = argv.getArgumentByType("string");
		var context = argv.getArgumentByType("Context");
		properties.setPrivate(this, {});
		var part = path.split("/");
		var x = properties.getPrivate(this);
		x.path = result;
	}

	/**
	 * @param {number} format - format as defined by constants below
	 */
	function Path$toString(format) {
		
	}
	
	// utils (see NodeJS path http://nodejs.org/api/path.html)
	
	var noJSONPath = function Path$noJSONPath(path) {
		if (path.indexOf("$.") === 0) {
			throw new Error("function does not support JSON Path format");
		}
	};
	
	/**
	 * @param {string|Path} path
	 * @return {Path} normalized path
	 */
	Path.normalize = function Path$normalize(path) {
		noJSONPath(path);
		return new Path(pathNodeJS.normalize(path));
	};
	
	/**
	 * Normalize this path, taking care of '..' (parent-axis) and '.' (child-axis) parts.
	 * 
	 * @return {Path} normalized path
	 */
	Path.prototype.normalize = function Path$normalize() {
		var path = this.toString()
	};
	
	/**
	 * Join all arguments together and normalize the resulting path.
	 * 
	 * @param {...Path|string}
	 * 
	 * @return {Path} joined path
	 */
	Path.join;
	Path.prototype.join;
	
	
	Path.prototype.resolve;
	Path.prototype.relative;
	Path.prototype.dirname;
	Path.prototype.basename;
	Path.prototype.extname;
	
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
			type = /\[object ([^\]]+)\]/.exec(toString.call(entity))[1];
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
});
