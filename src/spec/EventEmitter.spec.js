var EventEmitter = require("events").EventEmitter;

describe('EventEmitter', function() {
	var ee = null;

	beforeEach(function() {
		ee = new EventEmitter();
	});

	describe('listeners()', function() {
		it("initialises the event object and a listener array", function() {
			expect(ee.listeners('foo')).toEqual([]);
		});
		
		it('does overwrite listener arrays', function() {
			var listeners = ee.listeners('foo');
			listeners.push('bar');
			expect(ee.listeners('foo')).toEqual([]);
		});

		it('does not return matched sub-strings', function () {
			var check = function () {};

			ee.addListener('foo', function () {});
			ee.addListener('fooBar', check);

			var listeners = ee.listeners('fooBar');
			expect(listeners.length).toBe(1);
			expect(listeners[0]).toBe(check);
		});
	});
});
