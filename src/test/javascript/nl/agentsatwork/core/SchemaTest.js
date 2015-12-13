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
define([ "javascript/nl/agentsatwork/testing/JasmineTestCase", "javascript/nl/agentsatwork/core/Schema" ], function(classJasmineTestCase, classSchema) {
	function class_SchemaTest(properties) {
		properties.extends([ classJasmineTestCase ]);

		var Schema = properties.import([ classSchema ]);

		this.constructor = function SchemaTest() {
			properties.getPrototype(1).constructor.call(this);
			properties.setPrivate(this, {});
		};
		
		this.setup = function SchemaTest$setup() {
			var x = properties.getPrivate(this);
			x.schema = new Schema({
				$ : 'http://some-namespace'
			}, "alice");
		};
		
		this.testNamespaces = function SchemaTest$testNamespaces() {
			var x = properties.getPrivate(this);
			expect(x.schema.namespaceCount()).toBe(1);
			expect(x.schema.getPrefix(0)).toBe("$");
			expect(x.schema.getNamespaceURI(0)).toBe("http://some-namespace");
			expect(x.schema.indexOfPrefix("$")).toBe(0);
			expect(x.schema.indexOfNamespaceURI("http://some-namespace")).toBe(0);
		};
		
		this.testCreateTagName = function SchemaTest$testCreateTagName() {
			var x = properties.getPrivate(this);
			var tagName = x.schema.createTagName("alice");
			expect(tagName.getIndex()).toBe(0);
			expect(tagName.getPrefix()).toBe("$");
			expect(tagName.getNamespaceURI()).toBe("http://some-namespace");
			expect(tagName.getLocalName()).toBe("alice");
			expect(tagName.getTagName()).toBe("alice");
			
		};
		
		this.testParsePath = function SchemaTest$testParsePath() {
			var x = properties.getPrivate(this);
			var path = x.schema.parsePath("alice");
			expect(path.getDepth()).toBe(1);
			
			var step = path.getStep(0);
			expect(step.getDepth()).toBe(1);
			expect(step.axis).toBe(false);
			expect(step.getAxis()).toBe(step.AXIS.DESCENDANT);
			
			var tagName = step.getTagName();
			expect(tagName.getPrefix()).toBe("$");
			expect(tagName.getNamespaceURI()).toBe("http://some-namespace");
			expect(tagName.getLocalName()).toBe("alice");
			expect(tagName.getTagName()).toBe("alice");
		};
	}

	return class_SchemaTest;
});
