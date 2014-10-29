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
