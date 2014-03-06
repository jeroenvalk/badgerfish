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

var xpath = require('xpath');
var DOMParser = require('xmldom').DOMParser;

function Grunt() {
	this.grunt = null;
}

function Grunt$getPackage() {
	return this.grunt.file.readJSON('package.json');
}

function Grunt$getConfig() {
	return this.grunt.file.readJSON('Gruntfile.json');
}

function Grunt$Grunt(grunt) {
	this.grunt = grunt;
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	for ( var prop in this) {
		if (prop.substr(0, 4) === "task" && this[prop] instanceof Function) {
			var name = prop.substr(4, 1).toLowerCase() + prop.substr(5);
			grunt.registerTask(name, this[prop]());
		}
	}

	var config = this.getConfig();
	config.pkg = this.getPackage();

	// defaults
	if (!config.clean)
		config.clean = [ 'dist' ];

	if (!config.http)
		config.http = {};

	if (!config.http.require)
		config.http.require = {
			options : {
				url : "http://requirejs.org/docs/release/2.1.11/comments/require.js"
			},
			dest : "dist/lib/require.js"
		};

	if (!config.http.angular)
		config.http.angular = {
			options : {
				url : "http://code.angularjs.org/1.2.13/angular.js"
			},
			dest : "dist/lib/angular.js"
		};

	grunt.initConfig(config);
}

function Grunt$taskVerify() {
	var grunt = this.grunt;
	var pkg = this.getPackage();
	return function() {
		var pom = new DOMParser().parseFromString(fs.readFileSync("pom.xml", {
			encoding : "utf8"
		}));
		if (pkg.name !== xpath.select("/project/artifactId/text()", pom)[0].data) {
			grunt.log
					.error("ArtifactId in POM does not match 'name' property in package.json");
			return false;
		}
		if (pkg.version !== xpath.select("/project/version/text()", pom)[0].data) {
			grunt.log
					.error("Version in POM does not match 'version' property in package.json");
			return false;
		}
	};
}

function Grunt$taskInitialize() {
	return function() {
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
	};
}

function Grunt$taskServer() {
	return function(target) {
		var done = this.async();
		switch (target) {
		case "node":
			var cli = spawn("node/node", [
					"node_modules/jasmine-node/bin/jasmine-node", "src/spec/",
					"--captureExceptions", "--autotest" ]);
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
			var selenium = spawn("node/node", [
					"node_modules/protractor/bin/webdriver-manager", "start" ]);
			if (!fs.statSync("target").isDirectory()) {
				fs.mkdirSync("target");
			}
			var writable = fs.createWriteStream("target/selenium.log");
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
			throw new Error("target '" + target + "' not defined");
		}
	};
}

function Grunt$taskServe() {
	return [ "connect:test" ];
}

Grunt.prototype.getPackage = Grunt$getPackage;
Grunt.prototype.getConfig = Grunt$getConfig;
Grunt.prototype.Grunt = Grunt$Grunt;
Grunt.prototype.taskVerify = Grunt$taskVerify;
Grunt.prototype.taskInitialize = Grunt$taskInitialize;
Grunt.prototype.taskServer = Grunt$taskServer;
Grunt.prototype.taskServe = Grunt$taskServe;

module.exports = Grunt;
