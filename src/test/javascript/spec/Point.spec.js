var test = {
	"spec.point.PointTest" : require("./point/PointTest")
};

for ( var prop in test) {
	if (test.hasOwnProperty(prop)) {
		describe(prop, function() {
			var testcase = new test[prop]();
			beforeEach(function() {
				testcase.setup();
			});
			for ( var method in testcase) {
				if (testcase[method] instanceof Function && method.substr(0,4) === "test") {
					it(method+"()", function() {
						testcase[method]();
					});
				}
			}
		});
	}
}
