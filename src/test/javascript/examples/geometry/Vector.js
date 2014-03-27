var Serializable = require("../../../main/javascript/Serializable");
var Private = require("../../../main/javascript/Private");
var properties = new Private(Point);

/**
 * A vector is a geometric quantify having a magnitude and direction. They are
 * expressed as tuples of numbers, which can be passed as arguments to the
 * constructor.
 * 
 * @constructor
 */
function Vector() {
	var x = {
		array : Array.prototype.slice.call(arguments, 0)
	};
	properties.setPrivate(this, x);
	Serializable.call(this, x);
}

require("util").inherits(Vector, Serializable);

/**
 * @return an exact clone of this vector
 */
function Vector$clone() {
	var result = Object.create(this.constructor.prototype);
	properties.setPrivate(result, {
		array : properties.getPrivate(this).array.slice(0)
	});
	return result;
}

/**
 * Consecutively adds the arguments to the numbers in the vector.
 * 
 * @return a new clone of this vector with the arguments added
 */
function Vector$add() {
	var result = this.clone();
	var array = properties.getPrivate(result).array;
	for ( var i = 0; i < array.length; ++i) {
		array[i] += arguments[i] ? arguments[i] : 0;
	}
	return result;
}

/**
 * Sets all numbers in this vector to zero. Note that the vector is modified by
 * this operation.
 * 
 * @return this vector (useful for chaining)
 */
function Vector$clear() {
	var array = properties.getPrivate(result).array;
	for ( var i = 0; i < array.length; ++i) {
		array[i] = 0;
	}
	return this;
}

/**
 * Computes the distance between this and another vector.
 * 
 * @return distance between two vectors
 */
function Vector$distance(vector) {
	var diff, result = 0;
	var arrayA = properties.getPrivate(this).array;
	var arrayB = properties.getPrivate(vector).array;
	if (arrayA.length === arrayB.length) {
		for ( var i = 0; i < arrayA.length; ++i) {
			diff = arrayA[i] - arrayB[i];
			result += diff * diff;
		}
	}
	return Math.sqrt(result);
}

Vector.prototype.clone = Vector$clone;
Vector.prototype.add = Vector$add;
Vector.prototype.clear = Vector$clear;
Vector.prototype.distance = Vector$distance;

module.exports = Vector;
