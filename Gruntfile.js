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

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	// Define the configuration for all the tasks
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),

		connect : {
			options : {
				port : 4242,
				livereload : 35729,
				// Change this to '0.0.0.0' to access the server from outside
				hostname : 'localhost'
			},
			livereload : {
				options : {
					open : true,
					base : [ '.tmp', '<%= xopusStandalone.dist %>',
							'<%= xopusStandalone.static %>' ]
				}
			},
			dist : {
				options : {
					open : true,
					base : '<%= xopusStandalone.dist %>',
					livereload : false
				}
			}
		}
	});
};
