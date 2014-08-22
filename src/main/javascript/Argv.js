define([ "Private" ], function(Private) {
	var properties = new Private(Argv);

	function Argv(args) {
		properties.setPrivate(this, {
			argv : Array.prototype.slice.call(args)
		});
	}

	var argv = new Argv(args);

	/**
	 * Gets the singleton instance with the specified arguments
	 * @param args - array-like arguments object
	 * @returns {Argv}
	 * @static
	 */
	Argv.getInstance = function Argv$getInstance(args) {
		var x = properties.getPrivate(argv);
		x.argv = Array.prototype.slice.call(args);
		return argv;
	};
	
	Argv.prototype.getArgumentByType = function Argv$getArgumentByType(argv) {
		var x = properties.getPrivate(this);
	};
	
	return Argv;
});