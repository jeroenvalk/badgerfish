<?xml version="1.0" encoding="UTF-8"?>
<!-- Edited by XMLSpy® -->
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<div>
			<h2>My CD Collection</h2>
			<table border="1">
				<tr bgcolor="#9acd32">
					<th style="text-align:left">Title</th>
					<th style="text-align:left">Artist</th>
				</tr>
				<xsl:for-each select="catalog/cd">
					<tr>
						<xsl:if test="@require">
							<xsl:attribute name="require"><xsl:value-of
								select="@require" /></xsl:attribute>
						</xsl:if>
						<xsl:if test="@chain">
							<xsl:attribute name="chain"><xsl:value-of
								select="@chain" /></xsl:attribute>
						</xsl:if>
						<td>
							<xsl:value-of select="title" />
						</td>
						<td>
							<xsl:value-of select="artist" />
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>
</xsl:stylesheet>
