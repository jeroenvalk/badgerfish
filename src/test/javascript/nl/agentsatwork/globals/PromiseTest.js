/**
 * Copyright © 2014, 2015 dr. ir. Jeroen M. Valk
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
define([ 'javascript/nl/agentsatwork/testing/AsyncJasmineTestCase' ], function(classJasmineTestCase) {
	return function class_PromiseTest(properties) {
		properties.extends([classJasmineTestCase]);

		this.constructor = function PromiseTest() {
			properties.getPrototype(1).constructor.call(this);
		};

		this.testFailures = function PromiseTest$testFailures(done) {
			var e1 = new Error();
			var e2 = new Error();
			var e3 = new Error();

			var success = jasmine.createSpy("success");
			var failure = jasmine.createSpy("failure");
			var executor = jasmine.createSpy("throwingExecutor");
			executor.and.throwError(e1);
			
			// test rejecting by throwing
			var promise = new Promise(executor);
			expect(executor).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(executor.calls.count()).toBe(1);
			executor.calls.reset();

			expect(promise.then(success, failure)).toEqual(jasmine.any(Promise));
			expect(promise.catch(failure)).toEqual(jasmine.any(Promise));
			expect(success).not.toHaveBeenCalled();
			expect(failure).not.toHaveBeenCalled();
			
			// test rejecting by calling reject
			executor = jasmine.createSpy("executor");
			promise = new Promise(executor);
			expect(executor).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(executor.calls.count()).toBe(1);
			executor.calls.argsFor(0)[1](e2);
			executor.calls.reset();

			expect(promise.then(success, failure)).toEqual(jasmine.any(Promise));
			expect(promise.catch(failure)).toEqual(jasmine.any(Promise));
			expect(success).not.toHaveBeenCalled();
			expect(failure).not.toHaveBeenCalled();
			
			// test pending Promise
			promise = new Promise(executor);
			expect(executor).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(executor.calls.count()).toBe(1);

			var noSuccess = jasmine.createSpy("noSuccess");
			var noFailure = jasmine.createSpy("noFailure");
			var throwingFailure = jasmine.createSpy("throwingFailure");
			expect(promise.then(success, noFailure).then(noSuccess).catch(failure)).toEqual(jasmine.any(Promise));
			expect(success).not.toHaveBeenCalled();
			expect(failure).not.toHaveBeenCalled();
			
			success.and.throwError(e3);
			throwingFailure.and.throwError(e2);
			
			setTimeout(function() {
				expect(failure).toHaveBeenCalledWith(e1);
				expect(failure).toHaveBeenCalledWith(e2);
				expect(failure.calls.count()).toBe(4);
				failure.calls.reset();

				expect(executor.calls.count()).toBe(1);
				executor.calls.argsFor(0)[0](42);
				expect(success).not.toHaveBeenCalled();
				expect(failure).not.toHaveBeenCalled();

				setTimeout(function() {
					expect(noSuccess).not.toHaveBeenCalled();
					expect(noFailure).not.toHaveBeenCalled();
					expect(success).toHaveBeenCalledWith(42);
					expect(failure).toHaveBeenCalledWith(e3);
					expect(success.calls.count()).toBe(1);
					expect(failure.calls.count()).toBe(1);
					done();					
				}, 0);
			}, 0);
		};

		this.testSuccesses = function PromiseTest$testSuccesses(done) {
			var success = jasmine.createSpy("success");
			var failure = jasmine.createSpy("failure");
			var executor = jasmine.createSpy("throwingExecutor");
			
			// test fulfilling by calling fulfill
			executor = jasmine.createSpy("executor");
			var promise = new Promise(executor);
			expect(executor).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(executor.calls.count()).toBe(1);
			executor.calls.argsFor(0)[0](42);
			executor.calls.reset();

			expect(promise.then(success, failure)).toEqual(jasmine.any(Promise));
			expect(promise.catch(failure)).toEqual(jasmine.any(Promise));
			expect(success).not.toHaveBeenCalled();
			expect(failure).not.toHaveBeenCalled();
			
			// test pending Promise
			promise = new Promise(executor);
			expect(executor).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			expect(executor.calls.count()).toBe(1);

			var againSuccess = jasmine.createSpy("againSuccess");
			expect(promise.then(success, failure).then(againSuccess, failure).catch(failure)).toEqual(jasmine.any(Promise));
			expect(success).not.toHaveBeenCalled();
			expect(failure).not.toHaveBeenCalled();
			
			success.and.returnValue(Promise.resolve(36));
			againSuccess.and.returnValue(24);
			
			setTimeout(function() {
				expect(executor.calls.count()).toBe(1);
				expect(success).toHaveBeenCalledWith(42);
				expect(success.calls.count()).toBe(1);
				
				executor.calls.argsFor(0)[0](12);
				expect(againSuccess).not.toHaveBeenCalled();
				expect(failure).not.toHaveBeenCalled();

				setTimeout(function() {
					expect(success).toHaveBeenCalledWith(12);
					expect(success.calls.count()).toBe(2);
					expect(againSuccess).toHaveBeenCalledWith(36);
					expect(againSuccess.calls.count()).toBe(1);
					expect(failure).not.toHaveBeenCalled();
					
					setTimeout(function() {
						expect(failure).not.toHaveBeenCalled();
						done();
					}, 0);
				}, 0);
			}, 0);
		};
		
		this.testChaining = function PromiseTest$then(done) {
			var check = jasmine.createSpy("check");
			var chain = jasmine.createSpy("chain").and.callFake(function(value) {
				return ++value;
			});
			Promise.accept(1).then(chain).then(chain).then(chain);
			
			Promise.reject(0).catch(chain).then(check);

			expect(check).not.toHaveBeenCalled();
			expect(chain).not.toHaveBeenCalled();
			
			setTimeout(function() {
				expect(check).toHaveBeenCalledWith(1);
				expect(chain).toHaveBeenCalledWith(0);
				expect(chain).toHaveBeenCalledWith(1);
				expect(chain).toHaveBeenCalledWith(2);
				expect(chain).toHaveBeenCalledWith(3);
				check.calls.reset();
				chain.calls.reset();
				
				setTimeout(function() {
					expect(check).not.toHaveBeenCalled();
					expect(chain).not.toHaveBeenCalled();
					done();
				}, 0);
			}, 0);
		};
	};
});