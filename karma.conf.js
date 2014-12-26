// Karma configuration
// Generated on Fri Nov 21 2014 17:44:22 GMT+0100 (W. Europe Standard Time)

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files,
		// exclude)
		basePath : '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks : [ 'jasmine', 'requirejs' ],

		// list of files / patterns to load in the browser
		files : [ {
			pattern : 'src/test/javascript/nl/agentsatwork/**/*.js',
			included: false
		}, {
			pattern : 'src/main/javascript/nl/agentsatwork/**/*.js',
			included: false
		}, 'src/main/scripts/karma.js' ],

		// proxy to the grunt connect server
		proxies : {
			'/javascript/' : 'http://localhost:8080/javascript/',
			'/resources/' : 'http://localhost:8080/resources/'
		},

		// list of files to exclude
		exclude : [],

		// preprocess matching files before serving them to the browser
		// available preprocessors:
		// https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors : {},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters : [ 'progress' ],

		// web server port
		port : 9876,

		// enable / disable colors in the output (reporters and logs)
		colors : true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR ||
		// config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel : config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file
		// changes
		autoWatch : true,

		// start these browsers
		// available browser launchers:
		// https://npmjs.org/browse/keyword/karma-launcher
		browsers : [ 'Chrome' ],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun : false
	});
};
