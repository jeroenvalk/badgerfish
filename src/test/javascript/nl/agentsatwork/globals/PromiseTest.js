/**
 * Copyright © 2014 dr. ir. Jeroen M. Valk
 * 
 * This file is part of ComPosiX. ComPosiX is free software: you can
 * redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 * 
 * ComPosiX is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with ComPosiX. If not, see <http://www.gnu.org/licenses/>.
 */

/* global define, jasmine, expect */
define([ 'javascript/nl/agentsatwork/testing/JasmineTestCase', 'javascript/nl/agentsatwork/globals/Promise' ], function(classJasmineTestCase) {
	return function class_PromiseTest(properties) {
		properties.extends([classJasmineTestCase]);

		this.PromiseTest = function PromiseTest() {
			properties.getBase().call(this);
		};

		this.xtestDone = function PromiseTest$testDone() {
			var e = new Error();

			var executor = jasmine.createSpy("executor");
			var success = jasmine.createSpy("success");
			var failure = jasmine.createSpy("failure");
			executor.and.throwError(e);
			var promise = new Promise(executor);
			expect(executor).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(promise.done(success, failure)).toBe(e);
			expect(success).not.toHaveBeenCalled();
			expect(failure).toHaveBeenCalledWith(e);
			expect(failure.calls.count()).toBe(1);
			expect(executor.calls.count()).toBe(1);
			executor.calls.reset();
			success.calls.reset();
			failure.calls.reset();

			executor.and.returnValue(e);
			promise = new Promise(executor);
			expect(executor).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(promise.done(success, failure)).toBe(e);
			expect(success).toHaveBeenCalledWith(e);
			expect(failure).not.toHaveBeenCalled();
			expect(success.calls.count()).toBe(1);
			expect(executor.calls.count()).toBe(1);
			executor.calls.reset();
			success.calls.reset();
			failure.calls.reset();

			var resolve, reject;
			promise = new Promise(function(_resolve, _reject) {
				resolve = _resolve;
				reject = _reject;
			});
			expect(promise.done(success, failure)).toBeUndefined();
			resolve();
			resolve(e);
			reject(e);
			reject();
			expect(promise.done(success, failure)).toBeUndefined();
			expect(success).toHaveBeenCalledWith();
			expect(success.calls.count).toBe(1);
			expect(failure).not.toHaveBeenCalled();
		};
		
		this.xtestThen = function PromiseTest$then() {
			var resolve, reject;
			var promise = new Promise(function(_resolve, _reject) {
				resolve = _resolve;
				reject = _reject;
			});
			var success = jasmine.createSpy("success");
			var failure = jasmine.createSpy("failure");
			var failure2 = jasmine.createSpy("failure2");
			var failure3 = jasmine.createSpy("failure3");
			var executor = jasmine.createSpy("executor");
			executor.and.throwError();
			var chain = jasmine.createSpy("chain");
			chain.and.returnValue(new Promise(executor));
			promise.then(chain,failure).then(success,failure2).then(success,failure3);
			resolve(1);
			expect(chain).toHaveBeenCalledWith(1);
			expect(success).not.toHaveBeenCalled();
			expect(failure).not.toHaveBeenCalled();
			expect(failure2).toHaveBeenCalledWith(jasmine.any(Error));
			expect(failure3).toHaveBeenCalledWith(jasmine.any(Error));
		};
	};
});