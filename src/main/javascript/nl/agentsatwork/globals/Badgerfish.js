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

/* globals define, DEBUG, expect, DOMParser, XMLSerializer, XMLHttpRequest */
/* jshint -W030 */
define([ "./Exception" ], function(classException) {
	function class_Badgerfish(properties) {
		var Exception = properties.import([ classException ]);
		var domParser = new DOMParser();
		var xmlSerializer = new XMLSerializer();
		var badgerfish;

		var xhrForRef = function Badgerfish$xhrForRef(ref) {
			return new Promise(function(done) {
				var xhr, ext, i, j;
				i = ref.indexOf(".");
				if (i < 0)
					throw new Error("Definition: missing filename extension");
				while ((j = ref.indexOf(".", ++i)) >= 0)
					i = j;
				ext = ref.substr(--i);
				xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4 && xhr.status === 200) {
						switch (ext) {
						case ".xml":
							DEBUG && expect(xhr.getResponseHeader('content-type')).toBe("application/xml");
							break;
						default:
							break;
						}
						done(xhr);
					}
				};
				xhr.open("GET", ref, true);
				xhr.responseType = "msxml-document";
				xhr.send();
			});
		};

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
			var y, source, node, object, xmlns = {};
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
				xmlns = object['@xmlns'];
				var parts = [];
				for ( var prefix in xmlns) {
					if (prefix === "$") {
						parts.push(' xmlns="' + xmlns.$ + '"');
					} else {
						parts.push(' xmlns:' + prefix + '="' + xmlns[prefix] + '"');
					}
				}
				node = domParser.parseFromString([ "<", tagname, parts.join(""), "/>" ].join(""), 'text/xml').documentElement;
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
				var attr = node.attributes;
				if (attr) {
					for (var i = 0; i < attr.length; ++i) {
						var name = attr[i].name;
						if (!name.lastIndexOf("xmlns", 0)) {
							if (name.charAt(5) === ':') {
								xmlns[attr[i].name.substr(6)] = attr[i].value;
							} else {
								xmlns.$ = attr[i].value;
							}
						}
					}
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
				x.baseUrl = '/';
				x.namespace = {};
				x.parent = parent;
				x.prefix = {};
				x.badgerfish = [];
				x.includes = [];
				this.decorateRoot();
			}
			this.decorateNode();
			this.registerNamespaces(xmlns);
		};

		this.destroy = function Badgerfish$destroy() {
			var x = properties.getPrivate(this);
			Object.keys(x).forEach(function(prop) {
				delete x[prop];
			});
		};

		this.baseUrl = function Badgerfish$baseUrl() {
			return properties.getPrivate(properties.getPrivate(this).root).baseUrl;
		};

		this.getTagName = function Badgerfish$getTagName() {
			var x = properties.getPrivate(this);
			return x.node.ownerDocument === GLOBAL.document ? x.node.localName : x.node.tagName;
		};

		this.qnameXInclude = function Badgerfish$qnameXInclude() {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(x.root);
			if (y.namespace.hasOwnProperty("xi"))
				return "xi:include";
			else
				return null;
		};

		this.require = function Badgerfish$require(references) {
			if (references) {
				return properties.getPrototype(1).require.call(this, references);
			} else {
				if (this.getTagName() !== this.qnameXInclude()) {
					return Promise.resolve(this);
				}
				var self = this;
				var href = self.getElementByTagName('@href');
				if (href.charAt(0) !== '/') {
					href = this.baseUrl() + href;
				}
				return xhrForRef(href).then(function(xhr) {
					var x = properties.getPrivate(self);
					if (self.getElementByTagName('@parse') === 'text') {
						x.include = xhr.responseText;
						return self;
					} else {
						var responseXML = xhr.responseXML;
						if (!responseXML) {
							responseXML = domParser.parseFromString(xhr.responseText, "application/xml");
						}
						x.include = new Badgerfish(responseXML.documentElement, self, NaN);
						properties.getPrivate(x.include).baseUrl = href.substr(0, href.lastIndexOf('/') + 1);
						return x.include;
					}
				});
			}
		};

		this.resolve = function Badgerfish$resolve() {
			if (this.getTagName() === 'xi:include') {
				var x = properties.getPrivate(this);
				if (this.getElementByTagName("@parse") === "text") {
					if (typeof x.include !== "string") {
						throw new Error("Badgerfish$resolve: @parse=text requires string include");
					}
				}
				this.assign(x.include);
			}
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

		this.registerNamespaces =
		/**
		 * @param {Object}
		 *            xmlns - mapping of prefixes into namespace URIs
		 * @private
		 */
		function Badgerfish$registerNamespaces(xmlns) {
			for ( var prefix in xmlns) {
				if (xmlns.hasOwnProperty(prefix)) {
					this.registerNamespace(prefix, xmlns[prefix]);
				}
			}
		};

		this.registerNamespace = function Badgerfish$registerNamespace(prefix, ns) {
			var x = properties.getPrivate(this);
			if (this === x.root) {
				if ((x.namespace[prefix] && x.namespace[prefix] !== ns) || (x.prefix[ns] && x.prefix[ns] !== prefix)) {
					throw new Error("Badgerfish$registerNamespace: namespace conflict");
				}
				x.namespace[prefix] = ns;
				x.prefix[ns] = prefix;
			}
		};

		this.toNode = function Badgerfish$toNode(depth) {
			if (isNaN(depth))
				depth = Infinity;
			var self = this;
			var x = properties.getPrivate(this);
			if (x.source) {
				if (!(depth--) || x.source === x.node) {
					return x.source;
				} else {
					if ((x.node.hasAttributes() && x.root !== this) || x.node.hasChildNodes()) {
						throw new Error("Badgerfish$synchronizeNode: target not empty");
					}
					this.registerNamespaces(x.source['@xmlns']);
					var tagnames = Object.keys(x.source).filter(function(name) {
						if (name.charAt(0) === '@') {
							x.node.setAttribute(name.slice(1), x.source[name]);
							return false;
						}
						return true;
					});
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
					return x.node;
				}
			}
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

		this.parseTagname = function Badgerfish$parseTagname(tagname) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(x.root);
			var index = tagname.lastIndexOf(":");
			if (index < 0)
				return {
					tagname : tagname,
					local : tagname,
					ns : y.namespace.$
				};
			var prefix = tagname.substr(0, index);
			var local = tagname.substr(++index);
			var ns = y.namespace[prefix];
			if (!ns) {
				ns = prefix;
				prefix = x.prefix[ns];
				if (prefix) {
					tagname = prefix + ":" + local;
				} else {
					throw new Error("Badgerfish$parseTagname: namespace not registered");
				}
			}
			return {
				tagname : tagname,
				local : local,
				prefix : prefix,
				ns : ns
			};
		};

		this.parseStep = function Badgerfish$parseStep(step) {
			step = step.split("::");
			switch (step.length) {
			case 1:
				return this.parseTagname(step[0]);
			case 2:
				break;
			default:
				throw new Error("Badgerfish$parseStep: syntax error");
			}
			var result = this.parseTagname(step[1]);
			result.axis = true;
			return result;
		};

		this.parsePath = function Badgerfish$parsePath(path) {
			var self = this;
			var step = path.split('/');
			switch (step.length) {
			case 1:
				return self.parseStep(step[0]);
			default:
				return step.map(function(step) {
					return self.parseStep(step);
				});
			}
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

		this.getParent = function Badgerfish$getParent() {
			var x = properties.getPrivate(this);
			if (x.root === this) {
				if (x.parent) {
					var y = properties.getPrivate(x.parent);
					if (y.include !== this) {
						throw new Error("Badgerfish.getParent: parent should be <xi:include>");
					}
					return x.parent;
				} else {
					return null;
				}
			} else {
				// TODO: implement this
				throw new Error("not implemented");
			}
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

		this.nativeElementsByTagName =
		/**
		 * @param {string}
		 *            tagname
		 * @returns {NodeList}
		 */
		function Badgerfish$nativeElementsByTagName(tagname) {
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
		 * @param {string}
		 *            ns
		 * @param {string}
		 *            name
		 * @returns {NodeList}
		 */
		function Badgerfish$nativeElementsByTagNameNS(ns, name) {
			return this.nativeElementsByTagName(ns + ":" + name);
		};

		this.getElementsByTagName =
		/**
		 * @param {string}
		 *            path
		 * @returns {Array<Badgerfish>}
		 */
		function Badgerfish$getElementsByTagName(path) {
			var self = this, index = path.lastIndexOf("/");
			if (index >= 0)
				self = self.getElementByTagName(path.substr(0, index));
			var step = self.parseStep(path.substr(++index));
			switch (step.tagname.charAt(0)) {
			case '$':
			case '@':
				throw new Error("Badgerfish.getElementsByTagName: invalid step: " + step.tagname);
			}
			var x = properties.getPrivate(self);
			if (!step.axis || !x.cache[step.tagname]) {
				x.cache[step.tagname] = [];
				var aux = self.nativeElementsByTagName(step.tagname);
				var result = new Array(aux.length);
				for (var i = 0; i < aux.length; ++i) {
					var node = aux[i];
					var parent = Badgerfish.getBadgerfishByNode(node.parentNode);
					if (!parent)
						parent = new Badgerfish(node.parentNode, x.root, -1);

					var cache = properties.getPrivate(parent).cache;
					if (!cache[step.tagname]) {
						cache = cache[step.tagname] = [];
					} else {
						cache = cache[step.tagname];
					}
					result[i] = Badgerfish.getBadgerfishByNode(node);
					if (!result[i])
						result[i] = new Badgerfish(node, parent, i);
					cache.push(result[i]);
				}
				if (!step.axis)
					return result;
			}
			DEBUG && expect(step.axis).not.toBe(Badgerfish.Axis.DESCENDANT);
			// TODO: support for other axis than child::
			DEBUG && expect(step.axis).toBe(Badgerfish.Axis.CHILD);
			return x.cache[step.tagname];
		};

		this.getElementByTagName =
		/**
		 * @param {string}
		 *            path
		 * @returns {Badgerfish}
		 */
		function Badgerfish$getElementByTagName(path) {
			path = path.split("/");
			var result;
			switch (path.length) {
			case 1:
				break;
			default:
				result = this;
				for (var i = 0; i < path.length; ++i) {
					result = result.getElementByTagName(path[i]);
				}
				return result;
			}
			var step = this.parseStep(path[0]);
			// TODO: use axis
			switch (step.tagname.charAt(0)) {
			case '@':
				result = [ this.getAttribute(step.tagname.substr(1)) ];
				break;
			case '$':
				result = [ this.getTextContent() ];
				break;
			default:
				var x = properties.getPrivate(this);
				if (!x.cache[step.tagname]) {
					this.getElementsByTagName(path[0]);
				}
				result = x.cache[step.tagname];
				break;
			}
			switch (result.length) {
			case 0:
				throw new Error("Badgerfish$getElementByTagName: not found");
			case 1:
				return result[0];
			default:
				throw new Error("Badgerfish$getElementByTagName: not unique");
			}
		};

		this.getElementsByTagNameNS =
		/**
		 * Badgerfish.getElementsByTagNameNS
		 * 
		 * Gets namespace descandants for defined namespaces. By default, the
		 * defined namespaces must be declared in the root of the document or an
		 * exception is thrown (see forced parameter).
		 * 
		 * @param {string|Object}
		 *            xmlns - defined namespaces to interpret in the xpath
		 * @param {string}
		 *            path - xpath with namespace steps in defined namespaces
		 * @param {boolean}
		 *            [forced] - return results even if some namespaces are not
		 *            declared
		 */
		function Badgerfish$getElementsByTagNameNS(xmlns, path, forced) {
			if (!(xmlns instanceof Object))
				xmlns = {
					"$" : xmlns
				};
			var x = properties.getPrivate(this);
			if (!forced) {
				var prefixes = properties.getPrivate(x.root).prefix;
				if (!prefixes)
					prefixes = {};
				var prefix = Object.keys(xmlns).find(function(prefix) {
					return !prefixes[xmlns[prefix]];
				});
				if (prefix)
					throw new Exception("namespace '" + xmlns[prefix] + "' not declared in documentElement");
			}
			x.root.registerNamespaces(xmlns);
			return this.getElementsByTagName(path);
		};

		this.select = function Badgerfish$select(path) {
			var index = path.lastIndexOf("/");
			switch (path.charAt(++index)) {
			case '@':
			case '$':
				return this.getElementByTagName(path);
			default:
				return this.getElementsByTagName(path).map(function(badgerfish) {
					return badgerfish.toJSON();
				});
			}
		};

		this.requireXIncludes = function Context$requireXIncludes(callback) {
			var self = this;
			var nodes = self.getElementsByTagNameNS({
				xi : "http://www.w3.org/2001/XInclude"
			}, "xi:include", true);
			if (self.getTagName() === self.qnameXInclude())
				nodes.unshift(self);
			return Promise.all(nodes.map(function(bfish) {
				return bfish.require().then(function(include) {
					if (bfish === include) {
						return bfish;
					} else {
						return include.requireXIncludes();
					}
				});
			})).then(function(includes) {
				var x = properties.getPrivate(self);
				x.includes = includes;
				if (callback)
					callback.call(self);
				return self;
			});
		};

		this.resolveXIncludes = function Badgerfish$resolveXIncludes() {
			var x = properties.getPrivate(this);
			var nodes = this.getElementsByTagNameNS({
				xi : "http://www.w3.org/2001/XInclude"
			}, "xi:include", true);
			if (nodes.length < x.includes.length)
				nodes.unshift(this);
			x.includes.forEach(function(bfish) {
				bfish.resolveXIncludes();
			});
			nodes.forEach(function(node) {
				node.resolve();
			});
		};

		this.transform = function Badgerfish$transform() {
			var x = properties.getPrivate(this);
			var pipeline = this.getElementsByTagName(this.qnameXInclude());
			var result = properties.getPrivate(pipeline.shift()).include;
			result.resolveXIncludes();
			result = result.toNode().ownerDocument;
			var target = x.node.ownerDocument;
			pipeline.forEach(function(bfishXSL) {
				var xsl = properties.getPrivate(bfishXSL).include.toNode().ownerDocument;
				if (window.ActiveXObject || "ActiveXObject" in window) {
					var s = new XMLSerializer();
					var xslt = new ActiveXObject("Msxml2.XSLTemplate");
					var xslDoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");
					xslDoc.loadXML(s.serializeToString(y.node.ownerDocument));
					xslt.stylesheet = xslDoc;
					var xslProc = xslt.createProcessor();
					xslProc.input = x.node.ownerDocument;
					xslProc.transform();
					result = xslProc.output;
					// result =
					// x.node.ownerDocument.transformNode(y.node.ownerDocument);
				}
				// code for Chrome, Firefox, Opera, etc.
				else if (document.implementation && document.implementation.createDocument) {
					var xsltProcessor = new XSLTProcessor();
					xsltProcessor.importStylesheet(xsl);
					if (target) {
						result = xsltProcessor.transformToFragment(result, target);
					} else {
						result = xsltProcessor.transformToDocument(x.node.ownerDocument);
					}
				}
				console.assert(result.childNodes.length === 1);
			});
			x.node.parentNode.replaceChild(result.firstChild, x.node);
			x.node = x.source = result.firstChild;
		};

	}

	return class_Badgerfish;
});
