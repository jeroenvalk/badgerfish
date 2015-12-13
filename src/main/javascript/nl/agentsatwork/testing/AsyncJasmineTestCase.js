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

/* global define, is */
define([ "./JasmineTestCase" ], function(classJasmineTestCase) {
	function class_AsyncJasmineTestCase(properties) {
		properties.extends([ classJasmineTestCase ]);

		this.constructor = function AsyncJasmineTestCase() {
			properties.getPrototype(1).constructor.call(this);
		};

		this.getTestRunner = function AsyncJasmineTestCase$getTestRunner(prop) {
			var self = this;
			return function(done) {
				if (is.fn(self.setup)) {
					self.setup(function() {
						try {
							self[prop](done);							
						} catch(e) {
							console.error(e.message + '\n' + e.stack);
						}
					});
				} else {
					self[prop](done);
				}
			};
		};
		
		this.continuation = function AsynJasmineTestCase$continuation(fn, done) {
			var result = function AsyncJasmineTestCase$continuation$closure() {
				try {
					fn.apply(null, Array.prototype.slice.call(arguments));
				} catch(e) {
					console.error(e.message + '\n' + e.stack);				
				}
				done();
			};
			return result;
		};
	}
	return class_AsyncJasmineTestCase;
});
