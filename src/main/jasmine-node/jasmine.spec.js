/**
 * Copyright © 2014 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software: you can
 * redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version. Badgerfish CPX is
 * distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details. You should have received a copy of the GNU Lesser General Public
 * License along with Badgerfish CPX. If not, see
 * <http://www.gnu.org/licenses/>.
 */

var check = false;

var path = require("path");
var glob = require("glob");
var files = glob.sync("**/*Test.js", {
	cwd : path.resolve(process.cwd(), "src/test/javascript")
});
var requirejs = require("requirejs");
requirejs.config({
	baseUrl : process.cwd(),
	paths: {
		path: "dist/path"
	}
});

var test = {};
files.forEach(function(filename) {
	var basename = path.join(path.dirname(filename), path.basename(filename, ".js")).split(path.sep).join("/");
	var TestCase = requirejs("./src/test/javascript/" + basename);
	if (TestCase.isTestCase) {
		test[basename.split("/").join(".")] = TestCase;
	}
});

function execute(testcase, method) {
	return function() {
		check = false;
		method.call(testcase);
	};
}

for ( var prop in test) {
	if (test.hasOwnProperty(prop)) {
		check = false;
		var testcase = new test[prop]();
		var method = [];
		for ( var prop in testcase) {
			if (typeof testcase[prop] === "function" && prop.substr(0, 4) === "test") {
				method.push(prop);
			}
		}
		if (method.length > 0) {
			describe(prop, function() {
				check = true;
				beforeEach(function() {
					if (testcase.setup)
						testcase.setup();
				});
				for ( var i = 0; i < method.length; ++i) {
					it(method[i] + "()", execute(testcase, testcase[method[i]]));
					expect(check).toBe(true);
				}
			});
			expect(check).toBe(true);
		} else {
			throw new Error(prop + ": no tests defined");
		}
	}
}
