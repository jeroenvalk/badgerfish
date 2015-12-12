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
define([ "./Exception" ], function(classException) {
	function class_TagName(properties) {
		var Exception = properties.import([ classException ]);

		this.constructor =
		/**
		 * @param {Schema}
		 *            schema - root schema defining the namespaces
		 * @param {number}
		 *            index - index of the namespace
		 * @param {string}
		 *            localName - local name
		 */
		function TagName(schema, index, localName) {
			if (!(schema instanceof Object))
				throw new Exception("type error");
			if (isNaN(index))
				throw new Exception("type error");
			properties.setPrivate(this, {
				schema : schema,
				index : index,
				local : localName
			});
		};

		this.getIndex = function TagName$getIndex() {
			return properties.getPrivate(this).index;
		};
		
		this.getPrefix = function TagName$getPrefix() {
			var x = properties.getPrivate(this);
			return x.schema.getPrefix(x.index);
		};

		this.getNamespaceURI = function TagName$getNamespaceURI() {
			var x = properties.getPrivate(this);
			return x.schema.getNamespaceURI(x.index);
		};
		
		this.getTagName = function TagName$getTagName() {
			var x = properties.getPrivate(this);
			var prefix = x.schema.getPrefix(x.index);
			return !prefix || prefix === "$" ? x.local : [ prefix, x.local ].join(":");
		};

		this.getLocalName = function TagName$getLocalName() {
			return properties.getPrivate(this).local;
		};
		
		this.createElement = function TagName$createElement(ownerDocument) {
			var x = properties.getPrivate(this);
			return isNaN(x.index) ? ownerDocument.createElement(x.local) : ownerDocument.createElementNS(this.getNamespaceURI(), x.local);
		};
	}

	return class_TagName;
});
