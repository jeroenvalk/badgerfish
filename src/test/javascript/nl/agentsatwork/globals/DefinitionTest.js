/* global define, expect */
define([ "javascript/nl/agentsatwork/testing/JasmineTestCase" ], function(classJasmineTestCase) {
	function class_DefinitionTest(properties) {
		properties.extends([ classJasmineTestCase ]);

		this.DefinitionTest = function DefinitionTest() {
			properties.getBase().call(this);
		};

		this.testRequire = function DefinitionTest$require(done) {
			properties.require({
				"definition.xml" : "/resources/definition.xml"
			}, done)["definition.xml"].done(function(config) {
				expect(config.documentElement.localName).toBe("definition");
				var plugin = config.getElementsByTagName("plugin");
				for (var i = 0; i < plugin.length; ++i) {
					expect(plugin[i].parentNode).toBe(config.documentElement);
				}
			});
		};
	}
	return class_DefinitionTest;
});
