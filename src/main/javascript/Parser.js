	var noJSONPath = function Path$noJSONPath(path) {
		if (path.indexOf("$.") === 0) {
			throw new Error("function does not support JSON Path format");
		}
	};


var parsePredicateXPATH = 
	/**
	 * @param {Array}
	 *            tokens
	 * @return {Array}
	 */
	function Path$parsePredicateXPATH(tokens) {
	}
	
	var parsePartGLOB =
	/**
	 * @param {Array}
	 *            tokens
	 * @return {Array}
	 */
	function Path$parsePartGLOB(tokens) {
		var axis, nodetest, cnf = [];
		token = tokens.shift();
		while (token === '/' || token === '\\') {
			token = tokens.shift();
		}
		switch (token) {
		case ".":
			switch(tokens[0]) {
			case "/":
			case "\\":
			case "#":
				axis = Path.Axis.SELF;
				nodetest = "folder";
				break;
			case ".":
				tokens.shift();
				switch(tokens[0]) {
				case '/':
				case '\\':
				case '#':
					axis = Path.Axis.PARENT;
					nodetest = "folder";
					break;
				default:
					aux = [];
					while (!/^\/$|^\\$|^#$/.test(tokens[0])) {
						aux.push(tokens.shift());
					}
					parsePredicateXPATH(["[","@basename","==","''"," ","and"," ","@extension","==","'.."+aux.join("")+"'","]"]);
					break;
				}
				break;
			case "*":
				tokens.shift();
				predicate = parsePredicateXPATH(["[","@basename","==","''"," ","and"," ","@extension","=~","/^\./","]"]);				
				break;
			default:
				aux = [];
				while (!/^\/$|^\\$|^#$/.test(tokens[0])) {
					aux.push(tokens.shift());
				}
				parsePredicateXPATH(["[","@basename","==","''"," ","and"," ","@extension","==","'."+aux.join("")+"'","]"]);
				break;
			}
			break;
		case "*":
			tokens.shift();
			switch(tokens[0]) {
			case '/':
			case '\\':
			case '#':
				predicate = parsePredicateXPATH(["[","@basename","!=","''"," ","and"," ","@extension","==","''","]"]);
				break;				
			case ".":
				tokens.shift();
				switch(tokens[0]) {
				case '/':
				case '\\':
				case '#':
					predicate = parsePredicateXPATH(["[","@basename","!=","''"," ","and"," ","@extension","==","'.'","]"]);
					break;
				case '*':
					predicate = parsePredicateXPATH(["[","@basename","!=","''"," ","and"," ","@extension","=~","[^\.]","]"]);
					break;
				default:
					aux = [];
					while (!/^\/$|^\\$|^#$/.test(tokens[0])) {
						aux.push(tokens.shift());
					}
					parsePredicateXPATH(["[","@basename","!=","''"," ","and"," ","@extension","==","'."+aux.join("")+"'","]"]);
					break;						
				}
				break;
			default:
				expect && expect(true).toBe(false);
				break;
			}
			axis = Path.Axis.CHILD;
			break;
		case "**":
			axis = Path.Axis.DESCENDANT;
			nodetest = "folder";
			break;
		default:
			aux = [];
			while (!/^\/$|^\\$|^#$|^\.$/.test(tokens[0])) {
				aux.push(tokens.shift());
			}
			switch(tokens[0]) {
			case '/':
			case '\\':
			case '#':
				parsePredicateXPATH(["[","@basename","==","'"+aux.join("")+"'"," ","and"," ","@extension","==","''","]"]);
				break;
			case '.':
				tokens.shift();
				switch(tokens[0]) {
				case '/':
				case '\\':
				case '#':
					parsePredicateXPATH(["[","@basename","==","'"+aux.join("")+"'"," ","and"," ","@extension","==","'.'","]"]);
					break;
				case "*":
					parsePredicateXPATH(["[","@basename","==","'"+aux.join("")+"'"," ","and"," ","@extension","=~","[^\.]","]"]);
					break;
				default:
					aux2 = [];
					while (!/^\/$|^\\$|^#$/.test(tokens[0])) {
						aux2.push(tokens.shift());
					}
					parsePredicateXPATH(["[","@basename","==","'"+aux.join("")+"'"," ","and"," ","@extension","==","'"+aux2.join("")+"'","]"]);
					break;					
				}
			}
			break;								
		}
		if (!nodetest) {
			switch(tokens[0]) {
			case '/':
			case '\\':
				nodetest = "folder";
				break;
			case '#':
				nodetest = "file";
				break;
			default:
				expect && expect(true).toBe(false);
				break;
			}
		}
		return [ axis, nodetest, predicate ];
	};

	var toStringGLOB =
	/**
	 * 
	 */
	function Path$toStringGLOB(array) {

	};

	var parsePartXPATH =
	/**
	 * @param {Array}
	 *            tokens
	 * @return {Array}
	 */
	function Path$parsePartXPATH(tokens) {
		var token, axis, nodetest, predicate = undefined;
		if (token[0] === '/') {
			axis = Path.ANCESTOR;
			nodetest = "*";
			return [axis,nodetest];
		}
		token = tokens.shift();
		switch(tokens[0]) {
		case "::":
			tokens.shift();
			switch(token) {
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
			token = tokens.shift();
			break;
		}
		switch (token) {
		case ".":
			expect && expect(axis).toBeUndefined();
			token.shift();
			if (token[0] === '.') {
				axis = Path.Axis.PARENT;
				nodetest = "*";
			} else {
				axis = Path.Axis.SELF;
				nodetest = "*";
			}
			break;
		case "..":
			expect && expect(axis).toBeUndefined();
			break;
		default:
			axis = Path.CHILD;
			var aux = [token];
			expect && expect(!/[\[\]()\/<~!=>\s]/.test(token)).toBe(false);
			while (!/[\[\]()\/<~!=>\s]/.test(token)) {
				token = tokens.shift();
				aux.push(token);
			}
			nodetest = aux.join("");
			if (nodetest.charAt(0) === '@') {
				expect && expect(axis).toBeUndefined();
				axis = Path.ATTRIBUTE;
				nodetest = nodetest.substr(1);
			} else {
				if (!axis) {
					axis = Path.CHILD;
				}
			}
			break;
		}
		if (tokens[0] === '[') {
			predicate = parsePredicateXPATH(tokens);
		}
		return [axis,nodetest,predicate];
	};

	var parseFragment =
	/**
	 * @param {number}
	 *            type
	 * @param {string}
	 *            fragment
	 * @return {Array}
	 */
	function Path$parseFragment(type, tokens) {
		var result = [type];
		switch (type) {
		case Path.Type.GLOB:
			while (tokens[0] !== ' #') {
				result.push(parsePartGLOB(tokens));
				if (tokens[0] === '/' || tokens[0] === '\\') {
					tokens.shift();
				}
			}
			break;
		case Path.Type.XPATH:
			while (tokens[0] !== '#') {
				result.push(parsePartXPATH(tokens));
				if (tokens[0] === '/') {
					tokens.shift();
				}
			}
			break;
		case Path.Type.JPATH:
			while (tokens[0] !== '#') {
				result.push(parsePartJPATH(tokens));
				if (tokens[0] === '.') {
					tokens.shift();
				}
			}
			break;
		default:
			expect && expect(true).toBe(false);
			break;
		}
		return result;
	};

	var parsePath =
	/**
	 * @param {string}
	 *            path
	 */
	function Path$parsePath(path) {
		var tokens = path.match(/\s+|\.|\[|\]|\(|\)|\/|\\|[<~!=>]]+|[^\s\.[\]()\/\\<~!=>]+/);
		var protocol = null;
		var authority = null;
		if (tokens[1] === "://") {
			protocol = tokens.shift();
			switch(protocol) {
			case "file":
			case "http":
				break;
			default:
				throw new Error("unknown protocol: "+protocol);
			}
			tokens.shift();
			authority = tokens.shift();
			if (tokens[0] !== '/') {
				throw new Error("missing pathname in URL");
			}
		}
		var fragment = [];
		var type = Path.Type.GLOB_ABSOLUTE;
		fragment.push(parseFragment(type, tokens);
		while (tokens.length > 0) {
			var token = tokens.shift();
			expect && expect(token).toBe('#');
			if (tokens[0] === '\\') {
				tokens.shift();
				type = Path.Type.GLOB_ABSOLUTE;
			} else if (tokens[0] === '.' && tokens[1] === '\\') {
				type = Path.Type.GLOB_RELATIVE;
			} else if (tokens[0] === '/') {
				tokens.shift();
				if (tokens[0] === '$') {
					type = Path.Type.JPATH_ABSOLUTE;
				} else {
					type = Path.Type.XPATH_ABSOLUTE;
				}
			} else if (token[0] === '$') {
				type = Path.Type.JPATH_RELATIVE;
			} else {
				type = Path.Type.XPATH_RELATIVE;
			}
			fragment.push(parseFragment(type, tokens);
		}
		return fragment;
	};

