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
		function SchemaNode(tagName, parent, n) {
			var x = {
				tagName : tagName,
				parent : parent
			};
			properties.setPrivate(this, x);
			if (!n)
				n = this.getRootSchema().namespaceCount() + 1;
			var child = new Array(n);
			for (var i = 0; i < n; ++i) {
				child[i] = {};
			}
			x.child = child;
		};

		this.getRootSchema = function SchemaNode$getRootSchema() {
			var parent = properties.getPrivate(this).parent;
			return parent ? parent.getRootSchema() : this;
		};

		this.getTagName = function SchemaNode$getTagName() {
			return properties.getPrivate(this).tagName;
		};

		this.getChildSchema = function SchemaNode$getChildSchema(tagName) {
			var result = properties.getPrivate(this).child[tagName.getIndex() + 1][tagName.getLocalName()];
			if (!result)
				throw new Exception("schema violation");
			return result;
		};

		this.addChildSchemaByTagName = function SchemaNode$addChildSchemaByTagName(tagName) {
			var x = properties.getPrivate(this);
			var child = x.child[tagName.getIndex() + 1];
			var localName = tagName.getLocalName();
			if (!child[localName]) {
				child[localName] = new SchemaNode(tagName, this);
				if (x.parent)
					x.parent.addDescendant(tagName);
			}
			return child[localName];
		};

		this.addChildSchemaByNode = function SchemaNode$addChildSchemaByNode(node) {
			var x = properties.getPrivate(this);
			var root = this.getRootSchema();
			var index = root.indexOfNamespaceURI(node.namespaceURI);
			var child = x.child[index];
			if (!child[node.localName]) {
				var tagName = new TagName(root, index, node.localName);
				child[node.localName] = new SchemaNode(tagName, this);
				if (x.parent)
					x.parent.addDescendant(tagName);
			}
			return child[node.localName];
		};

		this.allowNode = function Schema$allowNode(node) {
			var child = node.children;
			for (var i = 0; i < child.length; ++i) {
				this.addChildSchemaByNode(child[i]);
			}
		};

		this.allowJSON = function Schema$allowJSON(json) {
			var self = this;
			Object.keys(json).filter(function(prop) {
				return prop.charAt(0) !== '@' && prop !== "$";
			}).forEach(function(tagname) {
				self.addChildSchemaByTagName(self.getRootSchema().createTagName(tagname));
			});
		};
	}

	return class_SchemaNode;
});
