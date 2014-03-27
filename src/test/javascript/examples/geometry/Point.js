var Vector = require("./Vector");

/**
 * @constructor
 */
function Point(x, y) {
	Vector.apply(this, arguments);
}

require("util").inherits(Point, Vector);

var origin = new Point(0, 0);

/**
 * @return {Point} the origin
 * @static
 */
function Point$getOrigin() {
	return origin;
}

Point.prototype.getOrigin = Point$getOrigin;

module.exports = Point;
