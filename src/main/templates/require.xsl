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

<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x="http://www.example.com/webapp"
	xmlns:xhtml="http://www.w3.org/1999/xhtml">
	<xsl:output method="html" />
	<xsl:template match="/x:webapp">
		<html>
			<head>
				<title>
					<xsl:value-of select="x:main" />
				</title>
				<script src="/lib/require.js">
					<xsl:attribute name="data-main"><xsl:value-of
						select="x:main" /></xsl:attribute>
				</script>
			</head>
			<xsl:copy-of select="xhtml:body" />
		</html>
	</xsl:template>
</xsl:stylesheet>
