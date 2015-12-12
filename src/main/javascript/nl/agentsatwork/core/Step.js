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
define([ "./XPath" ], function(classXPath) {
	function class_Step(properties) {
		// properties.extends([ classXPath ]);

		var AXIS = this.AXIS = {
			ANCESTOR : -10,
			ANCESTOR_OR_SELF : -11,
			ATTRIBUTE : -12,
			CHILD : -13,
			DESCENDANT : -14,
			DESCENDANT_OR_SELF : -15,
			FOLLOWING : -16,
			FOLLOWING_SIBLING : -17,
			NAMESPACE : -18,
			PARENT : -19,
			PRECEDING : -20,
			PRECEDING_SIBLING : -21,
			SELF : -22
		};

		this.constructor =
		/**
		 * @param {SchemaNode}
		 *            schemaNode
		 * @param {string}
		 *            string
		 */
		function Step(schemaNode, step) {
			var x = {
				string : step
			};
			properties.setPrivate(this, x);
			var i = step.lastIndexOf("::", 20);
			i = i < 0 ? 0 : i + 2;
			var j = step.indexOf("[", i);
			j = j < 0 ? step.length : j;
			var tagname = step.substring(i, j);
			switch (tagname.charAt(0)) {
			case '@':
				x.axis = AXIS.ATTRIBUTE;
				x.string = "attribute::" + tagname.substr(1);
				break;
			case '$':
				break;
			default:
				x.tagName = schemaNode.getRootSchema().createTagName(tagname);
				this.axis = !!i;
				x.axis = this.axis ? AXIS.CHILD : AXIS.DESCENDANT;
				break;
			}
		};

		this.toString = function XPath$toString() {
			return properties.getPrivate(this).string;
		};

		this.getDepth = function XPath$getDepth() {
			return 1;
		};

		this.getStep = function XPath$getStep(index) {
			return index ? null : this;
		};

		this.getAxis = function XPath$getAxis() {
			return properties.getPrivate(this).axis;
		};

		this.getTagName = function Step$getTagName() {
			return properties.getPrivate(this).tagName;
		};
	}

	return class_Step;
});
