<?xml version="1.0" encoding="ISO-8859-1"?>
<!-- Edited by XMLSpy® -->
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<html>
			<head>
				<title>test page</title>
				<meta charset="utf-8" />
				<base href="." />
				<script type="text/javascript"
					src="http://alexgorbatchev.com/pub/sh/current/scripts/shCore.js"></script>
				<script type="text/javascript"
					src="http://alexgorbatchev.com/pub/sh/current/scripts/shBrushJScript.js"></script>
				<link href="http://alexgorbatchev.com/pub/sh/current/styles/shCore.css"
					rel="stylesheet" type="text/css" />
				<link
					href="http://alexgorbatchev.com/pub/sh/current/styles/shThemeDefault.css"
					rel="stylesheet" type="text/css" />
			</head>
			<body>
				<pre class="brush: js">
					<xsl:value-of select="." />
				</pre>
				<script type="text/javascript">
					SyntaxHighlighter.all()
				</script>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
