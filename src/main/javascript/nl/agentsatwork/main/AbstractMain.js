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

/* global define, requirejs */
define(["../core/Singleton"], function(classSingleton) {
	function class_abstract_AbstractMain(properties) {
		properties.extends([classSingleton]);
		
		this.AbstractMain = function AbstractMain() {
			var self = this;
			Promise.resolve({}).then(function(config) {
				return self.validate(config);
			}).then(function(config) {
				return self.configure(config);
			}).then(function(config) {
				return self.initialize(config);
			}).then(function(config) {
				return self.bootstrap(config);
			}).catch(function(e) {
				throw e;
			});
		};

		this.validate = function AbstractMain$validate(config) {
			config.isServer = !GLOBAL.document;
		};
		
		this.configure = function AbstractMain$configure() {
			requirejs.config({
				baseUrl : "/",
				paths : {
					jquery : "lib/jquery",
					grammar_path : "../grammar_path"
				}
			});			
		};
		
		this.initialize = 
		/**
		 * @param {Object}
		 *            config
		 */
		function AbstractMain$initialize() {
			
		};
		
		this.bootstrap = 
		/**
		 * @param {Object}
		 *            config
		 */
		function AbstractMain$bootstrap() {
			
		};
	}
	return class_abstract_AbstractMain;
});