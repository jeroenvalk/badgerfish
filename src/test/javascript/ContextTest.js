define([ "../../main/javascript/Private", "../../main/javascript/Path" ], function(Private, Path) {
	var properties = new Private(PathTest);

	function PathTest() {
		properties.setPrivate(this, {});
	}
	PathTest.isTestCase = false;

	PathTest.prototype.setup = function PathTest$setup() {
		var x = properties.getPrivate(this);
		x.json = {
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
		var path = new Path("$.store.book[*].author");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[0].author, books[1].author, books[2].author, books[3].author ];
		var result = path.selectStrings();
		assert.deepEqual(expected, result);
		
		path = new Path("$.store.book.author");
		result = path.selectStrings();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathB = function PathTest$testJSONPathB() {
		var path = new Path("$..author");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[0].author, books[1].author, books[2].author, books[3].author ];
		var result = path.selectStrings();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathC = function PathTest$testJSONPathC() {
		var path = new Path("$.store.*");
		var x = properties.getPrivate(this);
		var expected = [ x.json.store.book, x.json.store.bicycle ];
		var result = path.selectJSON();
		assert.deepEqual(expected, result);
		
		expected = x.json.store.book.concat([x.json.store.bicycle]);
		result = path.selectObjects();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathD = function PathTest$testJSONPathD() {
		var path = new Path("$.store..price");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[0].price, books[1].price, books[2].price, books[3].price, x.json.store.bicycle.price ];
		var result = path.selectNumbers();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathE = function PathTest$testJSONPathE() {
		var path = new Path("$..book[2]");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[2] ];
		var result = path.selectObjects();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathF = function PathTest$testJSONPathF() {
		var path = new Path("$..book[(@.length-1)]");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[3] ];
		var result = path.selectObjects();
		test.deepEqual(expected, result);

		path = new Path("$..book[-1:]");
		result = path.selectObjects();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathG = function PathTest$testJSONPathG() {
		var path = new Path("$..book[0,1]");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[0], books[1] ];
		var result = path.selectObjects();
		test.deepEqual(expected, result);

		var path = new Path("$..book[:2]");
		result = path.selectObjects();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathH = function PathTest$testJSONPathH() {
		var path = new Path("$..book[?(@.isbn)]");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[2], books[3] ];
		var result = path.selectObjects();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathI = function PathTest$testJSONPathI() {
		var path = new Path("$..book[?(@.price<10)]");
		var x = properties.getPrivate(this);
		var books = x.json.store.book;
		var expected = [ books[0], books[2] ];
		var result = path.selectObjects();
		assert.deepEqual(expected, result);
	};

	PathTest.prototype.testJSONPathJ = function PathTest$testJSONPathJ() {
		var path = new Path("$..*");
		var x = properties.getPrivate(this);
		var expected = [ x.json.store, x.json.store.book, x.json.store.bicycle, ];
		x.json.store.book.forEach(function(book) {
			expected.push(book);
		});
		x.json.store.book.forEach(function(book) {
			Object.keys(book).forEach(function(p) {
				expected.push(book[p]);
			});
		});
		expected.push(x.json.store.bicycle.color);
		expected.push(x.json.store.bicycle.price);

		var result = path.selectAll;
		assert.deepEqual(expected, result);
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
