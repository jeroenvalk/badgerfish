package examples.geometry;

import org.junit.Assert;
import org.junit.Test;

abstract public class AbstractPointTest {
	protected IPoint origin;

	abstract protected IPoint getOriginInstance(IPoint instance);

	abstract protected IPoint getOriginClass();

	@Test
	public void testGetOrigin() {
		Assert.assertEquals(0, origin.distance(origin.add(0, 0)), 0.0001);
		Assert.assertSame(origin, getOriginInstance(origin));
		Assert.assertSame(origin, getOriginClass());
	}

	@Test
	public void testAdd() {
		IPoint point = origin.add(3);
		Assert.assertEquals(3.0, point.distance(origin), 0.0001);
		point = point.add(0, 4);
		Assert.assertEquals(5.0, point.distance(origin), 0.0001);
	}

	@Test
	public void testClear() {
		IPoint point = origin.add(1, 1);
		Assert.assertFalse(point.equals(origin));
		Assert.assertSame(point, point.clear());
		Assert.assertNotSame(origin, point);
		Assert.assertTrue(point.equals(origin));
	}

	@Test
	public void testDistance() {
		IPoint point = origin.add(7, 11);
		Assert.assertEquals(5.0, point.distance(point.add(3, 4)), 0.0001);
	}

}
