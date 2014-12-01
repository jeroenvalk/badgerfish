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

var gruntConfig = require("./src/main/scripts/gruntConfig");

module.exports = gruntConfig({
	clean : [ "dist" ],

	connect : {
		test : {
			options : {
				keepalive : true,
				hostname : "*",
				port : 8080,
				base : [ "src/test/webapp", "src/main/webapp", "src/test", "src/main", "dist", "node_modules/badgerfish.composix/src/main" ]
			}
		}
	},

	uglify : {
		options : {
			maxLineLen : 160,
			banner : "/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> */\n"
		},
		definition : {
			files : {
				"dist/script/definition.min.js" : [ "src/main/javascript/nl/agentsatwork/globals/Definition.js" ]
			}
		}
	}
});
