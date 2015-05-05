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

/* global window */

// Fix Function#name on browsers that do not support it (IE) (Jürg Lehni):
Object.defineProperty(Function.prototype, 'name', {
	get : function() {
		var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
		// For better performance only parse once, and then cache the
		// result through a new accessor for repeated access.
		Object.defineProperty(this, 'name', {
			value : name
		});
		return name;
	}
});

//window.DOMParser = {
//	parseFromString : function DOMParser$parseFromString() {
//
//	}
//};
