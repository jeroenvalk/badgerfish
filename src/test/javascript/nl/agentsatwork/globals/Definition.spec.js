/* global describe, it, expect, Definition */
describe("Definition", function() {
	it("Definition.require", function(done) {
		var def = new Definition();
		def.require([ "/resources/definition.xml" ], function(config) {
			expect(config.documentElement.localName).toBe("definition");
			var plugin = config.getElementsByTagName("plugin");
			for (var i = 0; i < plugin.length; ++i) {
				expect(plugin[i].parentNode).toBe(config.documentElement);
			}
			done();
		});
	});
});
