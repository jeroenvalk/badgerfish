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
define([ "./SchemaNode", "./Exception", "./TagName" ], function(classSchemaNode, classException, classTagName) {
	var Exception = define.classOf([ classException ]);

	function class_Schema(properties) {
		properties.extends([ classSchemaNode ]);
		var TagName = properties.import([ classTagName ]);

		this.constructor =
		/**
		 * Constructor to create a new empty schema.
		 * 
		 * @param {Object}
		 *            xmlns - namespace definition mapping prefixes on namespace
		 *            URIs
		 * @param {string}
		 *            tagname - tagname string for document element based on
		 *            provided namespace
		 */
		function Schema(xmlns, tagname) {
			var prefixes = Object.keys(xmlns);
			var indexOf = {}, namespaceURI = new Array(prefixes.length);
			for (var i = 0; i < prefixes.length; ++i) {
				namespaceURI[i] = xmlns[prefixes[i]];
				indexOf[prefixes[i]] = i;
				indexOf[namespaceURI[i]] = i;
			}
			properties.setPrivate(this, {
				prefix : prefixes,
				namespaceURI : namespaceURI,
				indexOf : indexOf
			});
			properties.getPrototype(1).constructor.call(this, this.createTagName(tagname), null, prefixes.length + 1);
		};

		this.indexOfPrefix = function Schema$indexOfPrefix(prefix) {
			if (!prefix) {
				throw new Exception("missing argument in function call");
			}
			var x = properties.getPrivate(this), index;
			index = x.indexOf[prefix];
			if (x.prefix[index] !== prefix) {
				return -1;
			}
			return index;
		};

		this.getPrefix = function Schema$getPrefix(index) {
			return properties.getPrivate(this).prefix[index];
		};

		this.indexOfNamespaceURI = function Schema$indexOfNamespaceURI(namespaceURI) {
			if (!namespaceURI) {
				throw new Exception("missing argument in function call");
			}
			var x = properties.getPrivate(this), index;
			index = x.indexOf[namespaceURI];
			if (x.namespaceURI[index] !== namespaceURI) {
				return -1;
			}
			return index;
		};

		this.namespaceCount = function Schema$namespaceCount() {
			return properties.getPrivate(this).namespaceURI.length;
		};
		
		this.getNamespaceURI = function Schema$getNamespaceURI(index) {
			return properties.getPrivate(this).namespaceURI[index];
		};

		this.createTagName = function Schema$createTagName(tagname) {
			if (!tagname) {
				throw new Exception("missing argument in function call");
			}
			var index, split = tagname.split(":", 2);
			var indexOf = properties.getPrivate(this).indexOf;
			switch (split.length) {
			case 1:
				index = indexOf.$;
				break;
			case 2:
				index = indexOf[split.shift()];
				break;
			}
			return new TagName(this, index ? index : -1, split[0]);
		};

		this.createTagNameNS = function Schema$createTagNameNS(namespaceURI, localName) {
			if (!localName) {
				throw new Exception("missing argument in function call");
			}
			return new TagName(this, namespaceURI ? this.indexOfNamespaceURI(namespaceURI) : -1, localName);
		};
	}

	class_Schema.generateFromEntity =
	/**
	 * 
	 */
	function Schema$generateFromEntity(entity) {
		var xmlns = {}, tagname = entity.localName;
		if (!entity) {
			throw new Exception("missing argument in function call");
		}
		if (entity.ownerDocument && entity.ownerDocument.documentElement === entity) {
			for (var i = 0; i < entity.attributes.length; ++i) {
				var attr = entity.attributes.item(i);
				if (!attr.name.lastIndexOf("xmlns", 0)) {
					if (attr.name.length === 5) {
						xmlns.$ = attr.value;
					} else {
						var prefix = attr.name.substr(6);
						xmlns[prefix] = attr.value;
						if (entity.namespaceURI === attr.value) {
							tagname = [ prefix, entity.localName ].join(":");
						}
					}
				}
			}
		} else {
			if (!(entity instanceof Object)) {
				throw new Exception("JSON entity or XML document element required");
			}
			for ( var prop in entity) {
				if (entity.hasOwnProperty(prop)) {
					if (tagname)
						throw new Exception("multiple properties not allowed on entity");
					tagname = prop;
				}
			}
			if (!tagname)
				throw new Exception("empty JSON entity");

			var namespaceURI = entity[tagname]['@xmlns'];
			Object.keys(namespaceURI ? namespaceURI : {}).forEach(function(prefix) {
				xmlns[prefix] = namespaceURI[prefix];
			});
		}
		return new this(xmlns, tagname);
	};

	return class_Schema;
});
