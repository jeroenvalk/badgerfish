package spec.geometry;

import org.junit.Before;

import spec.AbstractPointTest;
import examples.IPoint;
import examples.geometry.Point;

public class PointTest extends AbstractPointTest {

	@Before
	public void setUp() throws Exception {
		origin = Point.getOrigin();
	}

	@SuppressWarnings("static-access")
	@Override
	protected IPoint getOriginInstance(IPoint instance) {
		return ((Point) instance).getOrigin();
	}

	@Override
	protected IPoint getOriginClass() {
		return Point.getOrigin();
	}

}
