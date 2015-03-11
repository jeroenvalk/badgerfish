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

/* jshint -W030 */

/* global define */
define(
		[ "fs", "url", "path", "child_process", "glob", "xpath", "xmldom", "jison", "http-rewrite-middleware" ],
		function(fs, url, path, child_process, glob, xpath, xmldom, jison, rewriteModule) {
			function class_Grunt(properties) {

				var spawn = child_process.spawn;
				var DOMParser = xmldom.DOMParser;
				var Generator = jison.Generator;

				function endsWith(str, suffix) {
					return str.indexOf(suffix, str.length - suffix.length) !== -1;
				}

				var digraph = {
					getPostOrderTreeWalk : function(node) {
						var lifecycle = [ "validate", "initialize", "generate-sources", "process-sources", "generate-resources", "process-resources",
								"compile", "process-classes", "generate-test-sources", "process-test-sources", "generate-test-resources",
								"process-test-resources", "test-compile", "process-test-classes", "test", "prepare-package", "package", "pre-integration-test",
								"integration-test", "post-integration-test", "verify", "install", "deploy" ];
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

				var _phase = function Grunt$phase(grunt, names, tasks) {
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
				};

				this.constructor = function Grunt(grunt) {
					properties.setPrivate(this, {
						grunt : grunt
					});
				};

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
					return [ "cachedFiles", "syntaxHighlighter", "proxy" ];
				}

				function Grunt$middlewareCachedFiles() {
					var x = properties.getPrivate(this);
					var files = {
						'/text.js' : [ 'node_modules/text/text.js' ],
						'/lib/knockout-latest.js' : [ 'node_modules/knockout/build/output/knockout-latest.js' ],
						'/lib/knockout-latest.debug.js' : [ 'node_modules/knockout/build/output/knockout-latest.debug.js' ]
					};
					var content = {};
					files && Object.keys(files).forEach(function(file) {
						content[file] = files[file].map(function(filename) {
							return fs.readFileSync([ x.config.properties.cpxdir, filename ].join("/"));
						}).join();
					});
					function Grunt$middlewareCachedFiles$serve(req, res, next) {
						if (req.url in files) {
							switch (req.url.substr(req.url.lastIndexOf("."))) {
							case ".js":
								res.writeHead(200, {
									'Content-Type' : 'application/javascript'
								});
								break;
							default:
								throw new Error("unsupported file type");
							}
							res.write(content[req.url]);
							res.end();
						} else {
							next();
						}
					}
					return Grunt$middlewareCachedFiles$serve;
				}

				function Grunt$middlewareSyntaxHighlighter() {
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
							res
									.write('<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/templates/syntaxhighlighter.xsl"?>\n<root brush="'
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

				function Grunt$middlewareProxy() {
					function Grunt$middlewareProxy$serve(req, res, next) {
						// console.log(req.url);
						next();
					}
					return Grunt$middlewareProxy$serve;
				}

				function Grunt$readConfig() {
					var grunt = properties.getPrivate(this).grunt;
					return grunt.file.readJSON(path.resolve('Gruntfile.json'));
				}

				function Grunt$setConfig(config) {
					var x = properties.getPrivate(this);
					x.config = config;
					x.executions = config.executions;
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

				function Grunt$grunt(grunt) {
					var self = this;
					var x = properties.getPrivate(this);
					x.grunt = grunt;
					grunt.loadNpmTasks('grunt-curl');
					grunt.loadNpmTasks('grunt-zip');
					grunt.loadNpmTasks('grunt-contrib-clean');
					grunt.loadNpmTasks('grunt-contrib-connect');
					grunt.loadNpmTasks('grunt-contrib-jshint');
					grunt.loadNpmTasks('grunt-contrib-uglify');
					grunt.loadNpmTasks('grunt-contrib-compress');
					// grunt.loadNpmTasks('grunt-bower-task');
					require('time-grunt')(grunt);

					var config = this.getConfig();
					x.config = config;
					config.pkg = this.getPackage();

					for ( var prop in this) {
						if (prop.substr(0, 4) === "task" && this[prop] instanceof Function) {
							grunt.registerTask(prop, this[prop]());
						}
					}

					var lifecycle = config.lifecycle;
					lifecycle && Object.keys(lifecycle).forEach(function(phase) {
						var tasks = x.executions[phase];
						if (tasks) {
							tasks = tasks.map(function(name) {
								return name.split(":");
							});
						} else {
							tasks = [];
						}

						grunt.registerTask(phase, _phase(grunt, digraph.getPostOrderTreeWalk(phase), tasks.map(function(task) {
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
					});

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

				function Grunt$taskJasmine() {
					var env, self = this;
					var cpxdir = properties.getPrivate(this).config.properties.cpxdir;
					var spec = path.join(cpxdir, "src/main/scripts/jasmine.spec.js");
					return function(target) {
						var done = this.async();
						switch (target) {
						case "node":
							console.log(spec);
							env = process.env;
							env.NODE_PATH = [ "src/test", "src/main" ].join(path.delimiter);
							self.system(done, "./node/node", [ "node_modules/jasmine-node/bin/jasmine-node", spec ], {
								env : env
							});
							break;
						default:
							throw new Error("target '" + target + "' not defined");
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
							var spec = "src/main/scripts/jasmine.js";
							// if (!fs.statSync(spec).isFile()) {
							// spec = "node_modules/badgerfish.composix/" +
							// spec;
							// }
							self.system(function() {
								done();
							}, "./node/node", [ "node_modules/jasmine-node/bin/jasmine-node", spec, "--captureExceptions", "--autotest", "--watch",
									"src/test/javascript", "src/main/javascript" ]);
							// done();
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
						webdav
								&& Object.keys(webdav).forEach(
										function(prop) {
											if (!target || prop === target) {
												var options = webdav[prop].options;
												glob(options.src, function(err, files) {
													if (err) {
														throw err;
													}
													for (var i = 0; i < files.length; ++i) {
														var url = "http://"
																+ (options.domain ? options.domain + "%5C" : "")
																+ options.username
																+ (options.password ? ":" + options.password : "")
																+ "@"
																+ options.hostname
																+ ":"
																+ options.port
																+ (options.dest.charAt(options.dest.length - 1) === '/' ? options.dest
																		+ path.basename(files[i]) : options.dest);
														self.curl(done, "-T", files[i], url);
													}
												});
											}
										});
					};
				}

				function Grunt$taskJison() {
					var execute = function Grunt$taskJison$execute(target) {
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
										execute(file.substr(0, size));
									}
								});
							}
						}
					};
					return execute;
				}

				this.exists = Grunt$exists;
				this.system = Grunt$system;
				this.getPackage = Grunt$getPackage;
				this.connectSearchPathMiddleware = Grunt$connectSearchPathMiddleware;
				this.connectRewriteMiddleware = Grunt$connectRewriteMiddleware;
				this.middleware = Grunt$middleware;
				this.middlewareCachedFiles = Grunt$middlewareCachedFiles;
				this.middlewareSyntaxHighlighter = Grunt$middlewareSyntaxHighlighter;
				this.middlewareProxy = Grunt$middlewareProxy;
				this.readConfig = Grunt$readConfig;
				this.setConfig = Grunt$setConfig;
				this.getConfig = Grunt$getConfig;
				this.grunt = Grunt$grunt;
				this.taskValidate = Grunt$taskValidate;
				this.taskInit = Grunt$taskInit;
				this.taskDeploy = Grunt$taskDeploy;
				this.taskJasmine = Grunt$taskJasmine;
				this.taskServer = Grunt$taskServer;
				this.taskStop = Grunt$taskStop;
				this.taskWebdav = Grunt$taskWebdav;
				this.taskJison = Grunt$taskJison;
			}

			// module.exports = Grunt;
			return class_Grunt;
		});
