<#-- null handling GLUE result element macro -->
<#macro elem tag expr type="String" context="">
<#if (expr?eval) ??>
	<${tag} glueType="${type}">${expr?eval}</${tag}>
<#else>
	<${tag} glueType="Null"/>
</#if>
</#macro>

<resistance_associated_variant>
	<name>${name}</name>
	<referenceSequence>${featureLoc.referenceSequence.name}</referenceSequence>
	<feature>${featureLoc.feature.name}</feature>
	<pattern>${regex}</pattern>
	<#list varAlmtNotes as varAlmtNote>
		<alignmentNote glueType="Object[]">
			<alignmentName>${varAlmtNote.alignment.name}</alignmentName>
		    <@elem tag="ncbiCuratedFrequencyPct" expr="context.ncbi_curated_frequency" type="Double" context=varAlmtNote/>
		</alignmentNote>
	</#list>
</resistance_associated_variant>