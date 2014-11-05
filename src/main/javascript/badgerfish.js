requirejs.config({
	baseUrl : "/",
	paths : {
		jquery : "lib/jquery",
		grammar_path : "../grammar_path"
	}
});

require([ 'jquery', 'javascript/Context' ], function(jQuery, Context) {
	var html = Context.getHTMLDocument().toNode();

	function transform(context, pipeline, callback) {
		if (pipeline.length === 0) {
			throw new Error("cannot transform an empty pipeline");
		}
		if (pipeline.length === 1) {
			context.transform(pipeline.shift(), function(result) {
				console.assert(pipeline.length === 0);
				callback(result);
			}, Context.getHTMLDocument());
		} else {
			context.transform(pipeline.shift(), function(result) {
				transform(result, pipeline, callback);
			});
		}
	}

	function executeCPX(prefixes, cpx, xi) {
		var nodes = html.getElementsByTagName(prefix + ":transform");

		for ( var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];
			var pipeline = [];
			for ( var j = 0; j < node.children.length; ++j) {
				var child = node.children[j];
				if (child.localName === xi + ":include") {
					pipeline.push(Context.normalize(child.getAttribute("href")));
				}
			}
			Context.requireAll(pipeline, function() {
				var context = pipeline.shift();
				transform(context, pipeline, function(result) {
					node.parentNode.replaceChild(result.toNode(), node);
					var elements = jQuery("*[require]", result.toNode());
					var resources = [];
					for ( var i = 0; i < elements.length; ++i) {
						resources.push(elements[i].getAttribute("require"));
					}
					require(resources, function() {
						for ( var i = 0; i < arguments.length; ++i) {
							arguments[i].create(elements[i]);
						}
					});
				});
			});
		}

	}

	var prefixes = {};

	var attr = html.attributes;
	for ( var i = 0; i < attr.length; ++i) {
		if (attr[i].name.substr(0, 6) === "xmlns:") {
			prefixes[attr[i].name.substr(6)] = attr[i].value;
			switch (attr[i].value) {
			case "http://www.w3.org/2001/XInclude":
				xi = attr[i].name.substr(6);
				break;
			}
		}
	}

	for ( var prefix in prefixes) {
		switch (prefixes[prefix]) {
		case "http://www.agentsatwork.nl/2014/cpx":
			executeCPX(prefixes, prefix, xi);
			break;
		}
	}

});