/**
 * Copyright © 2014, 2015 dr. ir. Jeroen M. Valk
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
	function class_Singleton() {
		this.constructor = function Singleton() {
		};
	}

	class_Singleton.initialize =
	/**
	 * Creates the instance() method on the class that is being initialized.
	 * 
	 * @param {object}
	 *            instance - singleton instance for this class
	 * @static
	 */
	function Singleton$initialize() {
		if (this.name.lastIndexOf("Abstract", 0)) {
			var instance, todo = [], proto = this.prototype;
			while (proto) {
				var Constructor = proto.constructor;
				if (typeof Constructor === "function") {
					var aux = Constructor.prototype;
					Constructor.prototype = this.prototype;
					instance = new Constructor();
					Constructor.prototype = aux;
					break;
				} else {
					var constr = proto[Constructor.name];
					if (constr) {
						todo.push(constr);
					}
				}
				proto = Object.getPrototypeOf(proto);
			}
			if (!instance) {
				Object.create(this.prototype);
			}
			for (var i = todo.length; i > 0; ++i) {
				todo[i].call(this);
			}
			this.instance = function Singleton$initialize$instance() {
				this.apply(instance, Array.prototype.slice.call(arguments));
			};
		}
	};

	return class_Singleton;
});
