/**
 * Copyright � 2014 dr. ir. Jeroen M. Valk
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

define([ './slf4js' ], function(slf4js) {
	var configured = false;
	var share, check = null;
	var properties = Object.create(Private.prototype);

	function Private(type) {
		properties.setPrivate(this, {});
		if (type) {
			this.initialize(type);
		}
	}

	function Private$initialize(type) {
		this.logger = slf4js.getLogger(type.name);
		var x = properties.getPrivate(this);
		x.type = type;
	}

	/**
	 * @param {LoggerFactory} config.LoggerFactory - an slf4j compatible logger
	 *            factory
	 * @param {Object} config.logging - slf4j logging configuration
	 * @static
	 */
	function Private$configure(config) {
		if (configured) {
			throw new Error("already configured");
		}
		configured = true;
		if (config.LoggerFactory) {
			slf4js.setLoggerFactory(config.LoggerFactory);
		}
		if (config.logging) {
			slf4js.loadConfig(config.logging);
		}
	}

	function Private$getClass() {
		var x = properties.getPrivate(this);
		return x.type;
	}

	function Private$setPrivate(instance, x) {
		console.assert(instance !== properties);
		x.logger = this.logger;
		var y = properties.getPrivate(this);
		if (!y.at) {
			y.at = '@';
			while (instance[y.at]) {
				y.at += '@';
			}
		}
		console.assert(!instance[y.at]);
		console.assert(!(instance instanceof Private) || y.at === '@');
		instance[y.at] = function() {
			if (this !== instance) {
				throw new Error(this.constructor.name + "['" + at + "']: @-function belongs on class " + instance.constructor.name);
			}
			if (check === instance) {
				share = x;
				check = null;
			} else {
				throw new Error(this.constructor.name + ": security violation on @-function");
			}
		};
	}

	function Private$getPrivate(instance) {
		if (!instance) {
			throw new Error("illegal argument");
		}
		var at = properties.getPrivate(this).at;
		if (check) {
			throw new Error(check.constructor.name + ": has invalid @-function");
		}
		check = instance;
		instance[at]();
		if (check) {
			throw new Error(instance.constructor.name + ": has invalid @-function");
		}
		return share;
	}

	Private.configure = Private$configure;
	Private.prototype.configure = Private$configure;

	Private.prototype.initialize = Private$initialize;
	Private.prototype.getClass = Private$getClass;
	Private.prototype.setPrivate = Private$setPrivate;
	Private.prototype.getPrivate = Private$getPrivate;

	var x = {
		type : Private,
		at : '@'
	};
	properties['@'] = function() {
		console.assert(this === properties);
		if (check === properties) {
			share = x;
			check = null;
		} else {
			throw new Error(this.constructor.name + ": security violation on @-function");
		}
	};
	properties.getPrivate = function(instance) {
		console.assert(instance instanceof Private);
		if (check) {
			throw new Error(check.constructor.name + ": has invalid @-function");
		}
		check = instance;
		instance['@']();
		if (check) {
			throw new Error(instance.constructor.name + ": has invalid @-function");
		}
		return share;
	};

	return Private;
});
