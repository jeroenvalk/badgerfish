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

/* global define, DEBUG, expect, XMLHttpRequest */
/* jshint -W030 */
define(function() {
	function class_Require() {

		this.constructor = function Require() {

		};

		var xhrForRef = function Promise$xhrForRef(ref) {
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

		this.require =
		/**
		 * @param {Array}
		 *            references
		 * @param {Function}
		 *            callback
		 */
		function Require$require(references) {
			if (references) {
				return references.map(xhrForRef);
			}

		};
	}
	return class_Require;
});
