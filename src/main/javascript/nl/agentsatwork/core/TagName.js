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
define([ "./Exception" ], function(classException) {
	function class_TagName(properties) {
		var Exception = properties.import([ classException ]);

		this.constructor =
		/**
		 */
		function TagName(ns, local, prefix) {
			this.ns = ns;
			this.local = local;
			properties.setPrivate(this, {
				prefix : prefix
			});
		};

		this.getPrefix = function TagName$getPrefix() {
			return properties.getPrivate(this).prefix;
		};

		this.getTagName = function TagName$getTagName() {
			var prefix = this.getPrefix();
			return !prefix || prefix === "$" ? this.local : [ prefix, this.local ].join(":");
		};

		this.attach = function TagName$attach(bfish) {
			var x = properties.getPrivate(this);
			if (this.ns)
				x.prefix = bfish.getPrefixOfNS(this.ns);
			x.bfish = bfish;
		};

		this.createElement = function TagName$createElement() {
			var bfish = properties.getPrivate(this).bfish;
			if (!bfish)
				throw new Exception("must be attached to create elements");
			var doc = bfish.toNode(0).ownerDocument;
			return this.ns ? doc.createElementNS(this.ns, this.local) : doc.createElement(this.local);
		};
	}

	return class_TagName;
});
