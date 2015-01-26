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

/* global define, expect */
define([ "javascript/nl/agentsatwork/testing/JasmineTestCase", "javascript/nl/agentsatwork/core/Universe" ], function(classJasmineTestCase, classUniverse) {
	function class_UniverseTest(properties) {
		properties.extends([ classJasmineTestCase ]);

		var Universe = properties.import([ classUniverse ]);

		this.testIndexOf = function UniverseTest$testIndexOf() {
			var universe = new Universe("A", "C", "E");
			expect(universe.indexOf("A")).toBe(0);
			expect(universe.indexOf("B")).toBe(3);
			expect(universe.indexOf("C")).toBe(1);
			expect(universe.indexOf("D")).toBe(4);
			expect(universe.indexOf("E")).toBe(2);
		};

		this.testValueOf = function UniverseTest$testValueOf() {
			var universe = new Universe("A", "C", "E");
			expect(universe.valueOf(-1)).toBeUndefined();
			expect(universe.valueOf(0)).toBe("A");
			expect(universe.valueOf(1)).toBe("C");
			expect(universe.valueOf(2)).toBe("E");
			expect(universe.valueOf(3)).toBeUndefined();
		};

		this.testContainsValue = function UniverseTest$testContainsValue() {
			var universe = new Universe("A", "C", "E");
			expect(universe.containsValue("A")).toBe(true);
			expect(universe.containsValue("B")).toBe(false);
			expect(universe.containsValue("C")).toBe(true);
			expect(universe.containsValue("D")).toBe(false);
			expect(universe.containsValue("E")).toBe(true);
		};

		this.testInverse = function UniverseTest$testInverse() {
			var universe = new Universe("A", "C", "E");
			expect(universe.inverse()).toEqual({
				A : 0,
				C : 1,
				E : 2
			});

			universe = new Universe(0, 2, 4);
			expect(universe.inverse()).toEqual([ 0, undefined, 1, undefined, 2 ]);

			universe = new Universe(0, "1");
			expect(universe.inverse()).toEqual({
				0 : 0,
				1 : 1
			});
		};
	}

	return class_UniverseTest;
});
