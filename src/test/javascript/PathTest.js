define([ "../../main/javascript/Private", "../../main/javascript/Path" ], function(Private, Path) {
	var properties = new Private(PathTest);

	function PathTest() {
		properties.setPrivate(this, {});
	}
	PathTest.isTestCase = true;

	PathTest.prototype.setup = function PathTest$setup() {
		var x = properties.getPrivate(this);
	};

	PathTest.prototype.testToString = function PathTest$testToString() {
		path = new Path("$.store.book[*].author");
		path = new Path("$..author");
		path = new Path("$.store.*");
		path = new Path("$.store..price");
		path = new Path("$..book[2]");
		path = new Path("$..book[(@.length-1)]");
		path = new Path("$..book[-1:]");
		path = new Path("$..book[0,1]");
		path = new Path("$..book[:2]");
		path = new Path("$..book[?(@.isbn)]");
		path = new Path("$..book[?(@.price<10)]");
		path = new Path("$..*");
		path = new Path("/store/book/author");
		path = new Path("//author");
		path = new Path("/store/*");
		path = new Path("/store//price");
		path = new Path("//book[3]");
		path = new Path("//book[last()]");
		path = new Path("//book[position()<3]");
		path = new Path("//book[isbn]");
		path = new Path("//book[price<10]");
		path = new Path("//*");

	};

	PathTest.prototype.testNormalize = function PathTest$testNormalize() {

	};

	PathTest.prototype.testJoin = function PathTest$testJoin() {

	};

	PathTest.prototype.testResolve = function PathTest$testResolve() {

	};

	PathTest.prototype.testRelative = function PathTest$testRelative() {

	};

	PathTest.prototype.testDirname = function PathTest$testDirname() {

	};

	PathTest.prototype.testBasename = function PathTest$testBasename() {

	};

	PathTest.prototype.testExtname = function PathTest$testExtname() {

	};

	return PathTest;
});
