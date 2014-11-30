/* global definition, describe, it */
definition("nl.agentsatwork.testing", function class_JasmineTestCase() {
	this.JasmineTestCase = function JasmineTestCase() {
		var self = this;
		describe(this.constructor.name, function() {
			for (var prop in self) {
				if (prop.lastIndexOf("test", 0) === 0 && self[prop] instanceof Function) {
					it(prop, self.getTestRunner(prop));
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
});