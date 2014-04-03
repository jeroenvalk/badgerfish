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

var share, check = null;

var properties = Object.create(Private.prototype);
function Private(type) {
	properties.setPrivate(this, {
		type : type
	});
}

function Private$getClass() {
	var x = properties.getPrivate(this);
	return x.type;
}

function Private$setPrivate(instance, x) {
	console.assert(instance !== properties);
	var y = properties.getPrivate(this);
	if (!y.at) {
		y.at = '@';
		while (instance[y.at]) {
			y.at += '@';
		}
	}
	console.assert(!instance[y.at]);
	console.assert(!(instance instanceof Private) || y.at === '@');
	instance[y.at] = function() {
		if (this !== instance) {
			throw new Error(this.constructor.name + "['" + at
					+ "']: @-function belongs on class "
					+ instance.constructor.name);
		}
		if (check === instance) {
			share = x;
			check = null;
		} else {
			throw new Error(this.constructor.name
					+ ": security violation on @-function");
		}
	};
}

function Private$getPrivate(instance) {
	var at = properties.getPrivate(this).at;
	if (check) {
		throw new Error(check.constructor.name + ": has invalid @-function");
	}
	check = instance;
	instance[at]();
	if (check) {
		throw new Error(instance.constructor.name + ": has invalid @-function");
	}
	return share;
}

Private.prototype.getClass = Private$getClass;
Private.prototype.setPrivate = Private$setPrivate;
Private.prototype.getPrivate = Private$getPrivate;

var x = {
	type : Private,
	at : '@'
};
properties['@'] = function() {
	console.assert(this === properties);
	if (check === properties) {
		share = x;
		check = null;
	} else {
		throw new Error(this.constructor.name
				+ ": security violation on @-function");
	}
};
properties.getPrivate = function(instance) {
	console.assert(instance instanceof Private);
	if (check) {
		throw new Error(check.constructor.name + ": has invalid @-function");
	}
	check = instance;
	instance['@']();
	if (check) {
		throw new Error(instance.constructor.name + ": has invalid @-function");
	}
	return share;
};

module.exports = Private;
