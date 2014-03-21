<?xml version="1.0" encoding="ISO-8859-1"?>
<!-- Copyright © 2014 dr. ir. Jeroen M. Valk -->

<!-- This file is part of Badgerfish CPX. Badgerfish CPX is free software: 
	you can redistribute it and/or modify it under the terms of the GNU Lesser 
	General Public License as published by the Free Software Foundation, either 
	version 3 of the License, or (at your option) any later version. Badgerfish 
	CPX is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
	without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
	PURPOSE. See the GNU Lesser General Public License for more details. You 
	should have received a copy of the GNU Lesser General Public License along 
	with Badgerfish CPX. If not, see <http://www.gnu.org/licenses />. -->

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:variable name="prefix"
		select="'http://alexgorbatchev.com/pub/sh/current/'" />
	<xsl:template match="/">
		<html>
			<head>
				<title>test page</title>
				<meta charset="utf-8" />
				<base href="." />
				<script type="text/javascript">
					<xsl:attribute name="src"><xsl:value-of
						select="concat($prefix,'scripts/shCore.js')" /></xsl:attribute>
				</script>
				<xsl:choose>
					<xsl:when test="root/@brush='js'">
						<script type="text/javascript">
							<xsl:attribute name="src"><xsl:value-of
								select="concat($prefix,'scripts/shBrushJScript.js')" /></xsl:attribute>
						</script>
					</xsl:when>
					<xsl:when test="root/@brush='java'">
						<script type="text/javascript">
							<xsl:attribute name="src"><xsl:value-of
								select="concat($prefix,'scripts/shBrushJava.js')" /></xsl:attribute>
						</script>
					</xsl:when>
				</xsl:choose>
				<link rel="stylesheet" type="text/css">
					<xsl:attribute name="href"><xsl:value-of
						select="concat($prefix,'styles/shCore.css')" /></xsl:attribute>
				</link>
				<link rel="stylesheet" type="text/css">
					<xsl:attribute name="href"><xsl:value-of
						select="concat($prefix,'styles/shThemeDefault.css')" /></xsl:attribute>
				</link>
			</head>
			<body>
				<pre>
					<xsl:attribute name="class"><xsl:value-of
						select="concat('brush: ',root/@brush)" /></xsl:attribute>
					<xsl:value-of select="root" />
				</pre>
				<script type="text/javascript">
					SyntaxHighlighter.all()
				</script>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
