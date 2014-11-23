/**
 * Copyright © 2014 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software: you can
 * redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version. Badgerfish CPX is
 * distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details. You should have received a copy of the GNU Lesser General Public
 * License along with Badgerfish CPX. If not, see
 * <http://www.gnu.org/licenses/>.
 */

/* global define, DEBUG, expect, XMLHttpRequest */
/* jshint -W030 */

define(function() {
	var properties = [];
	var config = {
		definition : {
			plugin : []
		}
	}, initialize, instance;

	/**
	 * @param {Function}
	 *            definition
	 */
	function Definition(definition) {
		if (this instanceof Definition) {
			if (arguments.length > 0) {
				throw new Error("Definition: constructor takes no arguments");
			}
		} else {
			if (!(definition instanceof Function)) {
				throw new Error("Definition: usage: Definition(function class_<classname>(){ ... });");
			}
			return instance.create(definition);
		}
	}
	instance = new Definition();

	Definition.configure =
	/**
	 * @param {Object}
	 *            configuration
	 * @static
	 */
	function Definition$configure(configuration) {
		config = configuration;
	};

	Definition.prototype.require =
	/**
	 * @param {Array}
	 *            references
	 * @param {Function}
	 *            callback
	 */
	function Definition$require(references, callback) {
		var result = new Array(references.length);
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
					switch (ext) {
					case ".xml":
						result[index] = xhr.responseXML;
						break;
					default:
						result[index] = xhr.responseText;
						break;
					}
					DEBUG && expect(counter).toBeGreaterThan(0);
					if (!--counter) {
						callback.apply(null, result);
					}
				}
			};
			++counter;
			xhr.open("GET", ref, true);
			xhr.send();
		});
	};

	Definition.prototype.create =
	/**
	 * @param {Function}
	 *            definition
	 * @returns {Definition}
	 */
	function Definition$create(definition) {
		var required =
		/**
		 * 
		 */
		function Definition$create$required() {
			var result, Def, def = this;
			for (var i = 0; i < arguments.length; ++i) {
				arguments[i].extends(def);
				def = arguments[i];
			}
			Def = def.getClass();
			new Def().initialize.call(result, definition);
		};

		var references = config.definition.plugin.map(function(config) {
			return config.$;
		});
		if (references.length > 0) {
			this.require(references, required);
		} else {
			required.call(this);
		}
	};

	initialize =
	/**
	 * @param {Function}
	 *            definition
	 * @private
	 */
	function Definition$initialize(definition) {
		var methods = {};
		var result = definition.call(methods, this);
		var at = properties.length;

		function Definition$initialize$at() {
			return at;
		}

		properties.push({
			'@' : Definition$initialize$at,
			definition : definition,
			methods : methods,
			result : result
		});
		this['@'] = Definition$initialize$at;
		this.initialized();
	};

	Definition.prototype.initialized =
	/**
	 * Called when definition function has been called. Results have been
	 * collected in the private properties.
	 */
	function Definition$initialized() {
		var x = properties.getPrivate(this);
		for ( var name in x.methods) {
			if (x.methods.hasOwnProperty(name)) {
				x.result.prototype[name] = x.methods[name];
			}
		}
	};

	Definition.prototype.setPrivate =
	/**
	 * Method for setting the private properties on an instance; typically a
	 * plugin that provides more advanced encapsulation overrides this method.
	 */
	function Definition$setPrivate(self, object) {
		self.properties = object;
	};

	Definition.prototype.getPrivate =
	/**
	 * Method for getting the private properties on an instance; typically a
	 * plugin that provides more advanced encapsulation overrides this method.
	 */
	function Definition$getPrivate(self) {
		var x;
		if (self instanceof Definition) {
			x = properties[self['@']()];
			if (x['@'] !== self['@']) {
				throw new Error("Definition: original @-function overwritten");
			}
		} else {
			x = self.properties;
		}
		return x;
	};

	Definition.prototype.extends =
	/**
	 * @param {Definition}
	 *            definition - to be extended by this definition
	 * @returns {Definition} this definition for method chaining
	 */
	function Definition$extends(definition) {

	};

	Definition.prototype.getClass =
	/**
	 * @return {Function}
	 */
	function Definition$getClass() {
		return properties.getPrivate(this).result;
	};

	return Definition;
});