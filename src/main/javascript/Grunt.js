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

var fs = require('fs');
var url = require('url');
var path = require('path');
var spawn = require('child_process').spawn;

var requirejs = require('requirejs');
var glob = require("glob");
var xpath = require('xpath');
var DOMParser = require('xmldom').DOMParser;
var Generator = require('jison').Generator;
var extend = require('node.extend');
var rewriteModule = require('http-rewrite-middleware');

requirejs.config({
	baseUrl : __dirname
});

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var lifecycle = {
	"pre-clean" : {},
	"clean" : {
		depends : "pre-clean"
	},
	"validate" : {},
	"initialize" : {
		depends : "validate"
	},
	"generate-sources" : {
		depends : "initialize"
	},
	"process-sources" : {
		depends : "generate-sources"
	},
	"generate-resources" : {
		depends : "process-sources"
	},
	"process-resources" : {
		depends : "generate-resources"
	},
	"compile" : {
		depends : "process-resources"
	},
	"process-classes" : {
		depends : "compile"
	},
	"generate-test-sources" : {
		depends : "process-classes"
	},
	"process-test-sources" : {
		depends : "generate-test-sources"
	},
	"generate-test-resources" : {
		depends : "process-test-sources"
	},
	"process-test-resources" : {
		depends : "generate-test-resources"
	},
	"test-compile" : {
		depends : "process-test-resources"
	},
	"process-test-classes" : {
		depends : "test-compile"
	},
	"test" : {
		depends : "process-test-classes"
	},
	"prepare-package" : {
		depends : "test"
	},
	"package" : {
		depends : "prepare-package"
	},
	"pre-integration-test" : {
		depends : "package"
	},
	"integration-test" : {
		depends : "pre-integration-test"
	},
	"post-integration-test" : {
		depends : "integration-test"
	},
	"verify" : {
		depends : "post-integration-test"
	},
	"install" : {
		depends : "verify"
	},
	"deploy" : {
		depends : "install"
	},
	"start" : {
		depends : "process-test-classes"
	},
	"stop" : {},
	"restart" : {
		depends : "stop",
		invoke : "start"
	}
};

var digraph = {
	getPostOrderTreeWalk : function(node) {
		var lifecycle = [ "validate", "initialize", "generate-sources", "process-sources", "generate-resources", "process-resources", "compile",
				"process-classes", "generate-test-sources", "process-test-sources", "generate-test-resources", "process-test-resources", "test-compile",
				"process-test-classes", "test", "prepare-package", "package", "pre-integration-test", "integration-test", "post-integration-test", "install",
				"deploy" ];
		switch (node) {
		case "pre-clean":
			return [ "pre-clean" ];
		case "clean":
			return [ "pre-clean", "clean" ];
		case "start":
			return lifecycle.slice(0, lifecycle.indexOf("test")).concat([ "start" ]);
		case "stop":
			return [ "stop" ];
		case "restart":
			return [ "stop" ].concat(lifecycle.slice(0, lifecycle.indexOf("test")), [ "start" ]);
		default:
			return lifecycle.slice(0, lifecycle.indexOf(node) + 1);
		}
	}
};

function Grunt$phase(grunt, names, tasks) {
	function Grunt$phase$closure(target) {
		if (target) {
			console.assert(names.slice(-1).pop() === target);
			grunt.task.run(tasks);
		} else {
			console.assert(names instanceof Array);
			grunt.task.run(names.map(function(name) {
				return [ name, name ].join(":");
			}));
		}
	}
	return Grunt$phase$closure;
}

var Private = requirejs("./Private");
var properties = new Private(Grunt);
function Grunt(grunt) {
	properties.setPrivate(this, {
		grunt : grunt,
		downloads : {
			"lib/require.js" : "http://requirejs.org/docs/release/2.1.11/comments/require.js",
			"lib/jquery.js" : "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.0/jquery.js",
			"lib/angular.js" : "http://code.angularjs.org/1.2.13/angular.js",
			"lib/foundation.js" : "https://cdnjs.cloudflare.com/ajax/libs/foundation/5.2.3/js/foundation/foundation.js",
			"lib/foundation.css" : "https://cdnjs.cloudflare.com/ajax/libs/foundation/5.2.3/css/foundation.css"
		},
		executions : {
			"clean" : [ "clean" ],
			"validate" : [ "validate" ],
			"initialize" : [ "initialize" ],
			"generate-sources" : [ "jison" ],
			"compile" : [ "uglify" ],
			"package" : [ "compress" ],
			"start" : [ "server:karma", "connect" ],
			"stop" : [ "stop" ]
		},
		unzip : true
	});
}

function Grunt$exists(name, local) {
	var grunt = properties.getPrivate(this).grunt;
	var localName = "task" + name.substr(0, 1).toUpperCase() + name.substr(1);
	if (this[localName]) {
		console.assert(grunt.task.exists(localName));
		return true;
	} else {
		return !local && grunt.task.exists(name);
	}
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

function Grunt$connectSearchPathMiddleware(path) {
	return path;
}

function Grunt$connectRewriteMiddleware() {
	return [];
}

function Grunt$middleware() {
	return [ "syntaxHighlighter", "proxy" ];
}

function Grunt$middlewareSyntaxHighlighter(connect, options) {
	function Grunt$middlewareSyntaxHighlighter$serve(req, res, next) {
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
				for (var i = 0; i < chunk.length; ++i) {
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
	}
	return Grunt$middlewareSyntaxHighlighter$serve;
}

function Grunt$middlewareProxy(connect, options) {
	function Grunt$middlewareProxy$serve(req, res, next) {
		console.log(req.url);
		next();
	}
	return Grunt$middlewareProxy$serve;
}

function Grunt$readConfig() {
	var grunt = properties.getPrivate(this).grunt;
	return grunt.file.readJSON(path.resolve('Gruntfile.json'));
}

function Grunt$setConfig(config) {
	properties.getPrivate(this).config = config;
}

function Grunt$getConfig() {
	var config = properties.getPrivate(this).config;
	if (!config)
		config = this.readConfig();
	var self = this;
	var name = self.middleware();
	var middleware = [];
	for (var k = 0; k < name.length; ++k) {
		middleware.push("middleware" + name[k].substr(0, 1).toUpperCase() + name[k].substr(1));
	}
	config.connect.test.options.base = self.connectSearchPathMiddleware(config.connect.test.options.base);
	config.connect.test.options.middleware = function(connect, options) {
		var i, result = [ rewriteModule.getMiddleware(self.connectRewriteMiddleware()) ];
		for (i = 0; i < middleware.length; ++i) {
			result.push(self[middleware[i]](connect, options));
		}
		for (i = 0; i < options.base.length; ++i) {
			result.push(connect.static(options.base[i]));
		}
		// TODO: HACK to get the text module working
		result.push(connect.static("node_modules/text"));
		return result;
	};
	return config;
}

function Grunt$Grunt(grunt) {
	var self = this;
	var x = properties.getPrivate(this);
	x.grunt = grunt;
	grunt.loadNpmTasks('grunt-curl');
	grunt.loadNpmTasks('grunt-zip');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compress');
	// grunt.loadNpmTasks('grunt-bower-task');
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
			grunt.registerTask(prop, this[prop]());
		}
	}

	for ( var phase in lifecycle) {
		var tasks = x.executions[phase];
		if (tasks) {
			tasks = tasks.map(function(name) {
				return name.split(":");
			});
		} else {
			tasks = [];
		}

		grunt.registerTask(phase, Grunt$phase(grunt, digraph.getPostOrderTreeWalk(phase), tasks.map(function(task) {
			if (lifecycle[task[0]]) {
				var localTask = "task" + task[0].substr(0, 1).toUpperCase() + task[0].substr(1);
				if (!self.exists(task[0], true)) {
					if (self.exists(task[0])) {
						console.assert(!grunt.task.exists(localTask));
						console.assert(!config[localTask]);
						grunt.log.ok("task '" + task[0] + "' has been redefined as '" + localTask + "' (local task)");
						config[localTask] = config[task[0]];
						delete config[task[0]];
						grunt.task.renameTask(task[0], localTask);
					} else {
						grunt.log.error("task '" + task[0] + "' not defined");
					}
				}
				return [ localTask ].concat(task.splice(1)).join(":");
			} else {
				if (self.exists(task[0], true)) {
					return [ "task" + task[0].substr(0, 1).toUpperCase() + task[0].substr(1) ].concat(task.splice(1)).join(":");
				} else {
					if (self.exists(task[0])) {
						return task.join(":");
					}
					grunt.log.error("task '" + task[0] + "' not defined");
				}
			}
		})));
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
		result = [ "curl", "unzip" ];
	} else {
		if (x.unzip === false) {
			result = [ "curl" ];
		} else {
			result = [];
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
	var grunt = properties.getPrivate(this).grunt;
	var self = this;
	return function(target) {
		var done = this.async();
		switch (target) {
		case "node":
			var spec = "src/main/jasmine-node/jasmine.spec.js";
			if (!fs.statSync(spec).isFile()) {
				spec = "node_modules/badgerfish.composix/" + spec;
			}
			self.system(function() {
			}, "./node/node", [ "node_modules/jasmine-node/bin/jasmine-node", spec, "--captureExceptions", "--autotest", "--watch", "src/test/javascript",
					"src/main/javascript" ]);
			done();
			break;
		case "karma":
			grunt.log.write("Starting Karma server...");
			var options = {};
			if (fs.existsSync('./karma.conf.js')) {
				options.configFile = path.resolve('./karma.conf.js');
			} else if (fs.existsSync('./karma.conf.coffee')) {
				options.configFile = path.resolve('./karma.conf.coffee');
			}
			require("karma").server.start(options, function(exitCode) {
				grunt.log.write("Karma has exited with " + exitCode);
				process.exit(exitCode);
			});
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
					for (var i = 0; i < files.length; ++i) {
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
			if (fs.existsSync("src/main/resources")) {
				var files = fs.readdirSync("src/main/resources");
				files.forEach(function(file) {
					var size = file.length - 6;
					if (file.indexOf(".jison", size) !== -1) {
						Grunt$taskJison$execute(file.substr(0, size));
					}
				});
			}
		}
	}
	return Grunt$taskJison$execute;
}

process.on("exit", function() {
	console.log("EXIT");
});

Grunt.prototype.exists = Grunt$exists;
Grunt.prototype.system = Grunt$system;
Grunt.prototype.curl = Grunt$curl;
Grunt.prototype.download = Grunt$download;
Grunt.prototype.getPackage = Grunt$getPackage;
Grunt.prototype.connectSearchPathMiddleware = Grunt$connectSearchPathMiddleware;
Grunt.prototype.connectRewriteMiddleware = Grunt$connectRewriteMiddleware;
Grunt.prototype.middleware = Grunt$middleware;
Grunt.prototype.middlewareSyntaxHighlighter = Grunt$middlewareSyntaxHighlighter;
Grunt.prototype.middlewareProxy = Grunt$middlewareProxy;
Grunt.prototype.readConfig = Grunt$readConfig;
Grunt.prototype.setConfig = Grunt$setConfig;
Grunt.prototype.getConfig = Grunt$getConfig;
Grunt.prototype.Grunt = Grunt$Grunt;
Grunt.prototype.taskValidate = Grunt$taskValidate;
Grunt.prototype.taskInitialize = Grunt$taskInitialize;
Grunt.prototype.taskInit = Grunt$taskInit;
Grunt.prototype.taskDeploy = Grunt$taskDeploy;
Grunt.prototype.taskServer = Grunt$taskServer;
Grunt.prototype.taskStop = Grunt$taskStop;
Grunt.prototype.taskWebdav = Grunt$taskWebdav;
Grunt.prototype.taskJison = Grunt$taskJison;

module.exports = Grunt;
