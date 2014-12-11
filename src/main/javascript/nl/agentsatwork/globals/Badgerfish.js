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

/* globals define, DEBUG, expect */
/* jshint -W030 */
define({
	'nl.agentsatwork.globals.BadgerfishArray' : function class_BadgerfishArray(properties) {
		//var Badgerfish = definition.classOf('nl.agentsatwork.globals.Badgerfish');
		
		this.BadgerfishArray = function BadgerfishArray(nodes, condition) {
			for (var i = 0; i < nodes.length; ++i) {
				var node = new Badgerfish(nodes[i]);
				if (condition) {
					var x = condition.split('=');
					if (node.toJSON(x[0]) === x[1]) {
						this.push(node);
					}
				}
			}
		};
	},
	'nl.agentsatwork.globals.Badgerfish' : function class_Badgerfish(properties) {
		var BadgerfishArray = definition.classOf('nl.agentsatwork.globals.BadgerfishArray');

		var Badgerfish = this.Badgerfish =
		/**
		 * @param {Node|string}
		 *            node
		 * @param {Object}
		 *            [ns] - mapping of prefixes into their namespace
		 * 
		 * @constructor
		 */
		function Badgerfish(node) {
			properties.setPrivate(this, {
				node : node
			});
		};

		this.getElementById = function Badgerfish$getElementById(id) {
			return new Badgerfish(properties.getPrivate(this).node.getElementById(id));
		};

		this.getElementsByTagName = function Badgerfish$getElementsByTagName(step) {
			step = step.split("::");
			switch (step.length) {
			case 0:
				DEBUG && expect(false).toBe(true);
				break;
			case 1:
				step.unshift(null);
				break;
			}
			var aux = step[1].split("[");
			var nodes = properties.getPrivate(this).node.getElementsByTagName(aux[0]);
			switch (step[0]) {
			case ".":
			case "child":
				return new BadgerfishArray(nodes, aux[1], true);
			case null:
			case "descendant":
				return new BadgerfishArray(nodes, aux[1], true);
			default:
				DEBUG && expect(true).toBe(false);
				break;
			}
		};

		this.getElementsByTagNameNS = function Badgerfish$getElementsByTagNameNS(namespace, step) {
			var node = properties.getPrivate(this).node;
			if (node.ownerDocument === document) {
				return node.getElementsByTagName("XI:INCLUDE");
			} else {
				return node.getElementsByTagNameNS(namespace, step);
			}
		};

		this.getElementByTagName = function Badgerfish$getElementByTagName(xpath) {
			var node, nodes, path = xpath.split("/");
			var result = new Badgerfish();
			switch (path.length) {
			case 0:
				DEBUG && expect(false).toBe(true);
				break;
			case 1:
				nodes = this.getElementsByTagName(path[0]);
				switch (nodes.length) {
				case 0:
					throw new Error("not found");
				case 1:
					properties.getPrivate(result).node = nodes[0];
				default:
					throw new Error("not unique");
				}
				break;
			default:
				nodes = this.getElementsByTagName(path[0]);
				switch (nodes.length) {
				case 0:
					throw new Error("not found");
				case 1:
					properties.getPrivate(result).node = nodes[0];
					return nodes[0];
				default:
					throw new Error("not unique");
				}
				break;
			}
		};
	}
});
