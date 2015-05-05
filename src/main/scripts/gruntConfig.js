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

/* global define, is */

require('./shims.js');
var path = require("path");
require('../javascript/nl/agentsatwork/globals/Badgerfish');
require('../javascript/nl/agentsatwork/main/Grunt');
GLOBAL.Badgerfish = define.classOf("nl.agentsatwork.globals.Badgerfish");
var extend = require('node.extend');
var config = {};

var chain = [ "nl.agentsatwork.main.Grunt" ];
function gruntConfig(gruntOrConfig) {
	if (typeof gruntOrConfig.initConfig === "function") {
		if (config.Grunt) {
			chain.push(config.Grunt);
		}
		var Grunt = define.classOf(chain.join(":"));
		if (is.fn(Grunt)) {
			var grunt = new Grunt(gruntOrConfig);
			extend(true, config, gruntOrConfig.file.readJSON(path.resolve('Gruntfile.json')));
			grunt.configure(config);
		} else {
			throw new Error(chain.pop()+": missing constructor function");
		}
	} else {
		extend(true, config, gruntOrConfig);
		return gruntConfig;
	}
}

module.exports = gruntConfig;
