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

/* global define, jasmine, expect */
define([ "javascript/nl/agentsatwork/testing/JasmineTestCase" ], function(classJasmineTestCase) {
	function class_DefinitionTest(properties) {
		properties.extends([ classJasmineTestCase ]);

		this.constructor = function DefinitionTest() {
			properties.getPrototype(1).constructor.call(this);
		};

		this.testClassOf = function DefinitionTest$testClassOf() {
			var Definition = define.classOf("Definition");
			var DefinitionTest = define.classOf("DefinitionTest");
			expect(Definition).toBe(define.classOf("nl.agentsatwork.globals.Definition"));
			expect(Definition).toEqual(jasmine.any(Function));
			expect(DefinitionTest).toBe(define.classOf("nl.agentsatwork.globals.DefinitionTest"));
			expect(DefinitionTest.prototype.constructor).toBe(DefinitionTest);
			expect(DefinitionTest.prototype).toBe(Object.getPrototypeOf(this));

			var proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
			expect(proto.constructor.prototype).toBe(proto);
			expect(proto).toBe(define.classOf("nl.agentsatwork.testing.JasmineTestCase").prototype);
			proto = Object.getPrototypeOf(proto);
			expect(proto.constructor.prototype).toBe(proto);
			expect(proto).toBe(define.classOf("nl.agentsatwork.core.Singleton").prototype);
		};

		this.testDefinition = function DefinitionTest$testDefinition() {
			var proto = define.classOf("Definition").prototype;
			expect(proto.createDefinition).toEqual(jasmine.any(Function));
			expect(proto.onStateChange).toEqual(jasmine.any(Function));
			expect(proto.extends).toEqual(jasmine.any(Function));
//			expect(proto.getBase).toEqual(jasmine.any(Function));
			expect(proto.getConstructor).toEqual(jasmine.any(Function));
			expect(proto.setPrivate).toEqual(jasmine.any(Function));
			expect(proto.getPrivate).toEqual(jasmine.any(Function));
		};

		this.testExtend = function DefinitionTest$testExtend() {
			var Singleton = define.classOf("nl.agentsatwork.core.Singleton");
			var SingletonSingleton = define.classOf("nl.agentsatwork.core.Singleton:Singleton");
			expect(Singleton).toBe(Singleton.prototype.constructor);
			expect(SingletonSingleton).toBe(SingletonSingleton.prototype.constructor);
			expect(Object.getPrototypeOf(SingletonSingleton.prototype).constructor).toBe(Singleton);
			expect(Object.getPrototypeOf(Singleton.prototype)).toEqual({});
			expect(Object.getPrototypeOf(Singleton.prototype).constructor).toBe(Object);
		};

		this.testGetBase = function DefinitionTest$testGetBase() {
//			expect(properties.getBase().prototype).toBe(Object.getPrototypeOf(Object.getPrototypeOf(this)));
		};

		this.testGetConstructor = function DefinitionTest$testGetConstructor() {
			var constr = properties.getConstructor();
			expect(constr).toBe(constr.prototype.constructor);
			expect(constr.prototype).toBe(Object.getPrototypeOf(this));
		};

		this.xtestSetPrivate = function DefinitionTest$testSetPrivate() {

		};

		this.xtestGetPrivate = function DefinitionTest$testGetPrivate() {

		};
	}
	return class_DefinitionTest;
});
