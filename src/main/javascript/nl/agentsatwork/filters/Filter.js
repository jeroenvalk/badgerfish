/* global define */
define(["stream"], function(stream) {
	return function class_Filter(properties) {
		properties.extends([stream.Transform]);
	};
});
