package spec.point;

import org.junit.Before;

import examples.IPoint;
import examples.point.Point;
import spec.AbstractPointTest;

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
