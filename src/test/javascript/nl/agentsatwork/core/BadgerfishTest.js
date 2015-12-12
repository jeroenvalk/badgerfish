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

/* global define, expect, Modernizr, DOMParser, XMLSerializer */
define(
		[ "javascript/nl/agentsatwork/testing/AsyncJasmineTestCase", "javascript/nl/agentsatwork/core/Schema", "javascript/nl/agentsatwork/core/Badgerfish" ],
		function(classAsyncJasmineTestCase, classSchema, classBadgerfish) {
			function class_BadgerfishTest(properties) {
				properties.extends([ classAsyncJasmineTestCase ]);

				var Badgerfish = properties.import([ classBadgerfish ]);
				var Schema = properties.import([ classSchema ]);

				var domParser = new DOMParser();
				var xmlSerializer = new XMLSerializer();

				this.constructor = function BadgerfishTest() {
					properties.getPrototype(1).constructor.call(this);
					properties.setPrivate(this, {});
				};

				this.setup = function BadgerfishTest$setup(done) {
					var x = properties.getPrivate(this);
					x.keys = [ "ning", "cd", "cdcatalog" ];
					x.json = {
						ning : {
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
						},
						cd : {
							cd : {
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
							}
						}

					};
					Promise
							.all([ Modernizr.xhrForRef('/base/src/test/templates/cd.xml'), Modernizr.xhrForRef('/base/src/test/templates/cdcatalog.xml') ])
							.then(
									function(xhr) {
										x.xml = {
											ning : domParser
													.parseFromString(
															'<alice xmlns="http://some-namespace" xmlns:charlie="http://some-other-namespace"><bob>david</bob><charlie:edgar>frank</charlie:edgar></alice>',
															'application/xml').documentElement,
											cd : xhr[0].responseXML.documentElement,
											cdcatalog : xhr[1].responseXML.documentElement
										};
										done();
									});
				};

				var newBadgerfish = function BadgerfishTest$newBadgerfish(entity) {
					return new Badgerfish(entity, Schema.generateFromEntity(entity));
				};

				this.testConstructor = function Badgerfish$testConstructor(done) {
					var x = properties.getPrivate(this);
					x.keys.forEach(function(key) {
						[ x.json[key], x.xml[key] ].forEach(function(entity) {
							if (entity) {
								var schema = Schema.generateFromEntity(entity);
								var bfish = new Badgerfish(entity, schema);
								expect(bfish.constructor).toBe(Badgerfish);
							}
						});
					});
					[ undefined, null, 0, 1, true, false ].forEach(function(entity) {
						expect(function() {
							var bfish = new Badgerfish(entity, new Schema({}, "alice"));
							expect(true).toBe(bfish);
						}).toThrowError("Badgerfish: JSON or XML node required");
					});
					[ {}, {
						a : 1,
						b : 1
					} ].forEach(function(entity) {
						expect(function() {
							var bfish = new Badgerfish(entity, new Schema({}, "alice"));
							expect(true).toBe(bfish);
						}).toThrowError("Badgerfish: exactly one property expected on document element");
					});
					done();
				};

				this.testGetText = function Badgerfish$testGetText(done) {
					var x = properties.getPrivate(this);
					[ newBadgerfish(x.json.ning), newBadgerfish(x.xml.ning) ].forEach(function(bfish) {
						expect(bfish.getText()).toBeUndefined();
					});
					done();
				};

				this.testAttr = function Badgerfish$testAttr(done) {
					var x = properties.getPrivate(this);
					[ newBadgerfish(x.json.ning), newBadgerfish(x.xml.ning) ].forEach(function(bfish) {
						expect(bfish.attr()).toEqual({});
						expect(bfish.attr(true)).toEqual({
							xmlns : 'http://some-namespace',
							'xmlns:charlie' : 'http://some-other-namespace'
						});
					});
					[ newBadgerfish(x.json.cd), newBadgerfish(x.xml.cd) ].forEach(function(bfish) {
						[ bfish.attr(), bfish.attr(true) ].forEach(function(attr) {
							expect(attr).toEqual({
								require : 'javascript/Control',
								chain : 'Control',
							});
						});
					});
					done();
				};

				this.xtestGetTagNames = function Badgerfish$testGetTagNames(done) {
					var x = properties.getPrivate(this);
					[ newBadgerfish(x.json.ning), newBadgerfish(x.xml.ning) ].forEach(function(bfish) {
						[ true ].forEach(function(childAxis) {
							expect(bfish.getTagNames(childAxis).map(function(tagName) {
								var result = {
									ns : tagName.ns,
									local : tagName.local
								};
								if (tagName.getPrefix())
									result.prefix = tagName.getPrefix();
								return result;
							})).toEqual([ {
								ns : "http://some-namespace",
								local : "bob",
								prefix : "$"
							}, {
								ns : "http://some-other-namespace",
								local : "edgar",
								prefix : "charlie"
							} ]);

						});
					});
					[ newBadgerfish(x.json.cd), newBadgerfish(x.xml.cd) ].forEach(function(bfish) {
						[ true ].forEach(function(childAxis) {
							expect(bfish.getTagNames(childAxis).map(function(tagName) {
								var result = {
									ns : tagName.ns,
									local : tagName.local
								};
								if (tagName.getPrefix())
									result.prefix = tagName.getPrefix();
								return result;
							})).toEqual([ {
								local : "title"
							}, {
								local : "artist"
							}, {
								local : "country"
							}, {
								local : "company"
							}, {
								local : "price"
							}, {
								local : "year"
							} ]);
						});
					});
					done();
				};

				this.testToNode = function Badgerfish$testToNode(done) {
					var x = properties.getPrivate(this);
					Object.keys(x.json).forEach(
							function(key) {
								var json = x.json[key];
								var root = json[Object.keys(json)[0]];
								var xmlns = root['@xmlns'];
								var bfish = newBadgerfish(json);
								var node = bfish.toNode(0);
								expect(node.childNodes.length).toBe(0);
								var xmlnsNames = xmlns ? Object.keys(xmlns) : [];
								var attrNames = Object.keys(root).filter(function(attr) {
									return attr.charAt(0) === '@' && attr !== '@xmlns';
								});
								expect(node.attributes.length).toBe(xmlnsNames.length + attrNames.length);
								xmlnsNames.forEach(function(prefix) {
									if (prefix === '$') {
										expect(node.getAttribute('xmlns')).toBe(xmlns[prefix]);
									} else {
										expect(node.getAttribute('xmlns:' + prefix)).toBe(xmlns[prefix]);
									}
								});
								attrNames.forEach(function(attr) {
									expect(node.getAttribute(attr.substr(1))).toBe(root[attr]);
								});

								node = bfish.toNode();
								expect(
										newBadgerfish(domParser.parseFromString(xmlSerializer.serializeToString(node), "application/xml").documentElement)
												.toJSON()).toEqual(json[bfish.getTagName()]);
							});
					done();
				};

				this.testToJSON = function BadgerfishTest$testToJSON(done) {
					var x = properties.getPrivate(this);
					Object.keys(x.json).forEach(function(key) {
						var json = x.json[key];
						var root = json[Object.keys(json)[0]];
						var xmlns = root['@xmlns'];
						var bfish = newBadgerfish(x.xml[key]);
						var obj = bfish.toJSON(0);
						expect(Object.keys(obj).filter(function(key) {
							return key.charAt(0) !== '@';
						})).toEqual([]);
						expect(obj['@xmlns']).toEqual(xmlns);
						obj = bfish.toJSON();
						expect(obj).toEqual(root);
					});
					done();
				};

				this.xtestNativeElementsByTagName = function BadgerfishTest$testNativeElementsByTagName(done) {
					var x = properties.getPrivate(this);
					[ newBadgerfish(x.xml), newBadgerfish(x.json) ].forEach(function(bfish) {
						expect(bfish.nativeElementsByTagName("alice").length).toBe(0);
						expect(bfish.nativeElementsByTagName("bob").length).toBe(1);
						expect(bfish.nativeElementsByTagName("charlie:edgar").length).toBe(1);
					});
					var bfish = newBadgerfish({
						'xi:include' : {
							'@href' : '/base/src/test/templates/cd.xml'
						}
					});
					expect(function() {
						bfish.nativeElementsByTagName("xi:include")
					}).toThrowError(Error);
					done();
				};

				this.xtestGetElementsByTagName = function BadgerfishTest$testGetElementsByTagName(done) {
					var x = properties.getPrivate(this);
					[ newBadgerfish(x.xml), newBadgerfish(x.json) ].forEach(function(bfish) {
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
			}
			return class_BadgerfishTest;
		});