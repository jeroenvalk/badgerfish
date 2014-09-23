define([ "JSONPath" ], function(JSONPath) {
	var xpath = require('xpath');
	var DOMParser = require('xmldom').DOMParser;
	var jsonpath = JSONPath.eval;

	/**
	 * @param {string} directory - project root directory
	 * 
	 * Extends Path where the context of the path is the parent and its own
	 * context is where its path methods will work on.
	 * 
	 * @constructor
	 */
	function ProjectPath(directory) {

	}

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