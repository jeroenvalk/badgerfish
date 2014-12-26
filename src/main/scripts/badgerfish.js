/**
 * Copyright © 2014 dr. ir. Jeroen M. Valk
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

(function() {
	this.GLOBAL = this;
}).call(this);

GLOBAL.DEBUG = false;

GLOBAL.require([ '/javascript/nl/agentsatwork/globals/Definition.js' ], function(definition) {
	GLOBAL.definition = definition;
	GLOBAL.requirejs.config({
		baseUrl : "/",
		paths : {
			jquery : "lib/jquery",
			grammar_path : "../grammar_path"
		}
	});

	GLOBAL.require([ 'jquery', 'javascript/nl/agentsatwork/globals/Badgerfish', 'javascript/nl/agentsatwork/globals/Promise',
			'javascript/nl/agentsatwork/globals/Require' ], function(jQuery, Badgerfish, Promise, Require) {
		//GLOBAL.definition = definition;
		// definition.configure();
		//definition(Badgerfish);
		//definition(Promise);
		//definition(Require);
		if (!jQuery) jQuery = $;
		GLOBAL.require([ 'javascript/Context' ], function(Context) {

			var html = Context.getHTMLDocument().toNode();

			function transform(context, pipeline, callback) {
				if (pipeline.length === 0) {
					throw new Error("cannot transform an empty pipeline");
				}
				if (pipeline.length === 1) {
					context.transform(pipeline.shift(), function(result) {
						console.assert(pipeline.length === 0);
						callback(result);
					}, Context.getHTMLDocument());
				} else {
					context.transform(pipeline.shift(), function(result) {
						transform(result, pipeline, callback);
					});
				}
			}

			function executeCPX(prefixes, cpx, xi) {
				var nodes = html.getElementsByTagName(prefix + ":transform");

				for (var i = 0; i < nodes.length; ++i) {
					var node = nodes[i];
					var pipeline = [];
					for (var j = 0; j < node.children.length; ++j) {
						var child = node.children[j];
						if (child.localName === xi + ":include") {
							pipeline.push(Context.normalize(child.getAttribute("href")));
						}
					}
					Context.requireAll(pipeline, function() {
						var context = pipeline.shift();
						transform(context, pipeline, function(result) {
							node.parentNode.replaceChild(result.toNode(), node);
							var context = Context.getHTMLDocument();
							context.requireXIncludes(function() {
								context.resolveXIncludes();
								var i;
								var elements = jQuery("*[require]", result.toNode());
								var resources = [];
								for (i = 0; i < elements.length; ++i) {
									resources = resources.concat(elements[i].getAttribute("require").split(/\s*,\s*/));
								}
								require(resources, function() {
									var i;
									for (i = 0; i < arguments.length; ++i) {
										var classdef = arguments[i];
										if (classdef instanceof Function) {
											var fn = classdef;
											classdef = {};
											classdef['nl.agentsatwork.globals.' + fn.name.substr(fn.name.lastIndexOf("_") + 1)] = fn;
										}
										definition(classdef);
									}
									for (i = 0; i < elements.length; ++i) {
										var j;
										var chain = elements[i].getAttribute("chain");
										var F = new Function("return function " + chain.replace(/\./g, "_").replace(/:/g, "$") + "(){};")();
										F.prototype = definition.classOf(chain).prototype;
										var instance = new F();
										var qnames = chain.split(":");
										for (j = 0; j < qnames.length; ++j) {
											definition.classOf(qnames.slice(0, j + 1).join(":")).call(instance, elements[i]);
										}
									}
								});
								var nodes = document.getElementsByTagName("code");
								for (i = 0; i < nodes.length; ++i) {
									Prism.highlightElement(nodes[i]);
								}
							});
						});
					});
				}

			}

			var prefixes = {};

			var attr = html.attributes;
			for (var i = 0; i < attr.length; ++i) {
				if (attr[i].name.substr(0, 6) === "xmlns:") {
					prefixes[attr[i].name.substr(6)] = attr[i].value;
					switch (attr[i].value) {
					case "http://www.w3.org/2001/XInclude":
						xi = attr[i].name.substr(6);
						break;
					}
				}
			}

			for ( var prefix in prefixes) {
				switch (prefixes[prefix]) {
				case "http://www.agentsatwork.nl/2014/cpx":
					executeCPX(prefixes, prefix, xi);
					break;
				}
			}
		});
	});
});