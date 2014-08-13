define([ "../../../../main/javascript/Private" ], function(Private) {
	var properties = new Private(AbstractPointTest);

	function AbstractPointTest(Point) {
		console.assert(Point);
		properties.setPrivate(this, {
			Point : Point,
			origin : null
		});
	}

	function AbstractPointTest$setup() {
		var x = properties.getPrivate(this);
		x.origin = x.Point.getOrigin();
	}

	function AbstractPointTest$testGetOrigin() {
		var x = properties.getPrivate(this);
		expect(x.origin.distance(x.origin.add(0, 0))).toBe(0);
		expect(x.origin.getOrigin()).toBe(x.origin);
		expect(x.Point.getOrigin()).toBe(x.origin);
	}

	function AbstractPointTest$testAdd() {
		var x = properties.getPrivate(this);
		var point = x.origin.add(3);
		expect(point.distance(x.origin)).toBe(3);
		point = point.add(0, 4);
		expect(point.distance(x.origin)).toBe(5);
	}

	function AbstractPointTest$testClear() {
		var x = properties.getPrivate(this);
		var point = x.origin.add(1, 1);
		expect(point.equals(x.origin)).toBe(false);
		expect(point).toBe(point.clear());
		expect(x.origin).not.toBe(point);
		expect(point.equals(x.origin)).toBe(true);
	}

	function AbstractPointTest$testDistance() {
		var x = properties.getPrivate(this);
		var point = x.origin.add(7, 11);
		expect(point.distance(point.add(3, 4))).toBe(5);
	}

	AbstractPointTest.prototype.setup = AbstractPointTest$setup;
	AbstractPointTest.prototype.testGetOrigin = AbstractPointTest$testGetOrigin;
	AbstractPointTest.prototype.testAdd = AbstractPointTest$testAdd;
	AbstractPointTest.prototype.testClear = AbstractPointTest$testClear;
	AbstractPointTest.prototype.testDistance = AbstractPointTest$testDistance;

	return AbstractPointTest;
});
