'use strict';

/**
 * Copyright © 2014 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software: you can
 * redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version. Badgerfish CPX is
 * distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details. You should have received a copy of the GNU Lesser General Public
 * License along with Badgerfish CPX. If not, see
 * <http://www.gnu.org/licenses/>.
 */

var spawn = require('child_process').spawn;

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.registerTask("serve", function() {
		var done = this.async();
		var cli = spawn("node/node", [
				"node_modules/jasmine-node/bin/jasmine-node", "--noColor",
				"--autotest", "src/spec/" ]);
		cli.stdout.on("data", function(chunk) {
			process.stdout.write(chunk);
		});
		cli.stderr.on("data", function(chunk) {
			process.stderr.write(chunk);
		});
		cli.on("close", function() {
			cli.stdin.end();
			done();
		});
	});

	// Define the configuration for all the tasks
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		clean : [ "dist" ]
	});
};
