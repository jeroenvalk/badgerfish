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

'use strict';

var cpxpkg = JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname, 'package.json')));
var gruntConfig = require("./src/main/scripts/gruntConfig");

module.exports = gruntConfig({
	properties : {
		cpx : cpxpkg.name,
		cpxdir : "node_modules/" + cpxpkg.name,
		cpxver : cpxpkg.version
	},

	lifecycle : {
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
	},

	executions : {
		"clean" : [ "clean" ],
		"validate" : [ "validate" ],
		"initialize" : [ "initialize" ],
		"generate-sources" : [ "jison" ],
		"compile" : [ "uglify" ],
		"package" : [ "compress" ],
		"pre-integration-test" : [ "unzip" ],
		"start" : [ "server:karma", "connect" ],
		"stop" : [ "stop" ]
	},

	clean : [ "dist" ],

	connect : {
		test : {
			options : {
				keepalive : true,
				hostname : "*",
				port : 8080,
				base : Object.keys({
					"src/test/webapp" : 0,
					"src/main/webapp" : 0,
					"src/test" : 0,
					"src/main" : 0,
					"dist" : 0,
					"src" : 0,
					"<%= properties.cpxdir %>/src/main" : 0
				})
			}
		}
	},

	uglify : {
		definition : {
			options : {
				maxLineLen : 160,
				banner : Object.keys({
					"/*_____________________________________________<%= grunt.template.today('yyyy-mm-dd') %>\n" : 0,
					"* Copyright © 2010-2014 dr. ir. Jeroen Valk\n" : 0,
					"*\n" : 0,
					"* <%= properties.cpx %> - v<%= properties.cpxver %> - definition.min.js:\n" : 0,
					"* - http://github.com/jeroenvalk/badgerfish/\n" : 0,
					"* - http://www.npmjs.org/package/badgerfish.composix/\n" : 0,
					"* - http://code.google.com/p/composix/\n" : 0,
					"* - http://www.agentsatwork.nl/\n" : 0,
					"* ---------------------GNU Lesser General Public License\n" : 0,
					"*                    LGPLv3: http://www.gnu.org/licenses\n" : 0,
					"*/\n" : 0
				}).join("")
			},
			files : [ {
				src : [ "<%= properties.cpxdir %>/src/main/javascript/nl/agentsatwork/globals/Definition.js" ],
				dest : "dist/script/definition.min.js",
				nonull : true
			} ]
		}
	},

	compress : {
		main : {
			archive : "dist/<%= pkg.name %>-<%= pkg.version %>.zip"
		}
	},

	unzip : {
		main : {
			src : "dist/<%= pkg.name %>-<%= pkg.version %>.zip",
			dest : "target/package"
		}
	}
});
