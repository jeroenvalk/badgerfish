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
define([ "./Exception" ], function(classException) {
	function class_Badgerfish(properties) {
		var Exception = properties.import([ classException ]);
		var domParser = new DOMParser();
		var xmlSerializer = new XMLSerializer();
		var badgerfish;

		var xmlToBfish = function Badgerfish$xmlToBfish(node) {
			var i, result = {}, text = [];
			var attr = node.attributes;
			var child = node.childNodes;
			for (i = 0; i < attr.length; ++i) {
				result['@' + attr[i].name] = attr[i].value;
			}
			for (i = 0; i < child.length; ++i) {
				switch (child[i].nodeType) {
				case 1:
					text = null;
					var name = child[i].localName;
					if (result[name] instanceof Array) {
						result[name].push(xmlToBfish(child[i]));
					} else {
						if (!result[name]) {
							result[name] = xmlToBfish(child[i]);
						} else {
							result[name] = [ result[name], xmlToBfish(child[i]) ];
						}
					}
					break;
				case 3:
					if (text instanceof Array) {
						text.push(child[i].textContent);
					}
					break;
				}
			}
			if (text) {
				result.$ = text.join("");
			}
			return result;
		};

		var synchronizeJSON = function Badgerfish$synchronizeJSON(namespace, node, depth) {
			var x = properties.getPrivate(this);
			var source = x.source;
			if (!(depth--) || source !== node) {
				return source;
			} else {
				if (x.object) {
					throw new Error("Badgerfish$synchronizeJSON: target not empty");
				}
				return (x.object = xmlToBfish(node));
			}
		};

		var Badgerfish = this.constructor =
		/**
		 * @param {Node|Object}
		 *            entity - XML node or JSON object
		 * @param {Badgerfish}
		 *            [parent] - parent that maintains the XML node
		 * @param {number}
		 *            [index] - index at which the entity occurs under the
		 *            tagname
		 * 
		 * @constructor
		 */
		function Badgerfish(entity, parent, index) {
			var y, source, node, object;
			if (entity.constructor === Object) {
				var tagname = null;
				for ( var prop in entity) {
					if (tagname)
						throw new Error("Badgerfish: multiple properties not allowed on entity");
					tagname = prop;
				}
				if (!tagname)
					throw new Error("Badgerfish: empty entity");
				source = object = entity[tagname];
				if (object instanceof Array) {
					if (object.length !== 1)
						throw new Error("Badgerfish: cardinality of entity must be one");
					object = object[0];
				}
				node = domParser.parseFromString([ "<", tagname, "/>" ].join(""), 'text/xml').documentElement;
			} else {
				DEBUG && expect(entity.ownerDocument).toBeDefined();
				source = node = entity;
				if (parent) {
					if (entity.constructor === Object)
						throw new Error("Badgerfish: descendants must be created from a node");
					if (!(parent instanceof Badgerfish))
						throw new Error("Badgerfish: parent must be instance of Badgerfish");
					if (typeof index !== "number")
						throw new Error("Badgerfish: index must be a number");
					y = properties.getPrivate(parent);
					if (y.source === y.object) {
						if (node.ownerDocument.documentElement !== node) {
							if (isNaN(index) || index < 0)
								throw new Error("Badgerfish: invalid index");
							source = node.tagName;
							if (y.source.hasOwnProperty(source)) {
								object = y.source[source];
								if (object instanceof Array) {
									object = object[index];
								}
								source = object;
							} else {
								throw new Error("Badgerfish: integrity error");
							}
						}
					}
				} else {
					if (entity.ownerDocument.documentElement !== entity)
						throw new Error("Badgerfish: root node must be on a documentElement");
				}
			}
			if (node.nodeType !== 1)
				throw new Error('Badgerfish: only elements can be decorated');
			var x = {
				root : node.ownerDocument.documentElement === node ? this : y.root,
				source : source,
				node : node,
				object : object,
				cache : {}
			};
			properties.setPrivate(this, x);
			if (this === x.root) {
				x.badgerfish = [];
				this.decorateRoot();
			}
			this.decorateNode();
		};

		this.destroy = function Badgerfish$destroy() {
			var x = properties.getPrivate(this);
			Object.keys(x).forEach(function(prop) {
				delete x[prop];
			});
		};

		this.getDocumentElement = function Badgerfish$getDocumentElement() {
			return properties.getPrivate(this).root;
		};

		this.getTagName = function Badgerfish$getTagName() {
			var x = properties.getPrivate(this);
			return x.node.ownerDocument === GLOBAL.document ? x.node.localName : x.node.tagName;
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

		this.moveTo = function Badgerfish$moveTo(target) {
			if (source.nodeType !== 1 || target.nodeType !== 1) {
				throw new Error("Badgerfish.moveNode: invalid argument; must be a DOM element");
			}
			var dest = target.ownerDocument;
			if (source.ownerDocument !== dest) {
				if (dest.importNode) {
					source = dest.importNode(source);
				} else {
					source = importNodeIE(dest, source);
				}
			}
			return source;
		};

		this.toNode = function Badgerfish$toNode(depth) {
			if (isNaN(depth))
				depth = Infinity;
			var self = this;
			var x = properties.getPrivate(this);
			if (x.source === x.node)
				return x.node;
			if (x.node.hasAttributes() || x.node.hasChildNodes()) {
				throw new Error("Badgerfish$synchronizeNode: target not empty");
			}
			var tagnames = Object.keys(x.source).filter(function(name) {
				if (name.charAt(0) === '@') {
					if (name === '@xmlns') {
						Object.keys(x.source[name]).forEach(function(prefix) {
							if (prefix === '$') {
								x.node.setAttribute("xmlns", x.source[name].$);
							} else {
								x.node.setAttribute([ name.slice(1), prefix ].join(":"), x.source[name][prefix])
							}
						});
					} else {
						x.node.setAttribute(name.slice(1), x.source[name]);
					}
					return false;
				}
				return true;
			});
			if (depth--) {
				tagnames.forEach(function(tagname) {
					var elements = x.source[tagname];
					if (!(elements instanceof Array)) {
						elements = [ elements ];
					}
					self.createChildren(tagname, elements.length).forEach(function(badgerfish, i) {
						badgerfish.assign(elements[i]);
						badgerfish.toNode(depth);
					});
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

		this.toJSON = function Badgerfish$toJSON() {
			var x = properties.getPrivate(this);
			if (!x.source)
				return null;
			return synchronizeJSON.call(this, x.namespace, x.node, Infinity);
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

		this.getTextContent = function Badgerfish$getTextContent() {
			var x = properties.getPrivate(this);
			if (x.source === x.object) {
				return x.object.$;
			} else {
				return x.node.textContent;
			}
		};

		this.getAttribute = function Badgerfish$getAttribute(name) {
			var x = properties.getPrivate(this);
			if (x.source === x.object) {
				return x.object['@' + name];
			} else {
				return x.node.getAttribute(name);
			}
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

		this.xnativeElementsByTagName =
		/**
		 * @param {string}
		 *            tagname
		 * @returns {NodeList}
		 */
		function Badgerfish$xnativeElementsByTagName(tagname) {
			var x = properties.getPrivate(this);
			var tag = this.parseTagname(tagname);
			if (this.isHTMLDocument()) {
				return x.node.getElementsByTagName(tag.tagname);
			}
			if (x.source === x.node) {
				try {
					return x.node.getElementsByTagNameNS(tag.ns, tag.local);
				} catch (e) {
					return x.node.getElementsByTagName(tag.tagname);
				}
			} else {
				var children = x.source[tag.tagname];
				if (children) {
					return this.createChildren(tag.tagname, children instanceof Array ? children.length : 1);
				} else {
					return [];
				}
			}
		};

		this.nativeElementsByTagNameNS =
		/**
		 * @param {TagName}
		 *            tagName - fully qualified tag name
		 * @param {boolean}
		 *            [childAxis] - flag to search on child axis only instead of all descendants
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
			if (!childAxis || !x.cache[tagname]) {
				x.cache[tagname] = [];
				var aux = this.nativeElementsByTagNameNS(tagName, childAxis);
				var result = new Array(aux.length);
				for (var i = 0; i < aux.length; ++i) {
					var node = aux[i];
					var parent = Badgerfish.getBadgerfishByNode(node.parentNode);
					if (!parent)
						parent = new (this.constructor)(node.parentNode, x.root, -1);

					var cache = properties.getPrivate(parent).cache;
					if (!cache[tagname]) {
						cache = cache[tagname] = [];
					} else {
						cache = cache[tagname];
					}
					result[i] = Badgerfish.getBadgerfishByNode(node);
					if (!result[i])
						result[i] = new (this.constructor)(node, parent, i);
					cache.push(result[i]);
				}
				if (!childAxis)
					return result;
			}
			DEBUG && expect(step.axis).not.toBe(Badgerfish.Axis.DESCENDANT);
			// TODO: support for other axis than child::
			DEBUG && expect(step.axis).toBe(Badgerfish.Axis.CHILD);
			return x.cache[tagname];			
		};
	}

	return class_Badgerfish;
});
