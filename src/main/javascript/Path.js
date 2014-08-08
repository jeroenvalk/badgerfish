define([ "javascript/Private" ], function(Private) {
	var properties = new Private(Path);

	function Path(path) {
		var part = path.split("/");
		var result = [];
		for ( var i = 0; i < part.length; ++i) {
			switch (part[i]) {
				case "":
					result.push(Path.DESCENDANT);
					result.push("*");
					break;
				case ".":
					result.push(Path.SELF);
					result.push("*");
					break;
				case "..":
					result.push(Path.PARENT);
					result.push("*");
					break;
				default:
					var axis = Path.CHILD;
					var aux;
					if (part[i].charAt(0) === '@') {
						axis = Path.ATTRIBUTE;
						aux = [ part[i].substr(1) ];
					} else {
						aux = part[i].split("::");
					}
					switch (aux.length) {
						case 0:
							DEBUG && expect(true).toBe(false);
							break;
						case 1:
							aux = aux[0];
							break;
						case 2:
							switch (aux[0]) {
								case "ancestor":
									axis = Path.ANCESTOR;
									break;
								case "ancestor-or-self":
									axis = Path.ANCESTOR_OR_SELF;
									break;
								case "attribute":
									axis = Path.ATTRIBUTE;
									break;
								case "child":
									axis = Path.CHILD;
									break;
								case "descendant":
									axis = Path.DESCENDANT;
									break;
								case "descendant-or-self":
									axis = Path.DESCENDANT_OR_SELF;
									break;
								case "following":
									axis = Path.FOLLOWING;
									break;
								case "following-sibling":
									axis = Path.FOLLOWING_SIBLING;
									break;
								case "namespace":
									axis = Path.NAMESPACE;
									break;
								case "parent":
									axis = Path.PARENT;
									break;
								case "preceding":
									axis = Path.PRECEDING;
									break;
								case "preceding-sibling":
									axis = Path.PRECEDING_SIBLING;
									break;
								case "self":
									axis = Path.SELF;
									break;
								default:
									DEBUG && expect(true).toBe(false);
							}
							aux = aux[1];

					}
					var aux2 = parseInt(aux);
					if (!isNaN(aux2)) {
						result.push(aux2);
					} else {
						result.push(axis);
						result.push(aux);
					}
					break;
			}
		}

		var x = properties.getPrivate(this);
		x.path = result;
	}

	Path.prototype.selectSingleNode = function Path$selectSingleNode(entity) {

	};

	Path.prototype.selectNodes = function Path$selectNodes(entity) {

	};

	// axes
	Path.ANCESTOR = -10;
	Path.ANCESTOR_OR_SELF = -11;
	Path.ATTRIBUTE = -12;
	Path.CHILD = -13;
	Path.DESCENDANT = -14;
	Path.DESCENDANT_OR_SELF = -15;
	Path.FOLLOWING = -16;
	Path.FOLLOWING_SIBLING = -17;
	Path.NAMESPACE = -18;
	Path.PARENT = -19;
	Path.PRECEDING = -20;
	Path.PRECEDING_SIBLING = -21;
	PATH.SELF = -22;

	// formats
	PATH.XPATH = -100;

	return Path;
});
