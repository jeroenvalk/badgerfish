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

var config = {};
var definition = require('../javascript/nl/agentsatwork/globals/Definition');
require('../javascript/nl/agentsatwork/main/Grunt');
var extend = require('node.extend');

var chain = ["nl.agentsatwork.main.Grunt"];
function gruntConfig(gruntOrConfig) {
	if (typeof gruntOrConfig.initConfig === "function") {
		if (config.Grunt) {
			chain.push(config.Grunt);
		}
		var Grunt = definition.classOf(chain.join(":"));
		var grunt = new Grunt(gruntOrConfig);
		extend(true, config, grunt.readConfig());
		grunt.setConfig(config);
		grunt.grunt(gruntOrConfig);
	} else {
		extend(true, config, gruntOrConfig);
		return gruntConfig;
	}
}

module.exports = gruntConfig;
