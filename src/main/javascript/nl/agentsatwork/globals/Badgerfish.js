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

/* globals define, definition, DEBUG, expect, document, DOMParser, XMLSerializer */
/* jshint -W030 */
define([ 'javascript/nl/agentsatwork/globals/Promise' ], function() {
	function class_Badgerfish(properties) {
		var Promise = definition.classOf("nl.agentsatwork.globals.Promise");
		var xmlSerializer = new XMLSerializer();
		var badgerfish;

		var synchronizeJSON = function Badgerfish$synchronizeJSON(namespace, node, depth) {
			var badgerfish = node.badgerfish;
			if (badgerfish) {
				var source = badgerfish.source;
				if (!(depth--) || source !== node) {
					return source;
				} else {
					var object = badgerfish.object;
					if (!object) {
						object = badgerfish.object = {};
					}
					if (Object.keys(object).length) {
						throw new Error("Badgerfish$synchronizeJSON: target not empty");
					}
					console.assert(false);
				}
			}
		};

		var Badgerfish = this.constructor =
		/**
		 * @param {Node}
		 *            node - XML node in which to synchronize the JSON object
		 * @param {Badgerfish}
		 *            [parent] - parent that maintains the XML node
		 * @param {Object}
		 *            [xmlns] - mapping of prefixes into their namespace
		 * 
		 * @constructor
		 */
		function Badgerfish(node, parent, xmlns) {
			if (node.badgerfish) {
				throw new Error("Badgerfish: node already decorated");
			}
			var x = {
				root : parent ? properties.getPrivate(parent).root : this,
				source : node,
				node : node,
				cache : {}
			};
			properties.setPrivate(this, x);
			if (this === x.root) {
				x.namespace = {};
				x.prefix = {};
				x.badgerfish = [];
				x.includes = [];
			}

			var y = properties.getPrivate(x.root);
			var index = y.badgerfish.length;
			y.badgerfish.push(this);
			node['@'] = function Badgerfish$at(root) {
				if (badgerfish !== null)
					throw new Error("Badgerfish: integrity violation");
				if (root && root !== x.root)
					throw new Error("Badgerfish: foreign node");
				badgerfish = y.badgerfish[index];
			};

			var attr = node.attributes;
			for (var i = 0; i < attr.length; ++i) {
				if (attr[i].name.substr(0, 6) === "xmlns:") {
					this.registerNamespace(attr[i].name.substr(6), attr[i].value);
				}
			}
			this.registerNamespaces(xmlns);
		};

		this.getBadgerfish = function Badgerfish$getBadgerfish(node) {
			if (!node['@'])
				return null;
			badgerfish = null;
			node['@'](properties.getPrivate(this).root);
			return badgerfish;
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
					if (x.node.hasAttributes() || x.node.hasChildNodes()) {
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
			return properties.getPrivate(this).node.ownerDocument === document;
		};

		this.parseTagname = function Badgerfish$parseTagname(tagname) {
			var x = properties.getPrivate(this);
			var index = tagname.lastIndexOf(":");
			if (index < 0)
				return {
					tagname : tagname,
					local : tagname
				};
			var prefix = tagname.substr(0, index);
			var local = tagname.substr(++index);
			var ns = x.namespace[prefix];
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
			if (tag.ns) {
				for (i = 0; i < amount; ++i) {
					result[offset++] = ownerDocument.createElementNS(tag.ns, tag.local);
				}
			} else {
				for (i = 0; i < amount; ++i) {
					result[offset++] = ownerDocument.createElement(tag.tagname);
				}
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
				var aux = new Badgerfish(element, this, x.namespace);
				x.descendants.selected.push(aux);
			}
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

		this.assign = function Badgerfish$assign(entity, tagname) {
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
			return x.node.getElementsByTagNameNS(tag.ns, tag.local);
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
			var x = properties.getPrivate(self);
			if (!step.axis || !x.cache[step.tagname]) {
				x.cache[step.tagname] = [];
				var aux = self.nativeElementsByTagName(step.tagname);
				var result = new Array(aux.length);
				for (var i = 0; i < aux.length; ++i) {
					var node = aux[i];
					var parent = node.parentNode;
					badgerfish = null;
					if (parent['@']) {
						parent['@']();
					} else {
						badgerfish = new Badgerfish(parent, x.root);
					}
					parent = badgerfish;

					var cache = properties.getPrivate(parent).cache;
					if (!cache[step.tagname]) {
						cache = cache[step.tagname] = [];
					} else {
						cache = cache[step.tagname];
					}
					badgerfish = null;
					if (node['@']) {
						node['@']();
					} else {
						badgerfish = new Badgerfish(node, parent);
					}
					cache.push(badgerfish);
					result[i] = badgerfish;
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
			var x = properties.getPrivate(this);
			var step = this.parseStep(path[0]);
			// TODO: use axis
			switch (step.tagname.charAt(0)) {
			case '@':
				result = [ x.node.getAttribute(step.tagname.substr(1)) ];
				break;
			case '$':
				result = [ x.node.innerText ];
				break;
			default:
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
		 * @param {string|Object}
		 *            xmlns
		 * @param {string}
		 * path @
		 */
		function Badgerfish$getElementsByTagNameNS(xmlns, path) {
			if (!(xmlns instanceof Object))
				xmlns = {
					"$" : xmlns
				};
			var x = properties.getPrivate(this);
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
			function Context$requireXIncludes$closure(done) {
				var x = properties.getPrivate(self);
				var nodes = self.getElementsByTagNameNS({
					xi : "http://www.w3.org/2001/XInclude"
				}, "xi:include");
				if (nodes.length > 0) {
				var modules = [];
				for (var i = 0; i < nodes.length; ++i) {
					modules.push(nodes[i].select("@href"));
				}
				x.includes = [];
				Promise.when.apply(Promise, self.require(modules)).done(function(argvv) {
					var argv = argvv;
					if (!(argvv instanceof Array)) {
						argv = arguments;
					}
					for (var i = 0; i < argv.length; ++i) {
						if (nodes[i].select("@parse") === "text") {
							x.includes.push(argv[i].responseText);
						} else {
							var responseXML = argv[i].responseXML;
							if (!responseXML) {
								responseXML = new DOMParser().parseFromString(argv[i].responseText, "application/xml");
							}
							x.includes.push(new Badgerfish(responseXML.documentElement, self));
						}
					}
					done(self);
				});
				} else {
					callback();
				}
			}
			var result = Promise.when(Context$requireXIncludes$closure);
			result.done(function(value) {
				callback.call(value);
			});
			return result;
		};

		this.resolveXIncludes = function Context$resolveXIncludes() {
			var x = properties.getPrivate(this);
			var nodes = this.nativeElementsByTagNameNS("http://www.w3.org/2001/XInclude", "include");
			console.assert(x.includes.length === nodes.length);
			for (var i = 0; i < x.includes.length; ++i) {
				if (nodes[0].getAttribute("parse") === "text") {
					var parent = nodes[0].parentNode;
					parent.removeChild(nodes[0]);
					parent.innerText = x.includes[i];
				} else {
					nodes[0].parentNode.replaceChild(x.includes[i].toNode(), nodes[0]);
				}
			}
			console.assert(nodes.length === 0);
		};
	}

	return class_Badgerfish;
});
