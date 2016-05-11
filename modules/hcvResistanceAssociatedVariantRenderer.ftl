<#-- null handling GLUE result element macro -->
<#macro elem tag expr>
<#if (expr?eval) ??>
<${tag}>${expr?eval}</${tag}>
<#else>
<${tag} glueType="Null"/>
</#if>
</#macro>

<resistance-associated-variant>
	<name>${name}</name>
	<referenceSequence>${featureLoc.referenceSequence.name}</referenceSequence>
	<feature>${featureLoc.feature.name}</feature>
	<pattern>${regex}</pattern>
    <@elem tag="effector_cell_culture_condition" expr="epitope_effector_cell_culture_condition"/>
</resistance-associated-variant>