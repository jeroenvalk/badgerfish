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

var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.registerTask("initialize", function() {
		var done = this.async();
		var cli = spawn("node/node", [
				"node_modules/protractor/bin/webdriver-manager", "update" ]);
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

	grunt
			.registerTask(
					"server",
					function(target) {
						var done = this.async();
						switch (target) {
						case "node":
							var cli = spawn(
									"node/node",
									[
											"node_modules/jasmine-node/bin/jasmine-node",
											"src/spec/", "--captureExceptions",
											"--autotest" ]);
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
							break;
						case "selenium":
							var selenium = spawn(
									"node/node",
									[
											"node_modules/protractor/bin/webdriver-manager",
											"start" ]);
							if (!fs.statSync("target").isDirectory()) {
								fs.mkdirSync("target");
							}
							var writable = fs
									.createWriteStream("target/selenium.log");
							selenium.stdout.pipe(writable);
							selenium.stderr.pipe(writable);
							var cli = spawn("node/node", [
									"node_modules/protractor/bin/protractor",
									"src/test/conf.js" ]);
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
							break;
						default:
							throw new Error("target '" + target +
									"' not defined");
						}
					});

	grunt.registerTask("serve", [ "connect:test" ]);

	// Define the configuration for all the tasks
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		clean : [ "dist" ],

		connect : {
			test : {
				options : {
					open : true,
					keepalive : true,
					port : 8080,
					base : "src/test/webapp"
				}
			}
		}
	});
};

console.log("GUID" + process.pid);
