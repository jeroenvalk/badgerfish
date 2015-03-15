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

/* global location, DEBUG:true, __karma__, open */
(function() {
	var allTestFiles = [];
	var TEST_REGEXP = /(spec|test)\.js$/i;

	var converted = {};
	Object.keys(__karma__.files).forEach(function(file) {
		if (TEST_REGEXP.test(file)) {
			// Normalize paths to RequireJS module names.
			allTestFiles.push(file);
		} else {
			// copy timestamps for proxied urls
			var index = file.lastIndexOf('src/main/javascript/');
			if (index > 0) {
				converted["/base/src/test/javascript/" + file.substr(index + 20)] = __karma__.files[file];
			}
		}
	});
	Object.keys(converted).forEach(function(file) {
		__karma__.files[file] = converted[file];
	});

	require([ "/base/src/test/javascript/nl/agentsatwork/globals/Definition.js" ], function() {
		require.config({
			// Karma serves files under /base, which is the basePath from your
			// config
			// file
			baseUrl : '/base/src/test',

			// dynamically load all test files
			deps : allTestFiles,

			// we have to kickoff jasmine, as it is asynchronous
			callback : function() {
				DEBUG = true;
				if (location.pathname !== '/debug.html')
					open("http://localhost:8080/", 'test');
				__karma__.start();
			}
		});
	});
}).call(this);
