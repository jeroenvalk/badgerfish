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

/* global define, describe, it, xit */
/*jshint -W089 */
define(["../core/Singleton"], function(classSingleton) {
	function class_JasmineTestCase(properties) {
		properties.extends([classSingleton]);
		
		this.constructor = function JasmineTestCase() {
			var self = this;
			describe(this.constructor.name, function() {
				for ( var prop in self) {
					if (prop.lastIndexOf("test", 0) === 0 && self[prop] instanceof Function) {
						it(prop, self.getTestRunner(prop));
					}
					if (prop.lastIndexOf("xtest", 0) === 0 && self[prop] instanceof Function) {
						xit(prop, self.getTestRunner(prop));
					}
				}
			});
		};

		this.getTestRunner = function TestCase$getTestRunner(prop) {
			var self = this;
			return function() {
				self[prop]();
			};
		};
	}
	return class_JasmineTestCase;
});
