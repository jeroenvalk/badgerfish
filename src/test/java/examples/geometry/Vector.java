package examples.geometry;

import java.util.Arrays;

/**
 * A vector is a geometric quantify having a magnitude and direction. They are
 * expressed as tuples of numbers, which can be passed as arguments to the
 * constructor.
 */
public class Vector implements IPoint {
	final private double[] array;

	Vector(double... arguments) {
		array = new double[arguments.length];
		for (int i = 0; i < arguments.length; ++i) {
			array[i] = arguments[i];
		}
	}

	/**
	 * @return an exact clone of this vector
	 */
	public Vector clone() {
		return new Vector(array.clone());
	}

	/**
	 * Consecutively adds the arguments to the numbers in the vector.
	 * 
	 * @return a new clone of this vector with the arguments added
	 */
	public Vector add(double... arguments) {
		Vector result = this.clone();
		double[] array = result.array;
		for (int i = 0; i < array.length; ++i) {
			array[i] += i < arguments.length ? arguments[i] : 0;
		}
		return result;
	}

	/**
	 * Sets all numbers in this vector to zero. Note that the vector is modified by
	 * this operation.
	 * 
	 * @return this vector (useful for chaining)
	 */
	public Vector clear() {
		for (int i = 0; i < array.length; ++i) {
			array[i] = 0;
		}
		return this;
	}

	/**
	 * Computes the distance between this and another vector.
	 * 
	 * @return distance between two vectors
	 */
	public double distance(IPoint vector) {
		double diff, result = 0;
		double[] arrayB = ((Vector) vector).array;
		if (array.length == arrayB.length) {
			for (int i = 0; i < array.length; ++i) {
				diff = array[i] - arrayB[i];
				result += diff * diff;
			}
		}
		return Math.sqrt(result);
	}

	public boolean equals(Object vector) {
		return Arrays.equals(this.array, ((Vector) vector).array);
	}
}
