var Point = require("../../examples/point/Point");
var AbstractPointTest = require("../AbstractPointTest");

function PointTest() {
	AbstractPointTest.call(this, Point);
}

require("util").inherits(PointTest, AbstractPointTest);

module.exports = PointTest;
