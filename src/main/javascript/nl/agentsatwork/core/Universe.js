/**
 * Copyright © 2015 dr. ir. Jeroen M. Valk
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

/* global define */
define(function() {
	var self = {};

	function class_Universe(properties) {
		this.constructor =
		/**
		 * Universe
		 * 
		 * Each Set is assigned a single universe that contains all possible
		 * values that can be members of the set.
		 */
		function Universe() {
			var x = Object.create(self);
			x.universe = [];
			x.indexOf = {};
			var size = arguments.length;
			for (var i = 0; i < size; ++i) {
				x.addValue(arguments[i]);
			}
			properties.setPrivate(this, x);
		};

		this.indexOf = function Universe$indexOf(value) {
			return properties.getPrivate(this).addValue(value);
		};

		this.valueOf = function Universe$valueOf(index) {
			return properties.getPrivate(this).universe[index];
		};

		this.addValue = function Universe$addValue() {
			var x = properties.getPrivate(this);
			return x.addValue.apply(x, arguments);
		};

		this.containsIndex = function Universe$containsIndex() {
			var x = properties.getPrivate(this);
			return x.containsIndex.apply(x, arguments);
		};

		this.containsValue = function Universe$containsValue() {
			var x = properties.getPrivate(this);
			return x.containsValue.apply(x, arguments);
		};

		this.inverse = function Universe$inverse() {
			var result, x = properties.getPrivate(this);
			switch (x.type) {
			case "number":
				result = [];
				break;
			case "string":
				result = {};
				break;
			default:
				throw new Error("Universe: only 'number' and 'string' universes can be inverted");
			}
			x.universe.forEach(function(value, index) {
				result[value] = index;
			});
			return result;
		};

		this.clear = function Universe$clear() {
			var x = properties.getPrivate(this);
			return x.containsValue.apply(x, arguments);
		};

		this.union = function Universe$union(universe) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(universe);
			y.universe.forEach(function(value) {
				x.addValue(value);
			});
		};

		this.complement = function Universe$complement(universe) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(universe);
			x.clear();
			x.addValue.apply(x, y.universe.filter(function(value) {
				return !x.containsValue(value);
			}));
		};

		this.difference = function Universe$difference(universe) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(universe);
			x.removeValue.apply(x, y.universe);
		};

		this.intersection = function Universe$intersection(universe) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(universe);
			x.removeValue.apply(x, x.universe.filter(function(value) {
				return !y.containsValue(value);
			}));
		};
	}

	self.addValue = function private_Universe$addValue() {
		var self = this;
		function private_Universe$addValue$recurse(value) {
			return self.addValue(value);
		}

		var result;
		for (var i = 0; i < arguments.length; ++i) {
			var value = arguments[i];
			if (value instanceof Array) {
				value = value.map(private_Universe$addValue$recurse);
			} else {
				var type = typeof value;
				switch (this.type) {
				case undefined:
					this.type = type;
					break;
				case "string":
					if (type === "object")
						this.type = type;
					/* falls through */
				case "object":
					break;
				default:
					switch (type) {
					case "string":
					case "object":
						this.type = type;
					}
				}
			}
			result = JSON.stringify(value);
			if (isNaN(this.indexOf[result])) {
				result = this.indexOf[result] = this.universe.length;
				this.universe.push(value);
			} else {
				result = this.indexOf[result];
			}
		}
		return result;
	};

	self.containsIndex = function private_Universe$containsIndex() {
		for (var i = 0; i < arguments.length; ++i) {
			if (arguments[i] !== undefined && this.universe[arguments[i]] === undefined) {
				return false;
			}
		}
		return true;
	};

	self.containsValue = function private_Universe$containsValue() {
		for (var i = 0; i < arguments.length; ++i) {
			if (arguments[i] !== undefined && isNaN(this.indexOf[JSON.stringify(arguments[i])])) {
				return false;
			}
		}
		return true;
	};

	return class_Universe;
});
