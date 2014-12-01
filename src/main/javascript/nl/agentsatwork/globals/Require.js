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

/* global definition, DEBUG, expect, XMLHttpRequest */
/* jshint -W030 */
definition('nl.agentsatwork.globals', function class_Require() {
	var createArray = this.createArray =
	/**
	 * @param {number}
	 *            size - size of array to be created
	 */
	function static_Definition$createArray(size) {
		return Array.apply(null, new Array(size));
	};

	this.require =
	/**
	 * @param {Array}
	 *            references
	 * @param {Function}
	 *            callback
	 */
	function Require$require(references, callback) {
		var result;

		var Promise =
		/**
		 * @param {Number}
		 *            i - index of the reference to be promised
		 * @constructor
		 */
		function Definition$require$promise(i) {
			this.done = function Definition$require$promise$done(success, failure) {
				if (result[i] instanceof Array) {
					result[i].push([ success, failure ]);
				} else {
					success(result[i]);
				}
			};
		};

		var url = {}, promises;
		if (references instanceof Array) {
			promises = [];
			references.forEach(function(ref, i) {
				promises.push(new Promise(i));
				url[ref] = ref;
			});
		} else {
			promises = {};
			url = references;
			references = Object.keys(url);
			references.forEach(function(ref, i) {
				promises[ref] = new Promise(i);
			});
		}
		result = createArray(references.length).map(function() {
			return [];
		});
		var counter = 0;
		references.forEach(function(ref, index) {
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
					DEBUG && expect(result[index] instanceof Array).toBe(true);
					switch (ext) {
					case ".xml":
						DEBUG && expect(xhr.getResponseHeader('content-type')).toBe("application/xml");
						result[index].forEach(function(handler) {
							handler[0].call(null, xhr.responseXML);
						});
						result[index] = xhr.responseXML;
						break;
					default:
						result[index].forEach(function(handler) {
							handler[0].call(null, xhr.responseText);
						});
						result[index] = xhr.responseText;
						break;
					}
					DEBUG && expect(counter).toBeGreaterThan(0);
					if (!--counter && callback) {
						callback.apply(null, result);
					}
				}
			};
			++counter;
			xhr.open("GET", url[ref], true);
			xhr.send();
		});
		return promises;
	};
});
