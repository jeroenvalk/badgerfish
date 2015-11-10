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

/* global define, XMLHttpRequest */
define([ "./Badgerfish", "./Exception" ], function(classBadgerfish, classException) {
	function class_Element(properties) {
		var Exception = properties.import([ classException ]);
		properties.extends([ classBadgerfish ]);

		var Badgerfish = properties.import([ classBadgerfish ]);

		var xhrForRef = function Element$xhrForRef(ref) {
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

		var Element = this.constructor =
		/**
		 */
		function Element(entity, parent, index) {
			properties.getPrototype(1).constructor.call(this, entity, parent, index);
			var xmlns = {};
			if (entity.constructor === Object) {
				xmlns = entity[this.getTagName()]['@xmlns'];
			} else {
				var attr = entity.attributes;
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
			var x = {
				cache : {}
			};
			properties.setPrivate(this, x);
			if (this === this.getDocumentElement()) {
				x.baseUrl = '/';
				x.parent = parent;
				x.namespace = {};
				x.prefix = {};
				x.includes = [];
			}
			this.registerNamespaces(xmlns);
		};

		this.qnameXInclude = function Element$qnameXInclude() {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(this.getDocumentElement());
			if (y.namespace.hasOwnProperty("xi"))
				return "xi:include";
			else
				return null;
		};

		this.registerNamespaces =
		/**
		 * @param {Object}
		 *            xmlns - mapping of prefixes into namespace URIs
		 * @private
		 */
		function Element$registerNamespaces(xmlns) {
			for ( var prefix in xmlns) {
				if (xmlns.hasOwnProperty(prefix)) {
					this.registerNamespace(prefix, xmlns[prefix]);
				}
			}
		};

		this.registerNamespace = function Element$registerNamespace(prefix, ns) {
			var x = properties.getPrivate(this);
			if (this === this.getDocumentElement()) {
				if ((x.namespace[prefix] && x.namespace[prefix] !== ns) || (x.prefix[ns] && x.prefix[ns] !== prefix)) {
					throw new Error("Element$registerNamespace: namespace conflict");
				}
				x.namespace[prefix] = ns;
				x.prefix[ns] = prefix;
			}
		};

		this.parseTagname = function Element$parseTagname(tagname) {
			var x = properties.getPrivate(this);
			var y = properties.getPrivate(this.getDocumentElement());
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
					throw new Error("Element$parseTagname: namespace not registered");
				}
			}
			return {
				tagname : tagname,
				local : local,
				prefix : prefix,
				ns : ns
			};
		};

		this.parseStep = function Element$parseStep(step) {
			var i = step.lastIndexOf("::", 20);
			i = i < 0 ? 0 : i + 2;
			var j = step.indexOf("[", i);
			j = j < 0 ? step.length : j;
			var result = this.parseTagname(step.substring(i, j));
			result.axis = !!i;
			return result;
		};

		this.parsePath = function Element$parsePath(path) {
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

		this.baseUrl = function Element$baseUrl() {
			return properties.getPrivate(this.getDocumentElement()).baseUrl;
		};

		this.getParent = function Element$getParent() {
			var x = properties.getPrivate(this);
			if (this.getDocumentElement() === this) {
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

		this.getElementsByTagName =
		/**
		 * @param {string}
		 *            path
		 * @returns {Array<Badgerfish>}
		 */
		function Element$getElementsByTagName(path) {
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
				// var aux = self.nativeElementsByTagName(step.tagname);
				var aux = self.nativeElementsByTagNameNS(step.ns, step.local, step.axis, step.prefix);
				var result = new Array(aux.length);
				for (var i = 0; i < aux.length; ++i) {
					var node = aux[i];
					var parent = Badgerfish.getBadgerfishByNode(node.parentNode);
					if (!parent)
						parent = new Element(node.parentNode, x.root, -1);

					var cache = properties.getPrivate(parent).cache;
					if (!cache[step.tagname]) {
						cache = cache[step.tagname] = [];
					} else {
						cache = cache[step.tagname];
					}
					result[i] = Badgerfish.getBadgerfishByNode(node);
					if (!result[i])
						result[i] = new Element(node, parent, i);
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
		function Element$getElementByTagName(path) {
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
				throw new Error("Element$getElementByTagName: not found");
			case 1:
				return result[0];
			default:
				throw new Error("Element$getElementByTagName: not unique");
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
		function Element$getElementsByTagNameNS(xmlns, path, forced) {
			if (!(xmlns instanceof Object))
				xmlns = {
					"$" : xmlns
				};
			var x = properties.getPrivate(this);
			if (!forced) {
				var prefixes = properties.getPrivate(this.getDocumentElement()).prefix;
				if (!prefixes)
					prefixes = {};
				var prefix = Object.keys(xmlns).find(function(prefix) {
					return !prefixes[xmlns[prefix]];
				});
				if (prefix)
					throw new Exception("namespace '" + xmlns[prefix] + "' not declared in documentElement");
			}
			this.getDocumentElement().registerNamespaces(xmlns);
			return this.getElementsByTagName(path);
		};

		this.select = function Element$select(path) {
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

		this.require = function Element$require(references) {
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
						x.include = new Element(responseXML.documentElement, self, NaN);
						properties.getPrivate(x.include).baseUrl = href.substr(0, href.lastIndexOf('/') + 1);
						return x.include;
					}
				});
			}
		};

		this.resolve = function Element$resolve() {
			if (this.getTagName() === 'xi:include') {
				var x = properties.getPrivate(this);
				if (this.getElementByTagName("@parse") === "text") {
					if (typeof x.include !== "string") {
						throw new Error("Element$resolve: @parse=text requires string include");
					}
				}
				this.assign(x.include);
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

		this.resolveXIncludes = function Element$resolveXIncludes() {
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

		this.transform = function Element$transform() {
			var x = properties.getPrivate(this);
			var pipeline = this.getElementsByTagName(this.qnameXInclude());
			var result = properties.getPrivate(pipeline.shift()).include;
			result.resolveXIncludes();
			result = result.toNode().ownerDocument;
			var node = this.toNode();
			var target = node.ownerDocument;
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
			this.replaceWith(result.firstChild);
		};

	}

	return class_Element;
});