define(["../AbstractPointTest", "../../examples/point/Point"], function(AbstractPointTest, Point) {
	function PointTest() {
		AbstractPointTest.call(this, Point);
	}
	require("util").inherits(PointTest, AbstractPointTest);	
	return PointTest;
});
