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

/* global Modernizr, define, document, $, Prism */
/* jshint -W054 */
(function() {
	this.GLOBAL = this;
}).call(this);

GLOBAL.DEBUG = false;

GLOBAL.requirejs.config({
	baseUrl : "/",
	paths : {
		jquery : "lib/jquery",
		grammar_path : "../grammar_path"
	}
});

GLOBAL.require([ '/scripts/shims.js', 'jquery' ], function(definition, jQuery) {
	if (!jQuery)
		jQuery = $;

	GLOBAL.definition = definition;
	Modernizr.ready(function() {
		GLOBAL.require([ 'javascript/nl/agentsatwork/globals/Require', 'javascript/nl/agentsatwork/globals/Badgerfish' ], function() {
			var Badgerfish = define.classOf("Require:Badgerfish");
			var html = new Badgerfish(document.documentElement);

			function executeCPX(prefixes, cpx) {
				var context = html.getElementByTagName("body/" + cpx + ":transform");
				context.requireXIncludes().then(function() {
					context.transform();
					var i;
					var elements = jQuery("*[require]", context.toNode());
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
							define.register(classdef);
						}
						for (i = 0; i < elements.length; ++i) {
							var j;
							var chain = elements[i].getAttribute("chain");
							var F = new Function("return function " + chain.replace(/\./g, "_").replace(/:/g, "$") + "(){};")();
							F.prototype = define.classOf(chain).prototype;
							var instance = new F();
							var qnames = chain.split(":");
							for (j = 0; j < qnames.length; ++j) {
								define.classOf(qnames.slice(0, j + 1).join(":")).call(instance, elements[i]);
							}
						}
					});
					var nodes = document.getElementsByTagName("code");
					for (i = 0; i < nodes.length; ++i) {
						Prism.highlightElement(nodes[i]);
					}
				});
			}
			executeCPX(null, "cpx", "xi");
		});
	});
});