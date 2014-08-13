define([ "../../main/javascript/Private", "../../main/javascript/Path" ], function(Private, Path) {
	var properties = new Private(PathTest);

	function PathTest() {
		properties.setPrivate(this, {});
	}
	PathTest.isTestCase = true;

	PathTest.prototype.setup = function PathTest$setup() {
		var x = properties.getPrivate(this);
		x.content = {
			"store" : {
				"book" : [ {
					"category" : "reference",
					"author" : "Nigel Rees",
					"title" : "Sayings of the Century",
					"price" : 8.95
				}, {
					"category" : "fiction",
					"author" : "Evelyn Waugh",
					"title" : "Sword of Honour",
					"price" : 12.99
				}, {
					"category" : "fiction",
					"author" : "Herman Melville",
					"title" : "Moby Dick",
					"isbn" : "0-553-21311-3",
					"price" : 8.99
				}, {
					"category" : "fiction",
					"author" : "J. R. R. Tolkien",
					"title" : "The Lord of the Rings",
					"isbn" : "0-395-19395-8",
					"price" : 22.99
				} ],
				"bicycle" : {
					"color" : "red",
					"price" : 19.95
				}
			}
		};
	};

	PathTest.prototype.testJSONPathA = function PathTest$testJSONPathA() {
		new Path("$.store.book[*].author");
		new Path("$.store.book.author");
	};

	PathTest.prototype.testJSONPathB = function PathTest$testJSONPathB() {
		new Path("$..author");
	};

	PathTest.prototype.testJSONPathC = function PathTest$testJSONPathC() {
		new Path("$.store.*");
	};

	PathTest.prototype.testJSONPathD = function PathTest$testJSONPathD() {
		new Path("$.store..price");
	};

	PathTest.prototype.testJSONPathE = function PathTest$testJSONPathE() {
		new Path("$..book[2]");
	};

	PathTest.prototype.testJSONPathF = function PathTest$testJSONPathF() {
		new Path("$..book[(@.length-1)]");
		new Path("$..book[-1:]");
	};

	PathTest.prototype.testJSONPathG = function PathTest$testJSONPathG() {
		new Path("$..book[0,1]");
		new Path("$..book[:2]");
	};

	PathTest.prototype.testJSONPathH = function PathTest$testJSONPathH() {
		new Path("$..book[?(@.isbn)]");
	};

	PathTest.prototype.testJSONPathI = function PathTest$testJSONPathI() {
		new Path("$..book[?(@.price<10)]");
	};

	PathTest.prototype.testJSONPathJ = function PathTest$testJSONPathJ() {
		new Path("$..*");
	};

	PathTest.prototype.testXPathA = function PathTest$testXPathA() {
		new Path("/store/book/author");
	};
	
	PathTest.prototype.testXPathB = function PathTest$testXPathB() {
		new Path("//author");
	};
	
	PathTest.prototype.testXPathC = function PathTest$testXPathC() {
		new Path("/store/*");
	};
	
	PathTest.prototype.testXPathD = function PathTest$testXPathD() {
		new Path("/store//price");
	};
	
	PathTest.prototype.testXPathE = function PathTest$testXPathE() {
		new Path("//book[3]");
	};
	
	PathTest.prototype.testXPathF = function PathTest$testXPathF() {
		new Path("//book[last()]");
	};
	
	PathTest.prototype.testXPathG = function PathTest$testXPathG() {
		new Path("//book[position()<3]");
	};
	
	PathTest.prototype.testXPathH = function PathTest$testXPathH() {
		new Path("//book[isbn]");
	};
	
	PathTest.prototype.testXPathI = function PathTest$testXPathI() {
		new Path("//book[price<10]");
	};
	
	PathTest.prototype.testXPathJ = function PathTest$testXPathJ() {
		new Path("//*");
	};
	
	return PathTest;
});
