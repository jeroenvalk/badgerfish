define([ "../geometry/AbstractPointTest", "./Point" ], function(AbstractPointTest, Point) {
	function PointTest() {
		AbstractPointTest.call(this, Point);
	}
	PointTest.isTestCase = true;

	require("util").inherits(PointTest, AbstractPointTest);
	return PointTest;
});
