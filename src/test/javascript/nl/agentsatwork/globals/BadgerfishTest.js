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
define([ "javascript/nl/agentsatwork/testing/JasmineTestCase", "javascript/nl/agentsatwork/globals/Badgerfish" ], function(classJasmineTestCase,
		classBadgerfish) {
	function class_BadgerfishTest(properties) {
		properties.extends([ classJasmineTestCase ]);

		var Badgerfish = properties.import([ classBadgerfish ]);

		this.testToJSON = function BadgerfishTest$testToJSON() {
			new Badgerfish({
				'xi:include' : {
					'@xmlns' : {
						xi : 'http://www.w3.org/2001/XInclude'
					},
					'@href' : '/base/src/test/templates/cd.xml'
				}
			}).require().then(function(bfish) {
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
			});
		};
	}

	return class_BadgerfishTest;
});