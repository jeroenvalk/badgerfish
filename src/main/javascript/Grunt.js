/**
 * Copyright � 2014 dr. ir. Jeroen M. Valk
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
var url = require('url');
var path = require('path');
var spawn = require('child_process').spawn;

var requirejs = require('requirejs');
var glob = require("glob");
var xpath = require('xpath');
var DOMParser = require('xmldom').DOMParser;
var Generator = require('jison').Generator;

requirejs.config({
	baseUrl : __dirname
});

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var Private = requirejs("./Private");
var properties = new Private(Grunt);
function Grunt() {
	properties.setPrivate(this, {
		grunt : null,
		downloads : {
			"lib/require.js" : "http://requirejs.org/docs/release/2.1.11/comments/require.js",
			"lib/jquery.js" : "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.0/jquery.js",
			"lib/angular.js" : "http://code.angularjs.org/1.2.13/angular.js",
			"lib/foundation.js" : "https://cdnjs.cloudflare.com/ajax/libs/foundation/5.2.3/js/foundation/foundation.js",
			"lib/foundation.css" : "https://cdnjs.cloudflare.com/ajax/libs/foundation/5.2.3/css/foundation.css"
		},
		unzip : true
	});
}

function Grunt$system(done, cmd, args, options) {
	// if relative directory does not exist then try system path
	if (cmd.substr(0, 2) === "./" && !(fs.existsSync(path.dirname(cmd)) && fs.statSync(path.dirname(cmd)).isDirectory())) {
		cmd = path.basename(cmd);
	}
	var cli = spawn(cmd, args, options);
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
}

function Grunt$curl(done) {
	this.system(done, "curl", Array.prototype.slice.call(arguments, 1));
}

function Grunt$download(target, source) {
	properties.getPrivate(this).downloads[target] = source;
}

function Grunt$getPackage() {
	return properties.getPrivate(this).grunt.file.readJSON('package.json');
}

function Grunt$middleware() {
	return [];
}

function Grunt$getConfig() {
	var config = properties.getPrivate(this).grunt.file.readJSON(path.resolve(__dirname, "../../..") + path.sep + 'Gruntfile.json');
	var name = this.middleware();
	var middleware = [];
	for ( var k = 0; k < name.length; ++k) {
		middleware.push("middleware" + name[k].substr(0, 1).toUpperCase() + name[k].substr(1));
	}
	config.connect.test.options.middleware = function(connect, options) {
		var i, result = [ function(req, res, next) {
			var parsed = url.parse(req.url, true);
			console.assert(parsed.pathname.charAt(0) === '/');
			if (parsed.search === "?") {
				var brush = "js";
				if (endsWith(parsed.pathname, ".js")) {
					brush = "js";
				} else if (endsWith(parsed.pathname, ".java")) {
					brush = "java";
				}
				res.writeHead(200, {
					'Content-Type' : 'text/xml'
				});
				res.write('<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/templates/syntaxhighlighter.xsl"?>\n<root brush="'
						+ brush + '">');
				var readable = fs.createReadStream(parsed.pathname.substr(1));
				readable.on("data", function(chunk) {
					var offset = 0;
					for ( var i = 0; i < chunk.length; ++i) {
						switch (chunk[i]) {
							case 60:
								if (offset < i)
									res.write(chunk.slice(offset, i - 1));
								offset = i + 1;
								res.write("&lt;");
								break;
							default:
								break;
						}
					}
					res.write(chunk.slice(offset));
				});
				readable.on("end", function() {
					res.write("\n</root>\n");
					res.end();
				});
			} else {
				return next();
			}
		} ];
		for (i = 0; i < options.base.length; ++i) {
			result.push(connect.static(options.base[i]));
		}
		for (i = 0; i < middleware.length; ++i) {
			result.push(this[middleware[i]](connect, options));
		}
		return result;
	};
	return config;
}

function Grunt$Grunt(grunt) {
	var x = properties.getPrivate(this);
	x.grunt = grunt;
	grunt.loadNpmTasks('grunt-curl');
	grunt.loadNpmTasks('grunt-zip');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-bower-task');
	require('time-grunt')(grunt);

	var config = this.getConfig();
	x.config = config;
	config.pkg = this.getPackage();

	for ( var target in config.pkg.downloads) {
		x.downloads[target] = config.pkg.downloads[target];
	}

	// defaults
	if (!config.clean)
		config.clean = [ 'dist' ];

	if (!config.curl)
		config.curl = {};

	if (!config.unzip)
		config.unzip = {};

	var checkA = true, checkB = true;
	for ( var target in x.downloads) {
		if (!fs.existsSync("dist/" + target)) {
			checkA = false;
			config.curl[target] = {
				src : {
					uri : x.downloads[target]
				},
				dest : "dist/" + target
			};
			if (endsWith(target, ".zip")) {
				checkB = false;
				config.unzip[target] = {
					src : "dist/" + target,
					dest : "dist",
					// fix for zipfile corrupted by the windows slash
					router : function(filepath) {
						return filepath.replace(/\\/g, "/");
					}
				};
			}
		}
	}
	if (checkA) {
		x.unzip = null;
	} else if (checkB) {
		x.unzip = false;
	}

	for ( var prop in this) {
		if (prop.substr(0, 4) === "task" && this[prop] instanceof Function) {
			var name = prop.substr(4, 1).toLowerCase() + prop.substr(5);
			grunt.registerTask(name, this[prop]());
		}
	}

	grunt.initConfig(config);
}

function Grunt$taskValidate() {
	var grunt = properties.getPrivate(this).grunt;
	var pkg = this.getPackage();
	return function() {
		var select = xpath.useNamespaces({
			pom : "http://maven.apache.org/POM/4.0.0"
		});
		if (!fs.existsSync("target"))
			fs.mkdirSync("target");
		if (fs.existsSync("target/lock.txt")) {
			var pid = parseInt(fs.readFileSync("target/lock.txt", {
				encoding : "utf8"
			}));
			if (require("is-running")(pid)) {
				grunt.log.error("Grunt build already running at " + pid);
				return false;
			}
		}
		fs.writeFileSync("target/lock.txt", process.pid + "\n");
		var pom = new DOMParser().parseFromString(fs.readFileSync("pom.xml", {
			encoding : "utf8"
		}));
		if (pkg.name !== select("/pom:project/pom:artifactId/text()", pom)[0].data) {
			grunt.log.error("ArtifactId in POM does not match 'name' property in package.json");
			return false;
		}
		var version = select("/pom:project/pom:version/text()", pom)[0];
		if (!version) {
			version = select("/pom:project/pom:parent/pom:version/text()", pom)[0];
		}
		if (pkg.version !== version.data) {
			grunt.log.error("Version in POM does not match 'version' property in package.json");
			return false;
		}
		fs.writeFileSync("target/grunt.properties", "grunt.cwd=" + process.cwd().replace(/\\/g, "/") + "\n");
	};
}

function Grunt$taskInitialize() {
	var result, x = properties.getPrivate(this);
	if (x.unzip) {
		result = [ "validate", "curl", "unzip" ];
	} else {
		if (x.unzip === false) {
			result = [ "validate", "curl" ];
		} else {
			result = [ "validate" ];
		}
	}
	if (fs.existsSync("bower.json") && fs.statSync("bower.json").isFile()) {
		// Problem with Bower? Run the following git command:
		// git config --global url."https://".insteadOf git://
		result.push("bower");
	}
	return result;
}

function Grunt$taskInit() {
	var self = this;
	return function(target) {
		var done = this.async();
		switch (target) {
			case "selenium":
				self.system(done, "./node/node", [ "node_modules/protractor/bin/webdriver-manager", "update" ]);
				break;
			default:
				throw new Error("target '" + target + "' not defined");
		}
	};
}

function Grunt$taskDeploy() {
	var grunt = properties.getPrivate(this).grunt;
	var pkg = this.getPackage();
	return function() {
		if (endsWith(pkg.version, "SNAPSHOT")) {
			grunt.log.error("SNAPSHOT version of package must not be deployed");
			return false;
		}
	};
}

function Grunt$taskServer() {
	var self = this;
	return function(target) {
		var done = this.async();
		switch (target) {
			case "node":
				var spec = "src/test/javascript/jasmine.spec.js";
				if (!fs.statSync(spec).isFile()) {
					spec = "node_modules/badgerfish.composix/" + spec;
				}
				self.system(function() {
				}, "./node/node", [ "node_modules/jasmine-node/bin/jasmine-node", spec, "--captureExceptions", "--autotest", "--watch", "src/test/javascript",
						"src/main/javascript" ]);
				done();
				break;
			case "selenium":
				var selenium = spawn("node/node", [ "node_modules/protractor/bin/webdriver-manager", "start" ]);
				if (!fs.statSync("target").isDirectory()) {
					fs.mkdirSync("target");
				}
				var writable = fs.createWriteStream("target/selenium.log");
				selenium.stdout.pipe(writable);
				selenium.stderr.pipe(writable);
				self.system(done, "./node/node", [ "node_modules/protractor/bin/protractor", "src/test/conf.js" ]);
				break;
			default:
				throw new Error("target '" + target + "' not defined");
		}
	};
}

function Grunt$taskStart() {
	return [ "validate", "jison", "server:node", "connect" ];
}

function Grunt$taskStop() {
	var grunt = properties.getPrivate(this).grunt;
	return function() {
		if (fs.existsSync("target/lock.txt")) {
			process.kill(parseInt(fs.readFileSync("target/lock.txt", {
				encoding : "utf8"
			})));
			fs.unlinkSync("target/lock.txt");
		} else {
			grunt.log.error("nothing to stop");
			return false;
		}
	};
}

function Grunt$taskRestart() {
	return [ "stop", "start" ];
}

function Grunt$taskWebdav() {
	var self = this;
	return function(target) {
		var done = this.async();
		var webdav = properties.getPrivate(self).config.webdav;
		for ( var prop in webdav) {
			if (webdav.hasOwnProperty(prop) && (!target || prop === target)) {
				var options = webdav[prop].options;
				glob(options.src, function(err, files) {
					if (err) {
						throw err;
					}
					for ( var i = 0; i < files.length; ++i) {
						var url = "http://" + (options.domain ? options.domain + "%5C" : "") + options.username
								+ (options.password ? ":" + options.password : "") + "@" + options.hostname + ":" + options.port
								+ (options.dest.charAt(options.dest.length - 1) === '/' ? options.dest + path.basename(files[i]) : options.dest);
						self.curl(done, "-T", files[i], url);
					}
				});
			}
		}
	};
}

function Grunt$taskJison() {
	var self = this;
	function Grunt$taskJison$execute(target) {
		if (target) {
			var parser = new Generator(fs.readFileSync("src/main/resources/" + target + ".jison", {
				encoding : "utf8"
			}), {
				moduleType : 'amd'
			});
			fs.writeFileSync("dist/" + target + ".js", parser.generate());
		} else {
			var files = fs.readdirSync("src/main/resources");
			files.forEach(function(file) {
				var size = file.length - 6;
				if (file.indexOf(".jison", size) !== -1) {
					Grunt$taskJison$execute(file.substr(0, size));
				}
			});
		}
	}
	return Grunt$taskJison$execute;
}

Grunt.prototype.system = Grunt$system;
Grunt.prototype.curl = Grunt$curl;
Grunt.prototype.download = Grunt$download;
Grunt.prototype.getPackage = Grunt$getPackage;
Grunt.prototype.middleware = Grunt$middleware;
Grunt.prototype.getConfig = Grunt$getConfig;
Grunt.prototype.Grunt = Grunt$Grunt;
Grunt.prototype.taskValidate = Grunt$taskValidate;
Grunt.prototype.taskInitialize = Grunt$taskInitialize;
Grunt.prototype.taskInit = Grunt$taskInit;
Grunt.prototype.taskDeploy = Grunt$taskDeploy;
Grunt.prototype.taskServer = Grunt$taskServer;
Grunt.prototype.taskStart = Grunt$taskStart;
Grunt.prototype.taskStop = Grunt$taskStop;
Grunt.prototype.taskRestart = Grunt$taskRestart;
Grunt.prototype.taskWebdav = Grunt$taskWebdav;
Grunt.prototype.taskJison = Grunt$taskJison;

module.exports = Grunt;
