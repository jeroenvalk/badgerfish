package examples.geometry;

import org.junit.Before;

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
