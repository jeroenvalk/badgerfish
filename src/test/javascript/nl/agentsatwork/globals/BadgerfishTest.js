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

/* global define, expect, DOMParser */
define(
		[ "javascript/nl/agentsatwork/testing/AsyncJasmineTestCase", "javascript/nl/agentsatwork/core/ElementNode" ],
		function(classAsyncJasmineTestCase, classBadgerfish) {
			function class_BadgerfishTest(properties) {
				properties.extends([ classAsyncJasmineTestCase ]);

				var Badgerfish = properties.import([ classBadgerfish ]);

				var domParser = new DOMParser();

				this.constructor = function BadgerfishTest() {
					properties.getPrototype(1).constructor.call(this);
					properties.setPrivate(this, {});
				};

				this.setup = function BadgerfishTest$setup(done) {
					var x = properties.getPrivate(this);
					x.xml = domParser
							.parseFromString(
									'<alice xmlns="http://some-namespace" xmlns:charlie="http://some-other-namespace"><bob>david</bob><charlie:edgar>frank</charlie:edgar></alice>',
									'application/xml').documentElement;
					x.json = {
						alice : {
							'@xmlns' : {
								$ : 'http://some-namespace',
								charlie : 'http://some-other-namespace'
							},
							bob : {
								$ : 'david'
							},
							'charlie:edgar' : {
								$ : 'frank'
							}
						}
					};
					done();
				};

				this.testToNode = function Badgerfish$testToNode(done) {
					var x = properties.getPrivate(this);
					var bfish = new Badgerfish(x.json);
					var node = bfish.toNode(0);
					expect(node.tagName).toBe("alice");
					expect(node.getAttribute('xmlns')).toBe("http://some-namespace");
					expect(node.getAttribute('xmlns:charlie')).toBe("http://some-other-namespace");
					expect(node.childNodes.length).toBe(0);

					// var result = bfish.toNode();
					// expect(new Badgerfish(result).toJSON()).toEqual(x.json);
					done();
				};

				this.testAssign = function BadgerfishTest$testAssign(done) {
					var x = properties.getPrivate(this);
					var source = new Badgerfish(x.json);
					var target = new Badgerfish({
						dummy : {}
					});
					expect(source.toJSON()).toEqual(x.json.alice);
					target.assign(source);
					expect(target.toJSON()).toEqual(x.json.alice);
					expect(source.toJSON()).toBeNull();
					done();
				};

				this.testToJSON = function BadgerfishTest$testToJSON(done) {
					var parent = new Badgerfish({
						'xi:include' : {
							'@xmlns' : {
								xi : 'http://www.w3.org/2001/XInclude'
							},
							'@href' : '/base/src/test/templates/cd.xml'
						}
					});
					parent.require().then(function(bfish) {
						expect(bfish.toJSON()).toEqual({
							'@require' : 'javascript/Control',
							'@chain' : 'Control',
							title : {
								$ : 'Cold fact'
							},
							artist : {
								$ : 'Sixto Rodriguez'
							},
							country : {
								$ : 'USA'
							},
							company : {
								$ : 'Searching for sugerman'
							},
							price : {
								$ : '10.90'
							},
							year : {
								$ : '1985'
							}
						});
						expect(bfish.getParent()).toBe(parent);
						done();
					});
				};

				this.testNativeElementsByTagName = function BadgerfishTest$testNativeElementsByTagName(done) {
					var x = properties.getPrivate(this);
					[ new Badgerfish(x.xml), new Badgerfish(x.json) ].forEach(function(bfish) {
						expect(bfish.nativeElementsByTagName("alice").length).toBe(0);
						expect(bfish.nativeElementsByTagName("bob").length).toBe(1);
						expect(bfish.nativeElementsByTagName("charlie:edgar").length).toBe(1);
					});
					var bfish = new Badgerfish({
						'xi:include' : {
							'@href' : '/base/src/test/templates/cd.xml'
						}
					});
					expect(function() {
						bfish.nativeElementsByTagName("xi:include")
					}).toThrowError(Error);
					done();
				};

				this.testGetElementsByTagName = function BadgerfishTest$testGetElementsByTagName(done) {
					var x = properties.getPrivate(this);
					[ new Badgerfish(x.xml), new Badgerfish(x.json) ].forEach(function(bfish) {
						expect(bfish.getElementsByTagName("bob").length).toBe(1);
						expect(function() {
							bfish.getElementsByTagName("bob/$");
						}).toThrow();
						expect(bfish.getElementsByTagName("charlie:edgar").length).toBe(1);
						expect(function() {
							bfish.getElementsByTagName("charlie:edgar/$");
						}).toThrow();
					});
					done();
				};

				this.testGetElementsByTagNameNS = function BadgerfishTest$testGetElementsByTagNameNS(done) {
					var x = properties.getPrivate(this);
					var bfish = new Badgerfish(x.xml);
					expect(function() {
						bfish.getElementsByTagNameNS("http://mynamespace/", "bob");
					}).toThrowError("Badgerfish$getElementsByTagNameNS: namespace 'http://mynamespace/' not declared in documentElement");
					expect(function() {
						bfish.getElementsByTagNameNS({
							bob : "http://mynamespace/"
						}, "bob");
					}).toThrowError("Badgerfish$getElementsByTagNameNS: namespace 'http://mynamespace/' not declared in documentElement");
					done();
				};

			}
			return class_BadgerfishTest;
		});