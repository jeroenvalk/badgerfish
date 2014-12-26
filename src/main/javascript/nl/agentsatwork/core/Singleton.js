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

/* global define */
define(function() {
	function class_Singleton() {
		this.Singleton = function Singleton() {
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
			var instance = new this();
			this.instance = function Singleton$initialize$instance() {
				this.apply(instance, Array.prototype.slice.call(arguments));
			};			
		}
	};

	return class_Singleton;
});
