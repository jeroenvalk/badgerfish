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
define([ "./Exception", "./TagName" ], function(classException, classTagName) {
	function class_SchemaNode(properties) {
		var Exception = properties.import([ classException ]);
		var TagName = properties.import([ classTagName ]);

		var SchemaNode = this.constructor =
		/**
		 * Constructor to create a new empty schema node.
		 * 
		 * @param {TagName}
		 *            tagName - tagname for the document element
		 * @param {SchemaNode}
		 *            parent - parent schema node
		 */
		function SchemaNode(tagName, parent) {
			properties.setPrivate(this, {
				tagName : tagName,
				parent : parent,
				tagNames : {},
				child : {}
			});
		};

		this.getRootSchema = function SchemaNode$getRootSchema() {
			var parent = properties.getPrivate(this).parent;
			return parent ? parent.getRootSchema() : this;
		};
		
		this.getTagName = function SchemaNode$getTagName() {
			return properties.getPrivate(this).tagName;
		};
		
		this.getChildSchema = function SchemaNode$getChildSchema(tagName) {
			var result = properties.getPrivate(this).child[tagName.toString()];
			if (!result)
				throw new Exception("schema violation");
			return result;
		};

		this.addSchemaByChildNode = function SchemaNode$addSchemaByChildNode(child) {
			var x = properties.getPrivate(this);
			var tagname = [ child.namespaceURI, child.localName ].join(":");
			if (!x.tagNames[tagname]) {
				var tagName = x.tagNames[tagname] = new TagName(child.namespaceURI, child.localName);
				x.child[tagname] = new SchemaNode(tagName, this);
				if (x.parent)
					x.parent.addDescendant(tagName);
			}
		};

		this.allowNode = function Schema$allowNode(node) {
			var child = node.children;
			for (var i = 0; i < child.length; ++i) {
				this.addSchemaByChildNode(child[i]);
			}
		};
		
		this.allowJSON = function Schema$allowJSON(json) {
			
		};
	}

	return class_SchemaNode;
});
