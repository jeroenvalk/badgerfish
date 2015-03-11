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
define([ "./JasmineTestCase" ], function(classJasmineTestCase) {
	function class_AsyncJasmineTestCase(properties) {
		properties.extends([ classJasmineTestCase ]);

		this.constructor = function AsyncJasmineTestCase() {
			properties.getPrototype(1).constructor.call(this);			
		};
		
		this.getTestRunner = function AsyncJasmineTestCase$getTestRunner(prop) {
			var self = this;
			return function(done) {
				self[prop](done);
			};
		};
	}
	return class_AsyncJasmineTestCase;
});
