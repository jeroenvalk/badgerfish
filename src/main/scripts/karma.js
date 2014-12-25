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

/* global window */
(function(_define) {
	this.GLOBAL = this;

	GLOBAL.define = function(closure) {
		GLOBAL.define = closure();
		GLOBAL.DEBUG = false;

		var allTestFiles = [];
		var TEST_REGEXP = /(spec|test)\.js$/i;

		var pathToModule = function(path) {
			return path.replace(/^\/base\//, '').replace(/\.js$/, '');
		};

		Object.keys(window.__karma__.files).forEach(function(file) {
			if (TEST_REGEXP.test(file)) {
				// Normalize paths to RequireJS module names.
				allTestFiles.push(pathToModule(file));
			}
		});

		require.config({
			// Karma serves files under /base, which is the basePath from your
			// config
			// file
			baseUrl : '/base',

			// dynamically load all test files
			deps : allTestFiles,

			// we have to kickoff jasmine, as it is asynchronous
			callback : function() {
				GLOBAL.define.configure();
				var DefinitionTest = GLOBAL.define.classOf("nl.agentsatwork.globals.DefinitionTest");
				new DefinitionTest();
				GLOBAL.DEBUG = true;
				if (location.pathname !== '/debug.html')
					GLOBAL.open("http://localhost:8080/", '_blank');
				GLOBAL.__karma__.start();
			}
		});
	};
}).call(this, this.define);
