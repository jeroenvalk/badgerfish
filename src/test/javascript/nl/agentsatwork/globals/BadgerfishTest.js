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
		[ "javascript/nl/agentsatwork/testing/AsyncJasmineTestCase", "javascript/nl/agentsatwork/globals/Badgerfish" ],
		function(classAsyncJasmineTestCase, classBadgerfish) {
			function class_BadgerfishTest(properties) {
				properties.extends([ classAsyncJasmineTestCase ]);

				var Badgerfish = properties.import([ classBadgerfish ]);

				var domParser = new DOMParser();

				this.constructor = function AsyncJasmineTestCase() {
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

				this.testParseTagname = function Badgerfish$testParseTagname(done) {
					var x = properties.getPrivate(this);
					[ new Badgerfish(x.xml), new Badgerfish(x.json) ].forEach(function(bfish) {
						expect(bfish.parseTagname("alice")).toEqual({
							tagname : "alice",
							local : "alice",
							ns : "http://some-namespace"
						});
						expect(bfish.parseTagname("bob")).toEqual({
							tagname : "bob",
							local : "bob",
							ns : "http://some-namespace"
						});
						expect(bfish.parseTagname("charlie:edgar")).toEqual({
							tagname : "charlie:edgar",
							local : "edgar",
							prefix : "charlie",
							ns : "http://some-other-namespace"
						});
					});
					done();
				};

				this.testNativeElementsByTagName = function BadgerfishTest$testNativeElementsByTagName(done) {
					var x = properties.getPrivate(this);
					[ new Badgerfish(x.xml), new Badgerfish(x.json) ].forEach(function(bfish) {
						expect(bfish.nativeElementsByTagName("alice").length).toBe(0);
						expect(bfish.nativeElementsByTagName("bob").length).toBe(1);
						expect(bfish.nativeElementsByTagName("charlie:edgar").length).toBe(1);
					});
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

				this.testGetElementByTagName = function Badgerfish$testGetElementByTagName(done) {
					var x = properties.getPrivate(this);
					[ new Badgerfish(x.xml), new Badgerfish(x.json) ].forEach(function(bfish) {
						expect(bfish.getElementByTagName("bob/$")).toBe("david");
						expect(bfish.getElementByTagName("charlie:edgar/$")).toBe("frank");
					});
					done();
				};

				this.testXIncludes = function BadgerfishTest$testXIncludes(done) {
					new Badgerfish({
						'xi:include' : {
							'@xmlns' : {
								xi : 'http://www.w3.org/2001/XInclude'
							},
							'@href' : '/base/src/test/templates/cdcatalog.xml'
						}
					}).requireXIncludes().then(function(bfish) {
						bfish.resolveXIncludes();
						expect(bfish.toJSON().catalog.cd[0]).toEqual({
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
						done();
					});
				};
			}

			return class_BadgerfishTest;
		});