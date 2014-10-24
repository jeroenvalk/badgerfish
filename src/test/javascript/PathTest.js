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
		path = Path.normalize("$.store.book[*].author");
		path = Path.normalize("$..author");
		path = Path.normalize("$.store.*");
		path = Path.normalize("$.store..price");
		path = Path.normalize("$..book[2]");
		path = Path.normalize("$..book[(@.length-1)]");
		path = Path.normalize("$..book[-1:]");
		path = Path.normalize("$..book[0,1]");
		path = Path.normalize("$..book[:2]");
		path = Path.normalize("$..book[?(@.isbn)]");
		path = Path.normalize("$..book[?(@.price<10)]");
		path = Path.normalize("$..*");
		path = Path.normalize("#/store/book/author");
		path = Path.normalize("#//author");
		path = Path.normalize("#/store/*");
		path = Path.normalize("#/store//price");
		path = Path.normalize("#//book[3]");
		path = Path.normalize("#//book[last()]");
		path = Path.normalize("#//book[position()<3]");
		path = Path.normalize("#//book[isbn]");
		path = Path.normalize("#//book[price<10]");
		path = Path.normalize("#//*");

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
