var check = false;

var path = require("path");
var glob = require("glob");
var files = glob.sync("**/*Test.js", {
	cwd : path.resolve(process.cwd(), "src/test/javascript")
});
var requirejs = require("requirejs");
requirejs.config({
	baseUrl : process.cwd()
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
		describe(prop, function() {
			check = true;
			var testcase = new test[prop]();
			beforeEach(function() {
				testcase.setup();
			});
			for ( var method in testcase) {
				if (typeof testcase[method] === "function" && method.substr(0, 4) === "test") {
					it(method + "()", execute(testcase, testcase[method]));
					expect(check).toBe(true);
				}
			}
		});
		expect(check).toBe(true);
	}
}
