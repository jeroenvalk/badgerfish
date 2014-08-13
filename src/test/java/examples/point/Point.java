package examples.point;

import examples.geometry.IPoint;

public class Point implements IPoint {
	private double x, y;

	Point(double x, double y) {
		this.x = x;
		this.y = y;
	}

	static Point origin = new Point(0, 0);

	/**
	 * @return {Point} the origin
	 */
	static public Point getOrigin() {
		return origin;
	}

	/**
	 * @return {Point} result of addition
	 */
	public Point add(double... arguments) {
		return new Point(this.x + (0 < arguments.length ? arguments[0] : 0),
				this.y + (1 < arguments.length ? arguments[1] : 0));
	}

	/**
	 * Resets the point to the origin. Note that the point is modified by this
	 * operation.
	 * 
	 * @return {Point} this point for method chaining
	 */
	public IPoint clear() {
		this.x = 0;
		this.y = 0;
		return this;
	}

	/**
	 * @return {double} distance between the two points
	 */
	public double distance(IPoint point) {
		double xDiff = x - ((Point) point).x;
		double yDiff = y - ((Point) point).y;
		return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
	}

	public boolean equals(Object point) {
		return this.x == ((Point) point).x && this.y == ((Point) point).y;
	}
}
