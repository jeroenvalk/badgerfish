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

var Private = require("./Private");
var properties = new Private(Serializable);

/**
 * @param {Object}
 *            x - (private) properties object to be (de)serialized
 * @constructor
 */
function Serializable(x) {
	properties.setPrivate(this, x);
}

/**
 * Deep check whether to instances are equal regarding their properties.
 * 
 * @param {Serializable}
 *            serializable - instance to compare with
 * @returns {boolean}
 */
function Serializable$equals(serializable) {
	return areEqualObjects(properties.getPrivate(this), properties
			.getPrivate(serializable));
}

/**
 * Reads the properties from a JSON string.
 * 
 * @param {string}
 *            string - JSON string
 */
function Serializable$fromJSON(string) {
	var x = properties.getPrivate(this);
	var prop = undefined;
	for (prop in x) {
		if (x.hasOwnProperty(prop)) {
			delete x[prop];
		}
	}
	var y = JSON.parse(string);
	for (prop in y) {
		x[prop] = y[prop];
	}
}

/**
 * Writes properties to JSON string.
 * 
 * @returns (private) properties as JSON string
 */
function Serializable$toJSON() {
	return JSON.stringify(properties.getPrivate(this));
}

Serializable.prototype.equals = Serializable$equals;
Serializable.prototype.fromJSON = Serializable$fromJSON;
Serializable.prototype.toJSON = Serializable$toJSON;

/**
 * @private
 * @static
 */
function Serializable$areEqual(a, b) {
	if (a[prop] instanceof Array) {
		if (!(b[prop] instanceof Array)
				|| !Serializable$areEqualArrays(a[prop], b[prop]))
			return false;
	} else if (a[prop] instanceof Object) {
		if (!(b[prop] instanceof Object)
				|| !Serializable$areEqualObjects(a[prop], b[prop]))
			return false;
	} else {
		return JSON.stringify(a[prop]) === JSON.stringify(b[prop]);
	}
}

/**
 * @private
 * @static
 */
function Serializable$areEqualArrays(a, b) {
	if (a.length !== b.length)
		return false;
	for ( var i = 0; i < a.length; ++i) {
		if (!Serializable$areEqual(a[i], b[i]))
			return false;
	}
	return true;
}

/**
 * @private
 * @static
 */
function Serializable$areEqualObjects(a, b) {
	var prop = undefined;
	for (prop in b)
		if (!a.hasOwnProperty(prop) && b.hasOwnProperty(prop))
			return false;
	for (prop in a) {
		if (a.hasOwnProperty(prop)) {
			if (!areEqual(a[prop], b[prop])) {
				return false;
			}
		}
	}
	return true;
}

module.exports = Serializable;
