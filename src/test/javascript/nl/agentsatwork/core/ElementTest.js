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
		function(classAsyncJasmineTestCase, classElement) {
			function class_ElementTest(properties) {
				properties.extends([ classAsyncJasmineTestCase ]);

				var Element = properties.import([ classElement ]);

				var domParser = new DOMParser();

				this.constructor = function ElementTest() {
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

				this.testBaseUrl = function ElementTest$testBaseUrl(done) {
					var x = properties.getPrivate(this);
					[ new Element(x.xml), new Element(x.json) ].forEach(function(bfish) {
						expect(bfish.baseUrl()).toBe('/');
					});
					var parent = new Element({
						'xi:include' : {
							'@xmlns' : {
								xi : 'http://www.w3.org/2001/XInclude'
							},
							'@href' : '/base/src/test/templates/cd.xml'
						}
					});
					expect(parent.baseUrl()).toBe('/');
					parent.require().then(function(bfish) {
						expect(bfish.baseUrl()).toBe('/base/src/test/templates/');
						done();
					});
				};

				this.testQnameXInclude = function BadgerfishTest$testQnameXInclude(done) {
					var x = properties.getPrivate(this);
					[ new Element(x.xml), new Element(x.json) ].forEach(function(bfish) {
						expect(bfish.qnameXInclude()).toBeNull();
					});
					done();
				};

				this.testParseTagname = function Badgerfish$testParseTagname(done) {
					var x = properties.getPrivate(this);
					[ new Element(x.xml), new Element(x.json) ].forEach(function(bfish) {
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

				this.testGetElementByTagName = function Badgerfish$testGetElementByTagName(done) {
					var x = properties.getPrivate(this);
					[ new Element(x.xml), new Element(x.json) ].forEach(function(bfish) {
						expect(bfish.getElementByTagName("bob/$")).toBe("david");
						expect(bfish.getElementByTagName("charlie:edgar/$")).toBe("frank");
					});

					new Element({
						'xi:include' : {
							'@xmlns' : {
								xi : 'http://www.w3.org/2001/XInclude'
							},
							'@href' : '/base/src/test/templates/cdcatalog.xml'
						}
					}).requireXIncludes().then(function(bfish) {
						bfish.resolveXIncludes();
						expect(bfish.getElementByTagName("cd[@chain]").toJSON()).toEqual({
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

				this.testXIncludes = function BadgerfishTest$testXIncludes(done) {
					new Element({
						'xi:include' : {
							'@xmlns' : {
								xi : 'http://www.w3.org/2001/XInclude'
							},
							'@href' : '/base/src/test/templates/cdcatalog.xml'
						}
					}).requireXIncludes().then(function(bfish) {
						bfish.resolveXIncludes();
						expect(bfish.getTagName()).toBe('catalog');
						expect(bfish.toJSON().cd[0]).toEqual({
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

			return class_ElementTest;
		});
