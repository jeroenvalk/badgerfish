define([ "../../../../main/javascript/Serializable", "../../../../main/javascript/Private" ], function(Serializable, Private) {
	var properties = new Private(Point);

	/**
	 * @constructor
	 */
	function Point(x, y) {
		var p = {
			x : x,
			y : y
		};
		properties.setPrivate(this, p);
		Serializable.call(this, p);
	}

	require("util").inherits(Point, Serializable);

	var origin = new Point(0, 0);

	/**
	 * @return {Point} the origin
	 * @static
	 */
	function Point$getOrigin() {
		return origin;
	}

	/**
	 * @return {Point} result of addition
	 */
	function Point$add(x, y) {
		var p = properties.getPrivate(this);
		return new Point(p.x + (x ? x : 0), p.y + (y ? y : 0));
	}

	/**
	 * Resets the point to the origin. Note that the point is modified by this
	 * operation.
	 * 
	 * @return {Point} this point for method chaining
	 */
	function Point$clear() {
		var p = properties.getPrivate(this);
		p.x = 0;
		p.y = 0;
		return this;
	}

	/**
	 * @return {number} distance between the two points
	 */
	function Point$distance(point) {
		var p = properties.getPrivate(this);
		var pp = properties.getPrivate(point);
		var xDiff = p.x - pp.x;
		var yDiff = p.y - pp.y;
		return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
	}

	Point.getOrigin = Point$getOrigin;
	Point.prototype.getOrigin = Point$getOrigin;
	Point.prototype.add = Point$add;
	Point.prototype.clear = Point$clear;
	Point.prototype.distance = Point$distance;

	return Point;
});
