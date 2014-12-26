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

/* global define, DEBUG, expect */
define(function() {
	function class_Promise() {
		var Promise = this.Promise =
		/**
		 * @param {Promise|Function}
		 *            value - prerequisite value (as another promise) used to
		 *            calculate this promises result, or value is obtained by
		 *            calling a function with private_Promise$done as a callback
		 * @param {Function}
		 *            [onSuccess] - optional function that is called on success
		 *            to compute the result; function can return a direct value
		 *            or another promise; no function means identity is to be
		 *            computed on the value parameter
		 * @param {Function}
		 *            [onFailure] - optional function called when this promise
		 *            resolves to error
		 * @constructor
		 */
		function Promise(value, onSuccess, onFailure) {
			var result;
			var continuations = [];

			this.done =
			/**
			 * @param {Function}
			 *            onSuccess - called when this promise has resolved to a
			 *            value; return value ignored
			 * @param {Function}
			 *            onFailure - called when this promise has resolved to
			 *            an error
			 * @returns value or error if this promise is already resolved;
			 *          otherwise undefined is returned
			 */
			function Promise$done(onSuccess, onFailure) {
				if (result === undefined) {
					if (onSuccess || onFailure)
						continuations.push([ onSuccess, onFailure ]);
					return;
				}
				if (result instanceof Error) {
					if (onFailure)
						onFailure.call(null, result);
				} else {
					if (onSuccess)
						onSuccess.call(null, result);
				}
				return result;
			};

			function private_Promise$done(value, isErr) {
				if (value === undefined)
					throw new Error("Promise: undefined cannot resolve as value");
				result = value;
				continuations.forEach(function(cont) {
					cont[isErr ? 1 : 0].call(null, value);
				});
				continuations.length = 0;
			}

			function private_Promise$onFailure(e) {
				if (e === undefined)
					throw new Error("promise: udefined cannot resolve as error");
				onFailure.call(null, e);
				private_Promise$done(e, true);
			}

			function private_Promise$onSuccess(value) {
				var promise;
				try {
					promise = onSuccess.call(null, value);
				} catch (e) {
					private_Promise$onFailure(e);
				}
				if (promise instanceof Promise) {
					promise.done(private_Promise$done, private_Promise$onFailure);
				} else {
					private_Promise$done(promise, false);
				}
			}

			if (value instanceof Promise) {
				value.done(private_Promise$onSuccess, private_Promise$onFailure);
			} else {
				DEBUG && expect(onSuccess).not.toBeDefined();
				DEBUG && expect(onFailure).not.toBeDefined();
				value.call(null, private_Promise$done);
			}
		};

		this.then =
		/**
		 * @param {Function}
		 *            onSuccess - called when this promise has resolved to a
		 *            value; return value matters
		 * @param {Function}
		 *            onFailure - called when this promise has resolved to an
		 *            error
		 * @returns {Promise} promise associated with the return value of the
		 *          onSuccess function
		 */
		function Promise$then(onSuccess, onFailure) {
			return new Promise(this, onSuccess, onFailure);
		};

		Promise.when =
		/**
		 * @param {Promise...|Function...}
		 *            promises and asynchronous callbacks
		 * @returns {Promise} promise that is done when all arguments are done
		 * @static
		 */
		function definition$when() {
			function definition$when$error() {
				throw new Error("promise$when: failed promise");
			}

			var done;
			function definition$when$closure(_done) {
				done = _done;
			}

			var count = arguments.length, result = new Array(count);
			if (!count)
				throw new Error("definition$when: missing arguments");
			function definition$when$done(i) {
				return function definition$when$done$done(value) {
					result[i] = value;
					if (!--count) {
						switch (result.length) {
						case 1:
							done(result[0]);
							break;
						default:
							done(result);
						}
					}
				};
			}

			var promise = new Promise(definition$when$closure);
			for (var i = 0; i < arguments.length; ++i) {
				if (arguments[i] instanceof Promise) {
					arguments[i].done(definition$when$done(i), definition$when$error);
				} else {
					arguments[i].call(null, definition$when$done(i));
				}
			}
			return promise;
		};
	}
	return class_Promise;
});
