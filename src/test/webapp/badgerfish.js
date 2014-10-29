require([ 'javascript/Context' ], function(Context) {
	var html = Context.getHTMLDocument().toNode();

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
			var context = pipeline[0];
			Context.requireAll(pipeline, function() {
				for ( var j = 1; j < pipeline.length; ++j) {
					context = context.transform(pipeline[j]);
				}
				node.parentNode.replaceChild(context.toNode(), node);
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