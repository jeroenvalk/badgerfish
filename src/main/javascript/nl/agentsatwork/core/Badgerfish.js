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

/* globals define, DEBUG, expect, DOMParser, XMLSerializer */
/* jshint -W030 */
define([ "./Exception", "./SchemaNode", "./TagName" ], function(classException, classSchemaNode, classTagName) {
	function class_Badgerfish(properties) {
		var Exception = properties.import([ classException ]);
		var SchemaNode = properties.import([ classSchemaNode ]);
		var TagName = properties.import([ classTagName ]);
		var domParser = new DOMParser();
		var xmlSerializer = new XMLSerializer();
		var badgerfish;

		var Badgerfish = this.constructor =
		/**
		 * @param {Node|Object}
		 *            entity - XML node or JSON object
		 * @param {SchemaNode}
		 *            schema - schema to validate entity
		 * @constructor
		 */
		function Badgerfish(entity, schema) { 
			if (arguments.length < 2) 
				throw new Exception("missing argument in function call");
			if (!(entity instanceof Object))
				throw new Exception("JSON or XML node required");
			if (!(schema instanceof SchemaNode))
				throw new Exception("type error");
			var y, source, node, object, tagName;
			if (entity instanceof Array && entity.length === 2 && entity[0] instanceof TagName) {
				tagName = entity[0];
				source = object = entity = entity[1];
			} else if (entity.ownerDocument && entity.ownerDocument.documentElement) {
				source = node = entity;
			} else {
				var tagname;
				for ( var prop in entity) {
					if (tagname)
						throw new Exception("exactly one property expected on document element");
					tagname = prop;
				}
				if (!tagname)
					throw new Exception("exactly one property expected on document element");
				source = object = entity[tagname];
				if (object instanceof Array) {
					if (object.length !== 1)
						throw new Error("Badgerfish: cardinality of entity must be one");
					object = object[0];
				}
				node = domParser.parseFromString([ "<", tagname, "/>" ].join(""), 'text/xml').documentElement;
			}
			if (node && node.nodeType !== 1)
				throw new Error('Badgerfish: only elements can be decorated');
			var x = {
				root : node ? (node.ownerDocument.documentElement === node ? this : (y ? y.root : undefined)) : undefined,
				tagName : tagName,
				schema : schema,
				source : source,
				node : node,
				object : object,
				children : {},
				cache : {}
			};
			properties.setPrivate(this, x);
			if (this === x.root) {
				x.badgerfish = [];
				this.decorateRoot();
			}
			// if (node && x.root)
			// this.decorateNode();
			if (!x.source)
				throw new Error();
		};

		this.destroy = function Badgerfish$destroy() {
			var x = properties.getPrivate(this);
			Object.keys(x).forEach(function(prop) {
				delete x[prop];
			});
		};

		this.getDocumentElement = function Badgerfish$getDocumentElement() {
			var x = properties.getPrivate(this);
			return x.root ? x.root : x.parent.getDocumentElement();
		};

		this.getTagName = function Badgerfish$getTagName() {
			var x = properties.getPrivate(this);
			// return x.schema.getTagName();
			return x.node.ownerDocument === GLOBAL.document ? x.node.localName : x.node.tagName;
		};

		this.getPrefixOfNS = function Badgerfish$getPrefixOfNS(ns) {
			var x = properties.getPrivate(this);
			if (this !== x.root) {
				throw new Exception("prefix can only be requested at document element");
			}
			var result, xmlns = this.toJSON(0)['@xmlns'];
			if (xmlns) {
				result = Object.keys(xmlns).find(function(prefix) {
					return xmlns[prefix] === ns;
				});
			}
			if (!result)
				throw new Exception("namespace '" + ns + "' not found");
			return result;
		};

		var importNodeIE = function Badgerfish$importNodeIE(doc, node) {
			switch (node.nodeType) {
			case 1: // ELEMENT_NODE
				var result = doc.createElementNS(node.namespaceURI, node.nodeName);
				var attr = node.attributes;
				var child = node.childNodes;
				var i, n = attr ? attr.length : 0;
				for (i = 0; i < n; ++i)
					result.setAttribute(attr[i].nodeName, node.getAttribute(attr[i].nodeName));
				n = child ? child.length : 0;
				for (i = 0; i < n; ++i)
					result.appendChild(importNodeIE(child[i]));
				return result;
			case 3: // TEXT_NODE
			case 4: // CDATA_SECTION_NODE
				return doc.createTextNode(node.nodeValue);
			case 8: // COMMENT_NODE
				return doc.createComment(node.nodeValue);
			}
		};

		var getDecoration = function Badgerfish$getDecoration(node) {
			var result = node.previousSibling;
			switch (result ? result.nodeType : -1) {
			case 7:
			case 8:
				return result;
			default:
				return null;
			}
		};

		var getIndexFromDecoration = function Badgerfish$getIndexFromDecoration(decoration) {
			decoration = decoration.nodeValue.split("=");
			if (decoration[0].lastIndexOf("data-bfish-", 0) < 0) {
				throw new Error("Badgerfish.getIndexFromDecoration: invalid decoration");
			}
			var index = parseInt(decoration[1]);
			if (isNaN(index)) {
				throw new Error("Badgerfish.getIndexFromDecoration: invalid decoration");
			}
			return index;
		};

		var createDecoration = function Badgerfish$createDecoration(node, key, value) {
			var decoration = node.ownerDocument.createComment([ key, value ].join("="));
			node.parentNode.insertBefore(decoration, node);
		};

		var roots = [];

		this.decorateRoot = function Badgerfish$decorateRoot() {
			var index = roots.length;
			roots.push(this);
			createDecoration(properties.getPrivate(this).node, 'data-bfish-root', index);
		};

		this.getBadgerfishFromRoot = function Badgerfish$getBadgerfishFromRoot(node) {
			if (node === node.ownerDocument.documentElement) {
				return this;
			}
			var decoration = getDecoration(node);
			if (decoration) {
				return properties.getPrivate(this).badgerfish[getIndexFromDecoration(decoration)];
			}
			return null;
		};

		Badgerfish.getRootByDocument = function Badgerfish$getRootByDocument(doc) {
			var decoration = getDecoration(doc.documentElement);
			if (decoration) {
				return roots[getIndexFromDecoration(decoration)];
			}
			throw new Error("Badgerfish.getRootByDocument: node not decorated");
		};

		this.decorateNode = function Badgerfish$decorateNode() {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(x.root);
			var index = y.badgerfish.length;
			y.badgerfish.push(this);
			if (false) {
				x.node['@'] = function Badgerfish$at(root) {
					if (badgerfish !== null)
						throw new Error("Badgerfish: integrity violation");
					if (root && root !== x.root)
						throw new Error("Badgerfish: foreign node");
					badgerfish = y.badgerfish[index];
				};
			} else {
				if (x.node !== x.node.ownerDocument.documentElement)
					createDecoration(x.node, 'data-bfish-index', index);
			}
		};

		Badgerfish.getBadgerfishByNode = function Badgerfish$getBadgerfishByNode(node) {
			if (false) {
				badgerfish = null;
				if (node['@']) {
					node['@']();
				}
				return badgerfish;
			}
			return Badgerfish.getRootByDocument(node.ownerDocument).getBadgerfishFromRoot(node);
		};

		var getAttributeObject = function Badgerfish$getAttributeObject(all) {
			var x = properties.getPrivate(this);
			var i, attr, name, attrs, result = {};
			if (x.source === x.node) {
				attrs = x.node.attributes;
				for (i = 0; i < attrs.length; ++i) {
					attr = attrs.item(i);
					name = attr.name;
					if (all || name.lastIndexOf("xmlns", 0)) {
						result[name] = attr.value;
					}
				}
			} else {
				Object.keys(x.object).forEach(function(name) {
					if (name.charAt(0) === "@" && name.lastIndexOf("@xmlns", 0)) {
						result[name.substr(1)] = x.object[name];
					}
				});
				var xmlns = x.object['@xmlns'];
				if (all && xmlns) {
					Object.keys(xmlns).forEach(function(name) {
						result[name === "$" ? "xmlns" : "xmlns:" + name] = xmlns[name];
					});
				}
			}
			return result;
		};

		this.getText = function Badgerfish$getText() {
			var x = properties.getPrivate(this);
			var result;
			if (x.source === x.object) {
				result = x.object.$;
			} else {
				if (!x.node.childElementCount) {
					result = x.node.textContent;
				}
			}
			return result;
		};

		this.getAttribute = function Badgerfish$getAttribute(name) {
			var x = properties.getPrivate(this);
			if (x.source === x.object) {
				return x.object['@' + name];
			} else {
				return x.node.getAttribute(name);
			}
		};

		this.attr =
		/**
		 * @param {Object}
		 *            [attr] - attributes to be assigned
		 * @param {boolean}
		 *            all - true if xmlns attributes must be included
		 */
		function Badgerfish$attr(attr, all) {
			var x;
			if (attr && attr.constructor === Object) {
				if (!all) {
					Object.keys(attr).forEach(function(name) {
						if (!attr[name].lastIndexOf("xmlns", 0)) {
							delete attr[name];
						}
					});
				}
				x = properties.getPrivate(this);
				if (x.source === x.node) {
					var i, name, attrs = x.node.attributes, remove = [];
					for (i = 0; i < attrs.length; ++i) {
						name = attrs.item(i).localName;
						if (attr[name] === undefined) {
							remove.push(name);
						}
					}
					remove.forEach(function(name) {
						x.node.removeAttribute(name);
					});
					Object.keys(attr).forEach(function(name) {
						var value = attr[name];
						if (x.node.getAttribute(name) !== value) {
							x.node.setAttribute(name, value);
						}
					});
				} else {
					var xmlns;
					Object.keys(attr).forEach(function(name) {
						if (name.lastIndexOf("xmlns", 0)) {
							x.object['@' + name] = attr[name];
						} else {
							if (!xmlns)
								xmlns = x.object['@xmlns'] = {};
							if (name.length === 5) {
								xmlns.$ = attr.xmlns;
							} else {
								xmlns[name.substr(6)] = attr[name];
							}
						}
					});
				}
			} else {
				all = attr;
				return getAttributeObject.call(this, all);
			}
		};

		this.getTagNames = function Badgerfish$getTagNames(childAxis) {
			var x = properties.getPrivate(this);
			var root = this.getDocumentElement();
			if (childAxis) {
				if (!x.childTagNames) {
					if (x.source === x.node) {
						throw new Error("not implemented");
					} else {
						var xmlns = properties.getPrivate(this.getDocumentElement()).object['@xmlns'];
						x.childTagNames = Object.keys(x.object).filter(function(name) {
							return name.charAt(0) !== '@' && name !== "$";
						}).map(function(tagname) {
							var tagName, part = tagname.split(":");
							switch (part.length) {
							case 1:
								tagName = new TagName(xmlns ? xmlns.$ : undefined, part[0]);
								break;
							case 2:
								tagName = new TagName(xmlns[part[0]], part[1], part[0]);
								break;
							default:
								throw new Exception("invalid tagname");
							}
							tagName.attach(root);
							return tagName;
						});
					}
				}
				return x.childTagNames;
			} else {
				throw new Error("not implemented");
			}
		};

		this.expandChildrenByTagName = function Badgerfish$expandChildrenByTagName(tagName) {
			var x = properties.getPrivate(this);
			var tagname = tagName.getTagName();
			var i, bfish, children = x.children[tagname];
			if (!children) {
				children = x.children[tagname] = [];
			}
			if (x.source === x.object) {
				var childObjects = x.object[tagname];
				if (childObjects instanceof Array) {
					for (i = children.length; i < childObjects.length; ++i) {
						children[i] = new this.constructor([ tagName, childObjects[i] ], x.schema);
					}
					for (i = 0; i < childObjects.length; ++i) {
						bfish = children[i];
						properties.getPrivate(bfish).parent = this;
						properties.getPrivate(bfish).node = null;
					}
					for (i = childObjects.length; i < children.length; ++i) {
						children[i].destroy();
					}
					children.length = childObjects.length;
				} else {
					if (childObjects) {
						if (!children.length) {
							bfish = children[0] = new this.constructor([ tagName, childObjects ], x.schema);
						} else {
							bfish = children[0];
						}
						properties.getPrivate(bfish).parent = this;
						for (i = 1; i < children.length; ++i) {
							children[i].destroy();
						}
						children.length = 1;
					}
				}
			} else {
				var childNodes = [], childNodeList = this.nativeElementsByTagNameNS(tagName, true);
				for (i = 0; i < childNodeList.length; ++i) {
					if (childNodeList[i].parentNode === x.node) {
						childNodes.push(childNodeList[i]);
					}
				}
				for (i = children.length; i < childNodes.length; ++i) {
					children[i] = new this.constructor(childNodes[i], x.schema);
				}
				for (i = 0; i < childNodes.length; ++i) {
					bfish = children[i];
					properties.getPrivate(bfish).parent = this;
					properties.getPrivate(bfish).root = x.root;
					properties.getPrivate(bfish).object = null;
				}
				for (i = childNodes.length; i < children.length; ++i) {
					children[i].destroy();
				}
				children.length = childNodes.length;
			}
		};

		this.toNode = function Badgerfish$toNode(depth) {
			if (isNaN(depth))
				depth = Infinity;
			var self = this;
			var x = properties.getPrivate(this);
			if (x.source === x.node)
				return x.node;

			// initialize
			if (!x.node) {
				if (x.parent) {
					var y = properties.getPrivate(x.parent);
					x.node = x.tagName.createElement();
					y.node.appendChild(x.node);
				}
			}

			// copy attributes
			var attr = this.attr(true);
			x.source = x.node;
			this.attr(attr, true);
			x.source = x.object;

			// copy text content
			var text = this.getText();
			if (typeof text === "string") {
				if (x.children && x.children.length)
					throw new Exception("mixed nodes not supported");
				x.node.textContent = text;
			}

			// recursively handle child elements
			if (depth--) {
				this.getTagNames(true).forEach(function(tagname) {
					self.expandChildrenByTagName(tagname);
					var children = x.children[tagname.getTagName()];
					for (var i = 0; i < children.length; ++i) {
						children[i].toNode(depth);
					}
				});
			}
			return x.node;
		};

		this.toNodePromise = function Badgerfish$toNodePromise() {
			var x = properties.getPrivate(this);
			if (!x.nodePromise) {
				var node = this.toNode();
				DEBUG && expect(node).toBeDefined();
				x.nodePromise = Promise.create(node);
			}
			return x.nodePromise;
		};

		this.toNodeString = function Badgerfish$toNodeString() {
			return xmlSerializer.serializeToString(this.toNode());
		};

		this.toJSON = function Badgerfish$toJSON(depth) {
			if (isNaN(depth))
				depth = Infinity;
			var self = this, root = this.getDocumentElement();
			var x = properties.getPrivate(this);
			if (x.source === x.object)
				return x.object;

			// initialize
			if (!x.object)
				x.object = {};

			// copy attributes
			var attr = this.attr(root === this);
			x.source = x.object;
			this.attr(attr, true);
			x.source = x.node;

			// copy text content
			var text = this.getText();
			if (typeof text === "string") {
				x.object.$ = this.getText();
			}

			// x.schema.allowNode(x.node);

			// recursively handle child elements
			if (depth--) {
				var child = x.node.children;
				var byTagname = {};
				for (var i = 0; i < child.length; ++i) {
					var tagName = new TagName(child[i].namespaceURI, child[i].localName);
					tagName.attach(root);
					var tagname = tagName.getTagName();
					if (!byTagname[tagname])
						byTagname[tagname] = [];
					byTagname[tagname].push(child[i]);
				}
				Object.keys(byTagname).forEach(function(tagname) {
					var childNode = byTagname[tagname];
					var object = x.object[tagname];
					if (!object) {
						object = [];
					}
					if (!(object instanceof Array)) {
						object = [ object ];
					}
					var children = x.children[tagname];
					if (!children) {
						children = x.children[tagname] = [];
					}
					DEBUG && expect(children.length).toBe(object.length);
					for (i = 0; i < children.length; ++i) {
						if (properties.getPrivate(children[i]).node === childNode[i]) {
							children[i].toJSON(depth);
						} else {
							throw new Exception("not implemented");
						}
					}
					for (i = children.length; i < childNode.length; ++i) {
						var bfish = new Badgerfish(childNode[i], x.schema);
						var y = properties.getPrivate(bfish);
						y.parent = self;
						y.object = {};
						object.push(y.object);
						children.push(bfish);
						bfish.toJSON(depth);
					}
					for (i = childNode.length; i < children.length; ++i) {
						children[i].destroy();
					}
					if (object.length === 1) {
						x.object[tagname] = object[0];
					} else {
						DEBUG && expect(object.length).toBeGreaterThan(1);
						x.object[tagname] = object;
					}
				});
			}
			return x.object;
		};

		this.toJSONPromise = function Badgerfish$toJSONBadgerfish() {
			var x = properties.getPrivate(this);
			if (!x.jsonPromise) {
				x.jsonPromise = this.toNodePromise().then(function() {
					return this.toJSON();
				});
			}
		};

		this.toJSONString = function Badgerfish$toJSONString() {
			return JSON.stringify(this.toJSON());
		};

		this.toString =
		/**
		 * @param {boolean}
		 *            xml - set to true for XML text; JSON text is default
		 */
		function Badgerfish$toString(xml) {
			if (xml) {
				return this.toNodeString();
			} else {
				return this.toJSONString();
			}
		};

		this.isNode = function Badgerfish$isNode(entity) {
			return !!(entity && entity.ownerDocument);
		};

		this.isEmpty = function Badgerfish$isEmpty(entity) {
			if (entity.isNode()) {
				return !entity.hasAttributes() && !entity.hasChildNodes();
			} else {
				return Object.keys(entity).length === 0;
			}
		};

		this.isHTMLDocument = function Badgerfish$isHTMLDocument() {
			return properties.getPrivate(this).node.ownerDocument === GLOBAL.document;
		};

		this.createElements = function Badgerfish$createElements(tagname, amount, result) {
			var x = properties.getPrivate(this);
			if (!x.source)
				throw new Error("Badgerfish$createElements: cannot create elements while detached");
			if (!result)
				result = [];
			if (!result.offset)
				result.offset = 0;
			var tag = this.parseTagname(tagname);
			var i, offset = result.offset, ownerDocument = x.node.ownerDocument;
			for (i = 0; i < amount; ++i) {
				result[offset++] = ownerDocument.createElement(tag.tagname);
			}
			return result;
		};

		this.createChildren = function Badgerfish$createChildren(tagname, amount, result) {
			result = this.createElements(tagname, amount, result);
			var x = properties.getPrivate(this);
			var offset = result.offset;
			for (var i = 0; i < amount; ++i) {
				var element = result[offset++];
				x.node.appendChild(element);
			}
			return result;
		};

		this.createPrecedingSiblings = function Badgerfish$insertPrecedingSiblings(tagname, amount, result) {
			result = this.createElements(tagname, amount, result);
			var x = properties.getPrivate(this);
			var offset = result.offset;
			for (var i = 0; i < amount; ++i) {
				var element = result[offset++];
				x.node.parentNode.insertBefore(element, x.node);
				var aux = new Badgerfish(element, this, x.namespace);
				x.descendants.selected.push(aux);
			}
		};

		this.createFollowingSiblings = function Badgerfish$insertFollowingSiblings(tagname, amount, result) {
			result = this.createElements(tagname, amount, result);
			var x = properties.getPrivate(this);
			var offset = result.offset;
			for (var i = 0; i < amount; ++i) {
				var element = result[offset++];
				x.node.parentNode.insertBefore(element, x.node.nextElementSibling);
				var aux = new Badgerfish(element, this, x.namespace);
				x.descendants.selected.push(aux);
			}
		};

		this.assignPromise = function Badgerfish$assignPromise(promise) {
			var x = properties.getPrivate(this);
			delete x.source;
			delete x.jsonPromise;
			x.nodePromise = promise.then(function(xhr) {
				console.assert(xhr !== xhr);
			});
		};

		var assignBadgerfish = function Badgerfish$assignBadgerfish(bfish) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(bfish);
			var parent = x.node.parentNode;
			parent.replaceChild(y.node, x.node);
			x.node = y.node;
			x.object = y.object;
			x.source = y.source;
			bfish.destroy();
		};

		this.assign = function Badgerfish$assign(entity, tagname) {
			if (entity instanceof Badgerfish) {
				return assignBadgerfish.call(this, entity);
			}
			var x = properties.getPrivate(this);
			if (!x.source)
				throw new Error("Badgerfish$assign: assignment in detached state");
			delete x.nodePromise;
			delete x.jsonPromise;
			if (this.isNode(entity)) {
				delete x.object;
				x.source = entity;
				x.node.parentNode.replaceChild(entity, x.node);
				x.node = entity;
			} else {
				if (!tagname) {
					tagname = x.node.tagname;
				}
				if (!this.isEmpty(x.node)) {
					var node = this.createElements(tagname, 1);
					x.node.parentNode.replaceChild(node[0], x.node);
					x.node = node[0];
				}
				x.source = entity;
				x.object = entity;
			}
		};

		this.replaceWith = function Badgerfish$replaceWith(element) {
			var x = properties.getPrivate(this);
			x.node.parentNode.replaceChild(element, x.node);
			x.node = x.source = element;
		};

		this.nativeElementById =
		/**
		 * @param {string}
		 *            id
		 * @returns {Node}
		 */
		function Badgerfish$nativeElementById(id) {
			return properties.getPrivate(this).node.ownerDocument.getElementById(id);
		};

		this.getElementById =
		/**
		 * @param {string}
		 *            id
		 * @returns {Badgerfish}
		 */
		function Badgerfish$getElementById(id) {
			var element = this.nativeElementById(id);
			var result = this.getBadgerfish(element);
			if (!result) {
				result = new Badgerfish(element, this);
			}
		};

		this.nativeElementsByTagNameNS =
		/**
		 * @param {TagName}
		 *            tagName - fully qualified tag name
		 * @param {boolean}
		 *            [childAxis] - flag to search on child axis only instead of
		 *            all descendants
		 * @returns {NodeList}
		 */
		function Badgerfish$nativeElementsByTagNameNS(tagName, childAxis) {
			var tagname = tagName.getTagName();
			var x = properties.getPrivate(this);
			if (x.source === x.node) {
				if (this.isHTMLDocument()) {
					switch (childAxis) {
					default:
						return x.node.getElementsByTagName(tagname);
					}
				}
				switch (childAxis) {
				default:
					if (tagName.ns) {
						return x.node.getElementsByTagNameNS(tagName.ns, tagName.local);
					}
					return x.node.getElementsByTagName(tagName.local);
				}
			} else {
				var children = x.source[tagname];
				if (children) {
					return this.createChildren(tagname, children instanceof Array ? children.length : 1);
				} else {
					return [];
				}
			}
		};

		this.getElementsByTagName = function Badgerfish$getElementsByTagName(tagName, childAxis) {
			var tagname = tagName.getTagName();
			var x = properties.getPrivate(this);
			this.expandChildrenByTagName(tagName);
			return x.children[tagname];
		};
	}

	return class_Badgerfish;
});
