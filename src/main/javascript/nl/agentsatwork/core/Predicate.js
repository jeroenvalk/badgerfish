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
	function class_Predicate(properties) {
		this.constructor =
		/**
		 * @param {SchemaNode}
		 *            schema
		 * @param {string}
		 *            expression
		 */
		function Predicate(schema, expression) {
			var x = {
				term : schema.parsePath(expression)
			};
			properties.setPrivate(this, x);
		};

		this.evaluate =
		/**
		 * @param {Element} element
		 */
		function Predicate$evaluate(element) {
			var x = properties.getPrivate(this);
			var value = element.getElementByTagName(x.term, true);
			return !!value;
		};
	}

	return class_Predicate;
});
