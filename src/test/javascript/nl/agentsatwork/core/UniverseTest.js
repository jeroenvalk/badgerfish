/* global define, expect */
define([ "javascript/nl/agentsatwork/testing/JasmineTestCase", "javascript/nl/agentsatwork/core/Universe" ], function(classJasmineTestCase, classUniverse) {
	function class_UniverseTest(properties, Universe) {
		properties.extends([ classJasmineTestCase ]);
		
		this._constructor = function UniverseTest() {
			
		};
		
		this.testIndexOf = function UniverseTest$testIndexOf() {
			var universe = new Universe([ "A", "C", "E" ]);
			expect(universe.indexOf("A")).toBe(0);
			expect(universe.indexOf("B")).toBe(3);
			expect(universe.indexOf("C")).toBe(1);
			expect(universe.indexOf("D")).toBe(4);
			expect(universe.indexOf("E")).toBe(2);
		};

		this.testValueOf = function UniverseTest$testValueOf() {
			var universe = new Universe([ "A", "C", "E" ]);
			expect(universe.valueOf(-1)).toBeUndefined();
			expect(universe.valueOf(0)).toBe("A");
			expect(universe.valueOf(1)).toBe("C");
			expect(universe.valueOf(2)).toBe("D");
			expect(universe.valueOf(3)).toBeUndefined();
		};

		this.testContainsValue = function UniverseTest$testContainsValue() {
			var universe = new Universe([ "A", "C", "E" ]);
			expect(universe.containsValue("A")).toBe(true);
			expect(universe.containsValue("B")).toBe(false);
			expect(universe.containsValue("C")).toBe(true);
			expect(universe.containsValue("D")).toBe(false);
			expect(universe.containsValue("E")).toBe(true);
		};

		this.testInverse = function UniverseTest$testInverse() {
			var universe = new Universe([ "A", "B", "E" ]);
			expect(universe.inverse()).toBeJsonEqual({
				A : 0,
				C : 1,
				E : 2
			});
		};
	}

	return [ class_UniverseTest, classUniverse ];
});
