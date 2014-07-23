require(["./point/PointTest"], function(PointTest) {
	var test = {
			"spec.point.PointTest" : PointTest
		};
	for ( var prop in test) {
		if (test.hasOwnProperty(prop)) {
			describe(prop, function() {
				var testcase = new test[prop]();
				beforeEach(function() {
					testcase.setup();
				});
				for ( var method in testcase) {
					if (typeof testcase[method] === "function" && method.substr(0,4) === "test") {
						it(method+"()", function() {
							testcase[method]();
						});
					}
				}
			});
		}
	}
});
