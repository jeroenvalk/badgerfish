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
define([ "./Step" ], function(classStep) {
	function class_XPath(properties) {
		var Step = properties.import([ classStep ]);

		this.constructor =
		/**
		 * @param {string}
		 *            string
		 */
		function XPath(schemaNode, string) {
			properties.setPrivate(this, {
				step : string.split('/').map(function(step) {
					return new Step(schemaNode, step);
				})
			});
		};

		this.toString = function XPath$toString() {
			var x = properties.getPrivate(this);
			return x.step.map(function(step) {
				return step.toString();
			}).join("/");
		};

		this.getDepth = function XPath$getDepth() {
			return properties.getPrivate(this).step.length;
		};

		this.getStep = function XPath$getStep(index) {
			return properties.getPrivate(this).step[index];
		};
	}

	return class_XPath;
});
