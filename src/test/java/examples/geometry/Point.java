package examples.geometry;

public class Point extends Vector {
	Point(double... arguments) {
		super(arguments);
	}

	static Point origin = new Point(0, 0);

	/**
	 * @return {Point} the origin
	 */
	public static Point getOrigin() {
		return origin;
	}

}
